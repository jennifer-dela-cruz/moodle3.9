const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const retryButton = document.getElementById('retry');
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
    continueButton.style.display = 'inline';
    captureButton.style.display = 'none';
}

// Retry capturing photo
function retryCapture() {
    video.style.display = 'inline';
    photo.style.display = 'none';
    retryButton.style.display = 'none';
    continueButton.style.display = 'none';
    captureButton.style.display = 'inline';
}

// Continue with the image upload
function continueUpload() {
    const photoDataURL = canvas.toDataURL('image/jpeg');
    const imageBlob = dataURItoBlob(photoDataURL);

    // Perform the image upload here using the uploadImage function
    // You can modify the uploadImage function based on your API endpoint and requirements
    uploadImage(imageBlob);

    // Reset the UI
    //retryCapture();
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
function uploadImage(imageBlob) {

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