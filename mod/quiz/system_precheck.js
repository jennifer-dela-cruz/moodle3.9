// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * JavaScript library for the quiz system precheck module.
 *
 * @package    mod
 * @subpackage quiz
 * @copyright  1999 onwards Martin Dougiamas  {@link http://moodle.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

const delay_duration = 3000; // 3000 milliseconds = 3 seconds (adjust as needed)
const identityFacePrechecksButton = document.getElementById('identityfaceprechecks');
compareChromeVersionPass = false;
checkScreenSharingSupportPass = false;
getVideoDevicePass = false;
getMicrophonePass = false;
goFullscreenPass = false;

function delayFunction(callback) {
    const delay_duration = 3000;
    setTimeout(callback, delay_duration);
}

function compareChromeVersion() {
    const pLabel = "2. Web browser check: ";
    const compareChromeVersion_check = document.getElementById('compareChromeVersion_check');
    const compareChromeVersion_cross = document.getElementById('compareChromeVersion_cross');

    // Check if the browser is Google Chrome
    if (typeof chrome !== 'undefined' && navigator.vendor.includes('Google')) {
        const chromeVersion = parseInt(navigator.userAgent.match(/Chrome\/(\d+)/)[1]);
        const definedVersion = 100; // Change this to the version you want to compare against

        if (chromeVersion === definedVersion) {
            document.getElementById('compareChromeVersion').textContent = pLabel + "This is Google Chrome and it's version " + definedVersion + ".";
            compareChromeVersionPass = true;
            compareChromeVersion_check.style.display = 'inline';
        } else if (chromeVersion < definedVersion) {
            document.getElementById('compareChromeVersion').textContent = pLabel + "This is Google Chrome, but the version is lower than " + definedVersion + ".";
            compareChromeVersionPass = false;
            compareChromeVersion_cross.style.display = 'inline';
        } else {
            document.getElementById('compareChromeVersion').textContent = pLabel + "This is Google Chrome, but the version is higher than " + definedVersion + ".";
            compareChromeVersionPass = true;
            compareChromeVersion_check.style.display = 'inline';
        }
    } else {
        document.getElementById('compareChromeVersion').textContent = pLabel + "This is not Google Chrome.";
        compareChromeVersionPass = false;
        compareChromeVersion_cross.style.display = 'inline';
    }

    console.log('compareChromeVersionPass: ', compareChromeVersionPass);
    showNextButton();
}

function checkScreenSharingSupport() {
    const pLabel = "3. Screen sharing support check: ";
    const checkScreenSharingSupport_check = document.getElementById('checkScreenSharingSupport_check');
    const checkScreenSharingSupport_cross = document.getElementById('checkScreenSharingSupport_cross');

    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Supported
        document.getElementById('checkScreenSharingSupport').textContent = pLabel + "Screen sharing is supported in this browser.";
        checkScreenSharingSupportPass = true;
        checkScreenSharingSupport_check.style.display = 'inline';
    } else {
        // Not supported
        document.getElementById('checkScreenSharingSupport').textContent = pLabel + "Screen sharing is not supported in this browser.";
        checkScreenSharingSupportPass = false;
        checkScreenSharingSupport_cross.style.display = 'inline';
    }
    console.log('checkScreenSharingSupportPass: ', checkScreenSharingSupportPass);
    showNextButton();
}


async function getVideoDevice() {
    const pLabel = "4. Video device check: ";
    const getVideoDevice_check = document.getElementById('getVideoDevice_check');
    const getVideoDevice_cross = document.getElementById('getVideoDevice_cross');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTracks = stream.getVideoTracks();

        if (videoTracks.length > 0) {
            const defaultVideoDevice = videoTracks[0].label;
            document.getElementById('getVideoDevice').textContent = pLabel + 'Default Video Device: ' + defaultVideoDevice;
            getVideoDevicePass = true;
            getVideoDevice_check.style.display = 'inline';
        } else {
            document.getElementById('getVideoDevice').textContent = pLabel + 'No video device found.';
            getVideoDevicePass = false;
            getVideoDevice_cross.style.display = 'inline';
        }

        stream.getTracks().forEach(track => track.stop()); // Stop the stream
    } catch (error) {
        console.error('Error accessing video device:', error);
        document.getElementById('getVideoDevice').textContent = pLabel + 'Error accessing video device. Please check your browser permissions.';
        getVideoDevicePass = false;
        getVideoDevice_cross.style.display = 'inline';
    }
    console.log('getVideoDevicePass: ', getVideoDevicePass);
    showNextButton();
}

async function getMicrophone() {
    const pLabel = "5. Microphone device check: ";
    const getMicrophone_check = document.getElementById('getMicrophone_check');
    const getMicrophone_cross = document.getElementById('getMicrophone_cross');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTracks = stream.getAudioTracks();

        if (audioTracks.length > 0) {
            const defaultMicrophone = audioTracks[0].label;
            document.getElementById('getMicrophone').textContent = pLabel + 'Default Microphone: ' + defaultMicrophone;
            getMicrophonePass = true;
            getMicrophone_check.style.display = 'inline';
        } else {
            document.getElementById('getMicrophone').textContent = pLabel + 'No microphone found.';
            getMicrophonePass = false;
            getMicrophone_cross.style.display = 'inline';
        }

        stream.getTracks().forEach(track => track.stop()); // Stop the stream
    } catch (error) {
        console.error('Error accessing microphone:', error);
        document.getElementById('getMicrophone').textContent = pLabel + 'Error accessing microphone. Please check your browser permissions.';
        getMicrophonePass = false;
        getMicrophone_cross.style.display = 'inline';
    }
    console.log('getMicrophonePass: ', getMicrophonePass);
    showNextButton();
}

// Tested on Google Chrome, Google Chrome Canary, Firefox, Safari
function goFullscreen() {
    const pLabel = "6. Trigger fullscreen: ";
    const element = document.documentElement; // Fullscreen the entire document
    const fullscreenButton = document.getElementById('goFullscreen_btn');
    const goFullscreen_check = document.getElementById('goFullscreen_check');
    const goFullscreen_cross = document.getElementById('goFullscreen_cross');

    if (element.requestFullscreen) {
        element.requestFullscreen().then(() => {
            document.getElementById('goFullscreen').textContent = pLabel + "Fullscreen mode activated successfully!";
            goFullscreenPass = true;
            fullscreenButton.style.display = 'none';
            console.log('goFullscreenPass: ', goFullscreenPass);
            goFullscreen_check.style.display = 'inline';
            showNextButton();
        }).catch((error) => {
            document.getElementById('goFullscreen').textContent = pLabel + "Failed to enter fullscreen mode: " + error;
            goFullscreenPass = false;
            console.log('goFullscreenPass: ', goFullscreenPass);
            goFullscreen_cross.style.display = 'inline';
            showNextButton();
        });
    } else if (element.mozRequestFullScreen) { /* Firefox */
        element.mozRequestFullScreen();
        document.getElementById('goFullscreen').textContent = pLabel + "Fullscreen mode activated successfully!";
        goFullscreenPass = true;
        fullscreenButton.style.display = 'none';
        console.log('goFullscreenPass: ', goFullscreenPass);
        goFullscreen_check.style.display = 'inline';
        showNextButton();
    } else if (element.webkitRequestFullscreen) { /* Safari */
        element.webkitRequestFullscreen();
        document.getElementById('goFullscreen').textContent = pLabel + "Fullscreen mode activated successfully!";
        goFullscreenPass = true;
        fullscreenButton.style.display = 'none';
        console.log('goFullscreenPass: ', goFullscreenPass);
        goFullscreen_check.style.display = 'inline';
        showNextButton();
    } else {
        document.getElementById('goFullscreen').textContent = pLabel + "Fullscreen mode is not supported in this browser.";
        goFullscreenPass = false;
        console.log('goFullscreenPass: ', goFullscreenPass);
        goFullscreen_cross.style.display = 'inline';
        showNextButton();
    }
}

delayFunction(compareChromeVersion);
delayFunction(getVideoDevice);
delayFunction(getMicrophone);
delayFunction(checkScreenSharingSupport);
delayFunction(showNextButton);

// Show the next button if all are passed
function showNextButton() {
    if (jsCheckMessagePass && compareChromeVersionPass && checkScreenSharingSupportPass && getVideoDevicePass && getMicrophonePass && goFullscreenPass) {
        identityFacePrechecksButton.style.display = 'inline';
    }
}
