
function screenSnapshots() {
    var evidence_msg = 'NO_VIOLATION';
    var user_id = document.getElementById('user_id').value;
    var quiz_id = document.getElementById('quiz_id').value;
    var proctor_type = document.getElementById('proctor_type').value;

    console.log("Captured random screen snapshot.");
    captureAndUpload(quiz_id, user_id, evidence_msg);
}

// Set up the interval (10 seconds = 10000 milliseconds)
// The function below is called every 10 seconds
setInterval(screenSnapshots, 10000);