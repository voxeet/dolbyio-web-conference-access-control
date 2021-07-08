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

If you haven't done so already, create an account on [dolby.io](https://dolby.io/signup), it is free so do it today! Go to your dashboard and for the first application, get your `Consumer Key` and `Consumer Secret`.

Create a `.env` file at the root of this folder and insert your consumer key and secret like that:

```
CONSUMER_KEY=<Your consumer key>
CONSUMER_SECRET=<Your consumer secret>
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

## Docker Image

You can build your own Docker image with this project using the command:

```bash
docker build -t cat .
```

To run the container, you must provide the two environment variables `CONSUMER_KEY` and `CONSUMER_SECRET`. And you can map the port 8081 of the container to your local port 80.
```bash
docker run --rm -it -p 80:8081/tcp --env "CONSUMER_KEY=<value>" --env "CONSUMER_SECRET=<value>" cat:latest
```

Now you should be able to access the application from this page: http://localhost

You can also get the latest docker image from this repo at https://github.com/dolbyio-samples/dolbyio-web-conference-access-control/pkgs/container/dolbyio-web-conference-access-control

## Use this project

Open a first web browser at `http://localhost:8081`, provide a conference name and click Create. The conference ID will be provided to you in the second textbox. Copy that ID.

Open a second web browser, paste the conference ID that was just created and click Join. The client will request the backend to be invited with a limited set of permissions.
