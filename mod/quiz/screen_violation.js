var evidence_msg = 'NO_VIOLATION';
// var quiz_id = 7;
// var user_id = 2;
var user_id = document.getElementById('user_id').value;
var quiz_id = document.getElementById('quiz_id').value;


// Disable Right Mouse Click
// WORKING!
document.addEventListener('contextmenu', event => event.preventDefault());

var elem = document.documentElement;
var maximize = document.getElementById("maximizeButton");
var maximizeIcon = document.getElementById("maximizeButtonIcon");

//  Right click violation
// WORKING!
window.oncontextmenu = function () {
    console.log('Right click violation');
    evidence_msg = 'PERFORMED_RIGHT_CLICK';
    captureAndUpload(quiz_id, user_id, evidence_msg);
}

//  Shortcut violation
// WORKING BOTH CTRL AND CMD KEYS!
window.onkeydown = function(key)
{
    if(key.ctrlKey == true || event.metaKey == true){
        console.log('Shortcut violation');
        evidence_msg = 'PRESSED_SHORTCUT_KEY';
        captureAndUpload(quiz_id, user_id, evidence_msg);
    }
};

// //  Close Window Violation
// window.addEventListener('beforeunload', function(event) {
//     // Cancel the event
//     event.preventDefault();
//     evidence_msg = 'CLOSED_WINDOW';
//     captureAndUpload(quiz_id, user_id, evidence_msg);
//     // Chrome requires returnValue to be set
//     event.returnValue = '';
// });

//  Navigate Away Violation
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        // The page is hidden, user switched to another tab or window
        console.log("User switched to another tab or window");
        evidence_msg = 'NAVIGATED_AWAY';
        captureAndUpload(quiz_id, user_id, evidence_msg);
    } else {
        // The page is visible again
        console.log("User is back on this tab or window");
    }
});
