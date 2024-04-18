var evidence_msg = 'NO_VIOLATION';
// var quiz_id = 7;
// var user_id = 2;
var user_id = document.getElementById('user_id').value;
var quiz_id = document.getElementById('quiz_id').value;
var proctor_type = document.getElementById('proctor_type').value;

// For navigating away finish_btn
var next_page = document.getElementById('nextpage').value;
var is_finish = document.getElementById('is_finish').value;
var previous_btn = document.getElementById('previous');
var next_btn = document.getElementById('next');

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


// // Add a click event listener to the submit button
// next_btn.addEventListener('click', () => {
//     is_finish.value = '1';
//     // Your code to run when the button is clicked
//     console.log('Next button clicked!');
// });

// previous_btn.addEventListener('click', () => {
//     is_finish.value = '0';
//     // Your code to run when the button is clicked
//     console.log('Previous button clicked!');
// });

// // Disabled for now as this affects if there are multiple pages (when pressing next
// //  Close Window Violation
// window.addEventListener('beforeunload', function(event) {

//     // if next page = -1 (OK) and if NOT submit button (name=next, id=next) then
//     if (next_page == -1 && is_finish == 1) {
//         // Cancel the event
//         event.preventDefault();
//         evidence_msg = 'CLOSED_WINDOW';
//         captureAndUpload(quiz_id, user_id, evidence_msg);
//     }

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
