
const delay_duration = 3000; // 3000 milliseconds = 3 seconds (adjust as needed)
const check_duration = 30000; // 30 seconds = 30000 milliseconds

checkScreenSharingSupportPass = false;
getVideoDevicePass = false;
getMicrophonePass = false;
let screenSharingActive = false;

// UPDATE THIS!!!
// For violation logging
var quiz_id = 2;
var user_id = 3;
var evidence_msg = 'NO_VIOLATION';

function delayFunction(callback) {
    const delay_duration = delay_duration;
    setTimeout(callback, delay_duration);
}

// Function to check if screen sharing is not active and start it
// Logs if screensharing was ended by the user
async function startScreenSharingIfNeeded() {
    const videoElement = document.getElementById('screenShareVideo');

    // Check if the video element is not currently sharing a screen
    if (!screenSharingActive && !videoElement.srcObject) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        // Update the video element with the new stream
        videoElement.srcObject = stream;

        // Set the screen sharing active variable to true
        screenSharingActive = true;
        console.log('checkScreenSharingSupportPass: ', screenSharingActive);


        // Listen for the 'ended' event on the tracks to detect if the user stops sharing
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          stopScreenSharing();
        });

      } catch (error) {
        console.error('Error accessing screen:', error);

        // log error
        screenSharingActive = false;
        console.log('checkScreenSharingSupportPass: ', screenSharingActive);
        evidence_msg = 'SCREENSHARE_FAILED';
        captureAndUpload(quiz_id, user_id, evidence_msg);
      }
    }
}

// Function to stop screen sharing
function stopScreenSharing() {
    const videoElement = document.getElementById('screenShareVideo');

    // Stop the tracks and reset the video element
    if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
        screenSharingActive = false;
    }
    console.log('Screensharing has ended.');
    console.log('checkScreenSharingSupportPass: ', screenSharingActive);
    evidence_msg = 'SCREENSHARE_STOPPED';
    captureAndUpload(quiz_id, user_id, evidence_msg);
}

// Function to check if the microphone is enabled
async function checkMicrophone() {
    try {
        // Try to get user media with audio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // If successful, the microphone is enabled
        console.log('Microphone is enabled:', stream);
        getMicrophonePass = true;
        console.log('getMicrophonePass: ', getMicrophonePass);

        // Stop the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
    } catch (error) {
        // If there's an error, the microphone may not be enabled
        console.error('Error accessing microphone:', error);
        getMicrophonePass = false;
        console.log('getMicrophonePass: ', getMicrophonePass);
        evidence_msg = 'MICROPHONE_FAILED';
        captureAndUpload(quiz_id, user_id, evidence_msg);
    }
}

// Function to check if the camera is enabled
async function checkCamera() {
    try {
        // Try to get user media with video
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // If successful, the camera is enabled
        console.log('Camera is enabled:', stream);
        getMicrophonePass = true;
        console.log('getMicrophonePass: ', getMicrophonePass);

        // Stop the stream to release the camera
        stream.getTracks().forEach(track => track.stop());
    } catch (error) {
        // If there's an error, the camera may not be enabled
        console.error('Error accessing camera:', error);
        getMicrophonePass = false;
        console.log('getVideoDevicePass: ', getVideoDevicePass);
        evidence_msg = 'CAMERA_FAILED';
        captureAndUpload(quiz_id, user_id, evidence_msg);
    }
}

// Tested on Google Chrome, Google Chrome Canary, Firefox, Safari
function goFullscreen() {
    const pLabel = "Trigger fullscreen: ";
    const element = document.documentElement; // Fullscreen the entire document

    if (element.requestFullscreen) {
        element.requestFullscreen().then(() => {
            console.log(pLabel + "Fullscreen mode activated successfully!");
            goFullscreenPass = true;
            console.log('goFullscreenPass: ', goFullscreenPass);

        }).catch((error) => {
            console.log(pLabel + "Failed to enter fullscreen mode: " + error);
            goFullscreenPass = false;
            console.log('goFullscreenPass: ', goFullscreenPass);
            evidence_msg = 'FULLSCREEN_FAILED';
            captureAndUpload(quiz_id, user_id, evidence_msg);
        });
    } else if (element.mozRequestFullScreen) { /* Firefox */
        element.mozRequestFullScreen();
        console.log(pLabel + "Fullscreen mode activated successfully!");
        goFullscreenPass = true;
        console.log('goFullscreenPass: ', goFullscreenPass);

    } else if (element.webkitRequestFullscreen) { /* Safari */
        element.webkitRequestFullscreen();
        console.log(pLabel + "Fullscreen mode activated successfully!");
        goFullscreenPass = true;
        console.log('goFullscreenPass: ', goFullscreenPass);

    } else {
        console.log(pLabel + "Fullscreen mode is not supported in this browser.");
        goFullscreenPass = false;
        console.log('goFullscreenPass: ', goFullscreenPass);
        evidence_msg = 'FULLSCREEN_NOT_SUPPORTED';
        captureAndUpload(quiz_id, user_id, evidence_msg);
    }

    // Close the modal after triggering fullscreen
    closeModal();
}

// Function to open the modal
function openModal() {
    document.getElementById('myModal').style.display = 'flex';
}

// Function to close the modal
function closeModal() {
    document.getElementById('myModal').style.display = 'none';
}

// Event listener for changes in fullscreen mode (browser-specific)
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

// Function to handle changes in fullscreen mode
// Logs if fullscreen mode was ended by the user
function handleFullscreenChange() {
  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
        // The user exited fullscreen mode
        console.log('User exited fullscreen mode');
        goFullscreenPass = false;
        console.log('goFullscreenPass: ', goFullscreenPass);
        evidence_msg = 'FULLSCREEN_STOPPED';
        captureAndUpload(quiz_id, user_id, evidence_msg);
  }
}

// Call the functions sequentially after a 5-second delay
window.addEventListener('load', checkMicrophone);
window.addEventListener('load', () => {
    setTimeout(() => {
        checkCamera();
      setTimeout(() => {
        startScreenSharingIfNeeded();
            // setTimeout(goFullscreen(), delay_duration);
      }, delay_duration);
    }, delay_duration);
  });

// for fullscreen button
// THIS HAS ERROR
window.addEventListener('load', openModal);

// Disabling this as the this might be annoying
// Set up the interval (60 seconds = 60000 milliseconds)
// setInterval(startScreenSharingIfNeeded, check_duration);
// setInterval(checkMicrophone, check_duration);
// setInterval(checkMicrophone, checkCamera);