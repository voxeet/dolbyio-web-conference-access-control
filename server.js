var express = require('express');
const dotenv = require('dotenv');
const dolbyio = require('@dolbyio/dolbyio-rest-apis-client');

const { Command } = require('commander');
const program = new Command();

dotenv.config();

var app = express();

// Parse POST requests as JSON payload
app.use(express.json());

// Serve static files
app.use(express.static('public'))

const APP_KEY = process.env.APP_KEY ?? '';
const APP_SECRET = process.env.APP_SECRET ?? '';

if (APP_KEY.length <= 0 || APP_SECRET.length <= 0) {
    throw new Error('The App Key and/or Secret are missing!');
}

const createConference = async (alias, ownerExternalId) => {
    const options = {
        ownerExternalId: ownerExternalId,
        alias: alias,
        dolbyVoice: true,
        liveRecording: false
    };

    const jwt = await dolbyio.authentication.getApiAccessToken(APP_KEY, APP_SECRET);
    return await dolbyio.communications.conference.createConference(jwt, options);
};

const getInvitation = async (conferenceId, externalId) => {
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
    
    const jwt = await dolbyio.authentication.getApiAccessToken(APP_KEY, APP_SECRET);
    return await dolbyio.communications.conference.invite(jwt, conferenceId, participants);
};

app.get('/access-token', function (request, response) {
    console.log(`[GET] ${request.url}`);

    dolbyio.communications.authentication.getClientAccessToken(APP_KEY, APP_SECRET)
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

    createConference(alias, ownerExternalId)
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

    getInvitation(conferenceId, externalId)
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
