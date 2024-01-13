
function captureAndUpload(quiz_id, user_id, evidence_msg) {
    console.log("Capture and Upload function called");

    // Use html2canvas to capture the entire body
    html2canvas(document.body).then(function(canvas) {
        // Convert the canvas content to a data URL
        var dataURL = canvas.toDataURL("image/png");
        console.log("Canvas content converted to data URL");

        // Create a Blob from the data URL
        var blob = dataURLtoBlob(dataURL);
        console.log("Blob created from data URL");

        var bucket = 'upou-screen-stream';
        // var quiz_id = 2;
        // var user_id = 3;
        // var evidence_msg = 'NO_VIOLATION';
        const custFileName = quiz_id + '_' + user_id + '_' + Date.now() + '_' + evidence_msg + '.jpeg';
        uploadImageURL = 'https://uax7iojzo9.execute-api.us-east-1.amazonaws.com/v1/' + bucket + '/' + custFileName;

        console.log('uploadImageURL: ', uploadImageURL);

        fetch(uploadImageURL, {
            method: 'PUT',
            body: blob,
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

    });
}

function dataURLtoBlob(dataURL) {
    var arr = dataURL.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
}


