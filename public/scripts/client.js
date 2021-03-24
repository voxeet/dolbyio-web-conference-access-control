const avengersNames = ['Thor', 'Cap', 'Tony Stark', 'Black Panther', 'Black Widow', 'Hulk', 'Spider-Man'];
let randomName = avengersNames[Math.floor(Math.random() * avengersNames.length)];

const main = async () => {
  /* Event handlers */

  // When a video stream is added to the conference
  VoxeetSDK.conference.on('streamAdded', (participant, stream) => {
    if (stream.type === 'ScreenShare') {
      return addScreenShareNode(stream);
    }

    console.log(`${Date.now()} - streamAdded from ${participant.info.name} (${participant.id})`);
    console.log(stream);
    console.log(stream.getTracks());
    
    if (stream.getVideoTracks().length) {
      // Only add the video node if there is a video track
      addVideoNode(participant, stream);
    }
    
    addParticipantNode(participant);
  });

  // When a video stream is removed from the conference
  VoxeetSDK.conference.on('streamRemoved', (participant, stream) => {
    if (stream.type === 'ScreenShare') {
      return removeScreenShareNode();
    }

    console.log(`${Date.now()} - streamRemoved from ${participant.info.name} (${participant.id})`);
    
    removeVideoNode(participant);
    removeParticipantNode(participant);
  });

  // When a video stream is updated from the conference
  VoxeetSDK.conference.on('streamUpdated', (participant, stream) => {
    if (stream.type === 'ScreenShare') return;

    console.log(`${Date.now()} - streamUpdated from ${participant.info.name} (${participant.id})`);
    console.log(stream);
    console.log(stream.getTracks());
    
    if (stream.getVideoTracks().length) {
      // Only add the video node if there is a video track
      addVideoNode(participant, stream);
    } else {
      removeVideoNode(participant);
    }
  });

  // Get an access token from the backend
  const url = '/access-token';
  fetch(url)
    .then(d => d.json())
    .then(jwt => VoxeetSDK.initializeToken(jwt.access_token, () => fetch(url).then(jwt => jwt.access_token)) )
    .then(() => VoxeetSDK.session.open({ name: randomName, externalId: randomName }).then(() => initUI()));

};

main();
