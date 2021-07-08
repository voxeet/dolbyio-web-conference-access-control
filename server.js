var express = require('express');
const https = require("https");
const dotenv = require('dotenv');

const { Command } = require('commander');
const program = new Command();

dotenv.config();

var app = express();

// Parse POST requests as JSON payload
app.use(express.json());

// Serve static files
app.use(express.static('public'))

const CONSUMER_KEY = process.env.CONSUMER_KEY ?? '';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET ?? '';

if (CONSUMER_KEY.length <= 0 || CONSUMER_SECRET.length <= 0) {
    throw new Error('The Consumer Key and/or Secret are missing!');
}

/**
 * Sends a POST request
 * @param {string} hostname
 * @param {string} path 
 * @param {*} headers 
 * @param {string} body 
 * @returns A JSON payload object through a Promise.
 */
const postAsync = (hostname, path, headers, body) => {
    return new Promise(function(resolve, reject) {
        const options = {
            hostname: hostname,
            port: 443,
            path: path,
            method: 'POST',
            headers: headers
        };
        
        const req = https.request(options, res => {
            console.log(`[POST] ${res.statusCode} - https://${hostname}${path}`);

            let data = '';
            res.on('data', (chunk) => {
                data = data + chunk.toString();
            });

            res.on('end', () => {
                const json = JSON.parse(data);
                resolve(json);
            })
        });
        
        req.on('error', error => {
            console.error('error', error);
            reject(error);
        });
        
        req.write(body);
        req.end();
    });
};

/**
 * Gets a JWT token for authorization.
 * @param {string} hostname 
 * @param {string} path 
 * @returns a JWT token.
 */
const getAccessTokenAsync = (hostname, path) => {
    const body = "grant_type=client_credentials";

    const authz = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
        'Authorization': 'Basic ' + authz,
        'Content-Length': body.length
    };

    return postAsync(hostname, path, headers, body);
}

// See: https://docs.dolby.io/interactivity/reference/authentication#postoauthtoken-1
const getClientAccessTokenAsync = () => {
    console.log('Get Client Access Token');
    return getAccessTokenAsync('session.voxeet.com', '/v1/oauth2/token');
}

// See: https://docs.dolby.io/interactivity/reference/authentication#jwt
const getAPIAccessTokenAsync = () => {
    console.log('Get API Access Token');
    return getAccessTokenAsync('api.voxeet.com', '/v1/auth/token');
}

// See: https://docs.dolby.io/interactivity/reference/conference#postconferencecreate
const createConferenceAsync = async (alias, ownerExternalId) => {
    const body = JSON.stringify({
        alias: alias,
        parameters: {
            dolbyVoice: true,
            liveRecording: false
        },
        ownerExternalId: ownerExternalId
    });
    
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt.access_token,
        'Content-Length': body.length
    };

    return await postAsync('api.voxeet.com', '/v2/conferences/create', headers, body);
};

// See: https://docs.dolby.io/interactivity/reference/conference#postconferenceinvite
const getInvitationAsync = async (conferenceId, externalId) => {
    const participants = {};
    participants[externalId] = {
        permissions: [
            "INVITE",
            "JOIN",
            "SEND_AUDIO",
            "SEND_VIDEO",
            "SHARE_SCREEN",
            "SHARE_VIDEO",
            "SHARE_FILE",
            "SEND_MESSAGE",
            //"RECORD",
            //"STREAM",
            //"KICK",
            //"UPDATE_PERMISSIONS"
        ]
    };


    const body = JSON.stringify({
        participants: participants
    });
    
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt.access_token,
        'Content-Length': body.length
    };

    return await postAsync('api.voxeet.com', `/v2/conferences/${conferenceId}/invite`, headers, body);
};


app.get('/access-token', function (request, response) {
    console.log(`[GET] ${request.url}`);

    getClientAccessTokenAsync()
        .then(accessToken => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify(accessToken));
        })
        .catch(() => {
            response.status(500);
        });
});

app.post('/conference', function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const alias = request.body.alias;
    const ownerExternalId = request.body.ownerExternalId;

    createConferenceAsync(alias, ownerExternalId)
        .then(conference => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify(conference));
        })
        .catch(() => {
            response.status(500);
        });
});

app.post('/get-invited', function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const conferenceId = request.body.conferenceId;
    const externalId = request.body.externalId;

    getInvitationAsync(conferenceId, externalId)
        .then(accessToken => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify({accessToken: accessToken[externalId]}));
        })
        .catch(() => {
            response.status(500);
        });
});


// Extract the port number from the command argument
program.option('-p, --port <portNumber>', 'Port number to start the HTTP server on.');
program.parse(process.argv);

let portNumber = 8081; // Default port number
const options = program.opts();
if (options.port) {
    const p = parseInt(options.port, 10);
    if (!isNaN(p)) {
        portNumber = p;
    }
}

// Starts an HTTP server
var server = app.listen(portNumber, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log("Dolby.io sample app listening at http://%s:%s", host, port);
});
