var evidence_msg = 'NO_VIOLATION';
var quiz_id = 7;
var user_id = 2;
// var user_id = document.getElementById('user_id').value;
// var quiz_id = document.getElementById('quiz_id').value;


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

//  Navigate Away Violation
// WORKING!
ifvisible.on('statusChanged', function(e){
    console.log(e.status);
    if(e.status == "hidden"){
        console.log('Navigated away violation');
        evidence_msg = 'NAVIGATED_AWAY';
        captureAndUpload(quiz_id, user_id, evidence_msg);
    }
});

//  Close Violation
// WORKING!
window.onbeforeunload = function(event) {
    console.log('Closed window/tab violation');
    evidence_msg = 'CLOSED_WINDOW';
    captureAndUpload(quiz_id, user_id, evidence_msg);
    return "";
};

