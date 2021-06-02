# Sample Application for Conference Access Control

Sample application that uses the Web SDK with Enhanced Conference Access Control. This project is based on the [voxeet-sdk-browser-gettingstarted](https://github.com/voxeet/voxeet-sdk-browser-gettingstarted) repo.

## Setup

Clone this repo:
```bash
git clone https://github.com/dolbyio-samples/dolbyio-web-conference-access-control
```

In the folder you've created, run the following command to install all the package dependencies:

```bash
npm install
```

Create a new application in your dashboard on dolby.io, then go to the settings, check **Enhanced Conference Access Control** in the Security and click SAVE CHANGES.

![Enhanced Conference Access Control](enhanced-conference-access-control.png)

In the `server.js` file, locate and replace the **CONSUMER_KEY** and **CONSUMER_SECRET** with what's provided to you in the dashboard.

```javascript
// Enter your Consumer Key and Secret from the dolby.io dashboard
const CONSUMER_KEY = 'CONSUMER_KEY';
const CONSUMER_SECRET = 'CONSUMER_SECRET';
```

Now, start the project with the npm command:

```bash
npm start
```

Or directly with the node command:

```bash
node server.js --port 8081
```

Then you can access the web page at `http://localhost:8081`. You can change the port number with the flag `--port` in the node command.

## Use this project

Open a first web browser at `http://localhost:8081`, provide a conference name and click Create. The conference ID will be provided to you in the second textbox. Copy that ID.

Open a second web browser, paste the conference ID that was just created and click Join. The client will request the backend to be invited with a limited set of permissions.
