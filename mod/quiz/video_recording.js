/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

'use strict';

/* globals MediaRecorder */
// let avoids the variable to be redeclared
let mediaRecorder;
let recordedBlobs;
let tempRecordedBlobs;

// Make constant all important div elements
// span#errorMsg = divtag # div id
const codecPreferences = document.querySelector('#codecPreferences');
const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');

// Can enable this for troubleshooting purposes
// function downloadVideo(blob) {
//   // I think this creates a temporary object for download
//   // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.style.display = 'none';
//   a.href = url;
//   a.download = 'test.webm';
//   document.body.appendChild(a);
//   a.click();
//   setTimeout(() => {
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
//   }, 100);
// }

/////////////////////////////////////////////////////////////////
// This is for sending the data to Lambda function
/////////////////////////////////////////////////////////////////
function sendData(recordedBlob) {

  var dataToCloud = new FormData();
  dataToCloud.append('upou-video', recordedBlob)

  var requestToCloud = new XMLHttpRequest();
  var lambdaURL = '';

  requestToCloud.onload = function() {
    console.log('request status', requestToCloud.responseText)
    console.log('Data sent to Lambda', recordedBlob)
  }

  requestToCloud.open('POST', lambdaURL);
  requestToCloud.send(recordedBlob);

}

/////////////////////////////////////////////////////////////////
// This is triggered after the recording stopped
/////////////////////////////////////////////////////////////////
function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  console.log('event data size', event.data.size);

  // process data only if more than 50 KB
  // if (event.data && event.data.size > 0) {
  if (event.data && event.data.size > 51200) {
    recordedBlobs.push(event.data);

    // Create a new blob for the recordedBlobs from recording
    tempRecordedBlobs.push(event.data);
    console.log("tempRecordedBlobs push")
    console.log(tempRecordedBlobs)

    const tempBlob = new Blob(tempRecordedBlobs, {type: 'video/webm'});

    // Can enable this for troubleshooting purposes
    // Downloads the videos in 5 sec interval (excluding the blank ones)
    // downloadVideo(tempBlob);
    // console.log("Download recording...", tempBlob)

    // even if the upload is for the whole recording session (not 5 secs), it is still not viewable after uploading
    // the upload is working every 5 seconds but it is not viewable
    uploadRecording(tempBlob);
    console.log("Upload recording...", tempBlob)

    console.log('media recorder current state:', mediaRecorder.state);

    // Stop and start the video to get a playable video
    stopRecording();
    startRecording();
  }

}

/////////////////////////////////////////////////////////////////
// This is for uploading the videos (every 5 sec) to the cloud
/////////////////////////////////////////////////////////////////
function uploadRecording(blob){

  const userFile = blob;
  quiz_id = document.getElementById('quiz_id').value;
  user_id = document.getElementById('user_id').value;
  // var quiz_id = 2;
  // var user_id = 3;
  const custFileName = quiz_id + '_' + user_id + '_' + Date.now() + '.webm';

  console.log('custFileName: ' + custFileName);
  const bucket = 'upou-video-stream';
  const url = 'https://hdy3rohah6.execute-api.us-east-1.amazonaws.com/v1/' + bucket + '/' + custFileName;

  console.log('url: ' + url);

  const formData = new FormData();
  formData.append('key', userFile, custFileName);
  formData.append('bucket', bucket);

  console.log('formData: '+ formData)

  fetch(url, {
      method: "PUT",
      body: blob,
  })
  .then(res => res.body)
  .then(data => console.log('data: ' + data))
  .catch(err => console.log(err));

}

/////////////////////////////////////////////////////////////////
// This is the list of supported mime Types
/////////////////////////////////////////////////////////////////
function getSupportedMimeTypes() {
  const possibleTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/mp4;codecs=h264,aac',
  ];
  return possibleTypes.filter(mimeType => {
    return MediaRecorder.isTypeSupported(mimeType);
  });
}

//////////////////////////////////////////////////////////////////
// This function is called upon clicking the 'Start Recording'///
/////////////////////////////////////////////////////////////////
function startRecording() {
  // Put the recorded blobs into an array
  recordedBlobs = [];
  tempRecordedBlobs = [];

  // Get the selected mimeType value
  const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value;
  const options = {mimeType};

  try {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
    // Creates a new MediaRecorder object, given a MediaStream to record.
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  // Can see the below in the Developer Tools > Console
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  codecPreferences.disabled = true;

  // after pressing 'Stop Recording', the recorded blob length is only 1 - regardless of the length of the video
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };

  // ADDED THE BELOW FOR CHECKING
  mediaRecorder.onstart = (event) => {
    console.log('Recorder started: ', event);
    console.log('Recorded blobs so far after starting: ', recordedBlobs);
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event
  // This is fired when the MediaRecorder delivers media data to your application for its use.
  // The data is provided in a Blob object that contains the data.
  mediaRecorder.ondataavailable = handleDataAvailable;

  // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/start
  // The method start() begins recording media into one or more Blob objects
  // This will provide recording every 5 seconds
  mediaRecorder.start(5000);
  console.log('MediaRecorder started', mediaRecorder);

  console.log("startRecording function completed.");
}

/////////////////////////////////////////////////////////////////
// This function is called upon clicking the 'Stop Recording'///
////////////////////////////////////////////////////////////////
function stopRecording() {
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/stop
  // Used to stop media capture.
  mediaRecorder.stop();
  console.log('MediaRecorder stopped', mediaRecorder)
}

/////////////////////////////////////////////////////////////////////////////
// This function is called upon allowing the use of camera and microphone ///
////////////////////////////////////////////////////////////////////////////
function handleSuccess(stream) {
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  const gumVideo = document.querySelector('video#gum');
  gumVideo.srcObject = stream;

  // Creates the dropdown list of mimeTypes
  getSupportedMimeTypes().forEach(mimeType => {
    const option = document.createElement('option');
    option.value = mimeType;
    option.innerText = option.value;
    codecPreferences.appendChild(option);
  });
  codecPreferences.disabled = false;
}

//////////////////////////////////////////////////////////////////////
// This function is called upon clicking the 'Start camera' button ///
/////////////////////////////////////////////////////////////////////
async function init(constraints) {
  try {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // getUserMedia() method prompts the user for permission to use a media input which produces a MediaStream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}

//////////////////////////////////////////////////////////////////////
// This function is called upon clicking the 'Start camera' button ///
/////////////////////////////////////////////////////////////////////
async function startCamera() {
  const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
  const constraints = {
    audio: {
      echoCancellation: {exact: hasEchoCancellation}
    },
    video: {
      width: 1280, height: 720
    }
  };
  console.log('Using media constraints:', constraints);
  await init(constraints);
  console.log("startCamera function completed.");
  startRecording();
}

startCamera();