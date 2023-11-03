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

function delayFunction(callback) {
    const delay_duration = 3000;
    setTimeout(callback, delay_duration);
}

function compareChromeVersion() {
    const useragent = navigator.userAgent;
    const isChrome = /Chrome/.test(useragent) && /Google Inc/.test(navigator.vendor);

    if (isChrome) {
        const chromeVersion = parseInt(useragent.match(/Chrome\/(\d+)/)[1]);
        const definedVersion = 100; // Change this to the version you want to compare against
        const pLabel = "2. Web browser check: ";

        if (chromeVersion === definedVersion) {
            document.getElementById('compareChromeVersion').textContent = pLabel + "This is Google Chrome and it's version " + definedVersion;
            // document.getElementById('compareChromeVersion_hid').value = "1";
            // const test_value = document.getElementById('compareChromeVersion_hid').value;
            // alert(test_value);
        } else if (chromeVersion < definedVersion) {
            document.getElementById('compareChromeVersion').textContent = pLabel + "This is Google Chrome, but the version is lower than " + definedVersion;
        } else {
            document.getElementById('compareChromeVersion').textContent = pLabel + "This is Google Chrome, but the version is higher than " + definedVersion;
            // document.getElementById('compareChromeVersion_hid').value = "1";
            // const test_value = document.getElementById('compareChromeVersion_hid').value;
            // alert(test_value);
        }
    } else {
        document.getElementById('compareChromeVersion').textContent = pLabel + "This is not Google Chrome.";
    }
}

function checkScreenSharingSupport() {
    const pLabel = "3. Screen sharing support check: ";
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Supported
        document.getElementById('checkScreenSharingSupport').textContent = pLabel + "Screen sharing is supported in this browser.";
    } else {
        // Not supported
        document.getElementById('checkScreenSharingSupport').textContent = pLabel + "Screen sharing is not supported in this browser.";
    }
}


async function getVideoDevice() {
    const pLabel = "4. Video device check: ";
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTracks = stream.getVideoTracks();

        if (videoTracks.length > 0) {
            const defaultVideoDevice = videoTracks[0].label;
            document.getElementById('getVideoDevice').textContent = pLabel + 'Default Video Device: ' + defaultVideoDevice;
        } else {
            document.getElementById('getVideoDevice').textContent = pLabel + 'No video device found.';
        }

        stream.getTracks().forEach(track => track.stop()); // Stop the stream
    } catch (error) {
        console.error('Error accessing video device:', error);
        document.getElementById('getVideoDevice').textContent = pLabel + 'Error accessing video device. Please check your browser permissions.';
    }
}

async function getMicrophone() {
    const pLabel = "5. Microphone device check: ";

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTracks = stream.getAudioTracks();

        if (audioTracks.length > 0) {
            const defaultMicrophone = audioTracks[0].label;
            document.getElementById('getMicrophone').textContent = pLabel + 'Default Microphone: ' + defaultMicrophone;
        } else {
            document.getElementById('getMicrophone').textContent = pLabel + 'No microphone found.';
        }

        stream.getTracks().forEach(track => track.stop()); // Stop the stream
    } catch (error) {
        console.error('Error accessing microphone:', error);
        document.getElementById('getMicrophone').textContent = pLabel + 'Error accessing microphone. Please check your browser permissions.';
    }
}

function goFullscreen() {
    const pLabel = "6. Trigger fullscreen: ";
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    if (isChrome) {
        const element = document.documentElement; // Fullscreen the entire document

        if (element.requestFullscreen) {
            element.requestFullscreen().then(() => { //goFullscreen2
                document.getElementById('goFullscreen').textContent = pLabel + "Fullscreen mode activated successfully!";
            }).catch((error) => {
                document.getElementById('goFullscreen').textContent = pLabel + "Failed to enter fullscreen mode: " + error;
            });
        } else if (element.webkitRequestFullscreen) { /* Chrome and Opera */
            element.webkitRequestFullscreen().then(() => {
                document.getElementById('goFullscreen').textContent = pLabel + "Fullscreen mode activated successfully!";
            }).catch((error) => {
                document.getElementById('goFullscreen').textContent = pLabel + "Failed to enter fullscreen mode: " + error;
            });
        } else {
            document.getElementById('goFullscreen').textContent = pLabel + "Fullscreen mode is not supported in this browser.";
        }
    } else {
        document.getElementById('goFullscreen').textContent = pLabel + "This feature is only available in Google Chrome.";
    }
}

delayFunction(compareChromeVersion);
delayFunction(getVideoDevice);
delayFunction(getMicrophone);
delayFunction(checkScreenSharingSupport);
