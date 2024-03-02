const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const retryButton = document.getElementById('retry');
const saveButton = document.getElementById('save');
const continueButton = document.getElementById('continue');
const photo = document.getElementById('photo');
const buttonsContainer = document.getElementById('buttonsContainer');

const constraints = { video: true };

navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
    video.srcObject = stream;
    })
    .catch(function(err) {
    console.error('Error accessing the camera:', err);
    });

// Capture photo from the video stream
function takePhoto() {
    canvas.width = 254;
    canvas.height = 190;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the photo to a data URL
    const photoDataURL = canvas.toDataURL('image/jpeg');

    // Hide video element, display the taken photo, and show retry and continue buttons
    video.style.display = 'none';
    photo.src = photoDataURL;
    photo.style.display = 'inline';
    retryButton.style.display = 'inline';
    saveButton.style.display = 'inline';
    // continueButton.style.display = 'inline';
    captureButton.style.display = 'none';
}

// Retry capturing photo
function retryCapture() {
    video.style.display = 'inline';
    photo.style.display = 'none';
    retryButton.style.display = 'none';
    saveButton.style.display = 'none';
    continueButton.style.display = 'none';
    captureButton.style.display = 'inline';
}


function saveCapture() {
    sendVerify = true;

    // There is a few seconds delay when the below function is called
    continueUpload(sendVerify);
}


// Continue with the image upload
function continueUpload(sendVerify) {
    const photoDataURL = canvas.toDataURL('image/jpeg');
    const imageBlob = dataURItoBlob(photoDataURL);

    // Perform the image upload here using the uploadImage function
    uploadImage(imageBlob, sendVerify);

}

// Function to convert data URI to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
}

// Function to upload image data to an API endpoint as a Blob
function uploadImage(imageBlob, sendVerify) {

    // S3 Video Stream and Photo Upload v3
    uploadImageURL = 'https://hdy3rohah6.execute-api.us-east-1.amazonaws.com/v1/';

    user_id = document.getElementById('user_id').value;
    quiz_id = document.getElementById('quiz_id').value;
    custFileName = quiz_id + '_' + user_id + '_' + Date.now() + '.jpeg';
    console.log('IDENTITY_TYPE: ', document.getElementById('identity_type').value);

    if (document.getElementById('identity_type').value == 'face') {
        // Goes to API Gateway: S3 Video Stream Upload - WORKING!!!
        const bucket = 'upou-face-captures';
        uploadImageURL = uploadImageURL + bucket + '/' + custFileName;

    } else { // it goes to the ID
        // Goes to API Gateway: S3 Video Stream Upload - WORKING!!!
        const bucket = 'upou-id-pictures';
        uploadImageURL = uploadImageURL + bucket + '/' + custFileName;
    }

    fetch(uploadImageURL, {
    method: 'PUT',
    body: imageBlob,
    headers: {
        'Content-Type': 'image/jpeg' // Adjust the content type if needed
    }
    })
    .then(response => {
        if (document.getElementById('identity_type').value == 'face') {
            bucket = 'upou-face-captures';
        } else { // it goes to the ID
            bucket = 'upou-id-pictures';
        }

        // Handle the response from the API as needed
        console.log('===============================================');
        console.log('After the uploadImage function is called...');
        console.log('bucket: ', bucket);
        console.log('key: ', custFileName);
        console.log('Image uploaded:', response);

        if (sendVerify) {
            sendVerifyRequest(bucket, custFileName);
        } else {
            console.log('No verify request...');
        }
    })
    .catch(error => {
    console.error('Error uploading image:', error);
    });

}

function sendVerifyRequest(bucket, custFileName) {

    //  API Gateway endpoint
    if (bucket == 'upou-face-captures') {
        // Lambda Verify Face Photo v2
        apiEndpoint = 'https://d4pe1tagpe.execute-api.us-east-1.amazonaws.com/v1/';
    } else {
        // Lambda Verify ID Photo v2
        apiEndpoint = 'https://is713j3tqi.execute-api.us-east-1.amazonaws.com/v1/';
    }

    const verifyRequestUrl = apiEndpoint + bucket + '/' + custFileName;

    console.log('===============================================');
        console.log("BEFORE sendVerifyRequest is called...");
        console.log('bucket: ', bucket);
        console.log('key: ', custFileName);

    const requestData = {
        bucket: bucket, //'upou-face-captures',
        key: custFileName, // '3_2_1702116559111.jpg',
    };

    fetch(verifyRequestUrl, {
        method: 'PUT', //  HTTP method
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
    .then(response => response.json())
    .then(data => {
       // Parse the outer response
       const parsedResponse = data;

       // Parse the inner JSON in the 'body' property
       const bodyData = parsedResponse.body ? JSON.parse(parsedResponse.body) : null;

       // Access the nested data
       const bucketValue = bodyData ? bodyData.bucket : "";
       const keyValue = bodyData ? bodyData.key  : "";

       console.log('===============================================');
       console.log("AFTER sendVerifyRequest is called...");
       console.log("(Response from Lambda function: ", verifyRequestUrl);
       console.log('bodyData: ', bodyData);
       console.log('bucket: ', bucketValue);
       console.log('key: ', keyValue);

       if (bucket == 'upou-face-captures') {

            const faceFound = bodyData ? bodyData.faceFound : false;
            const faceCount = bodyData ? bodyData.faceCount : 0;

            console.log('faceFound: ', faceFound);
            console.log('faceCount: ', faceCount);

            if (faceCount === 1) {
                continueButton.style.display = 'inline';
                saveButton.style.display = 'none';
            } else {
                alert('No face or multiple faces found. Please try again.');
                retryCapture();
            }
       } else {
            const idFound = bodyData ? bodyData.idFound : false;

            console.log('idFound: ', idFound);

            if (idFound) {
                continueButton.style.display = 'inline';
                saveButton.style.display = 'none';
            } else {
                alert('ID is not valid. Student name not found. Please try again.');
                retryCapture();
            }
       }

    })
    .catch(error => {
        // Handle errors
        console.error('Error:', error);
    });

}

captureButton.addEventListener('click', takePhoto);
retryButton.addEventListener('click', retryCapture);
saveButton.addEventListener('click', saveCapture);