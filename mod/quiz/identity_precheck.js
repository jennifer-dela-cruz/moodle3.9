const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const retryButton = document.getElementById('retry');
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

    // Convert the photo to a Blob object
    canvas.toBlob(function(blob) {
    // Hide video element, display the taken photo, and show retry button
    video.style.display = 'none';
    photo.src = URL.createObjectURL(blob);
    photo.style.display = 'inline';
    retryButton.style.display = 'inline';
    captureButton.style.display = 'none';

    // Upload the image to an API endpoint as a Blob
    uploadImage(blob);
    }, 'image/jpeg');
}

// Retry capturing photo
function retryCapture() {
    video.style.display = 'inline';
    photo.style.display = 'none';
    retryButton.style.display = 'none';
    captureButton.style.display = 'inline';
}

// Function to upload image data to an API endpoint as a Blob
function uploadImage(imageBlob) {

    // Goes to API Gateway: S3 Screen Upload - NOT WORKING, ONLY IN POSTMAN
//   const bucket = 'upou-screen-stream';
//   const custFileName = Date.now() + '.jpeg';
//   const uploadImageURL = 'https://uax7iojzo9.execute-api.us-east-1.amazonaws.com/v1/' + bucket + '/' + custFileName;

    // Goes to API Gateway: UPOU Face Captures
//   const bucket = 'upou-face-captures';
//   const custFileName = Date.now() + '.jpeg';
//   const uploadImageURL = 'https://uax7iojzo9.execute-api.us-east-1.amazonaws.com/v1/' + bucket + '/' + custFileName;

    // NEED TO CREATE YET the API Gateway for UPOU Face Captures
    uploadImageURL = '';

    alert(document.getElementById('identity_type').value);

    if (document.getElementById('identity_type').value == 'face') {
        // Goes to API Gateway: S3 Video Stream Upload - WORKING!!!
        const bucket = 'upou-face-captures';
        const custFileName = Date.now() + '.jpeg';
        uploadImageURL = 'https://uaesp3yh1g.execute-api.us-east-1.amazonaws.com/v1/' + bucket + '/' + custFileName;

    } else { // it goes to the ID
        // Goes to API Gateway: S3 Video Stream Upload - WORKING!!!
        const bucket = 'upou-id-pictures';
        const custFileName = Date.now() + '.jpeg';
        uploadImageURL = 'https://uaesp3yh1g.execute-api.us-east-1.amazonaws.com/v1/' + bucket + '/' + custFileName;
    }

    fetch(uploadImageURL, {
    method: 'PUT',
    body: imageBlob,
    headers: {
        'Content-Type': 'image/jpeg' // Adjust the content type if needed
    }
    })
    .then(response => {
    // Handle the response from the API as needed
    console.log('Image uploaded:', response);
    })
    .catch(error => {
    console.error('Error uploading image:', error);
    });
}

captureButton.addEventListener('click', takePhoto);
retryButton.addEventListener('click', retryCapture);