<?php
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
 * This script deals with starting a new attempt at a quiz.
 *
 * Normally, it will end up redirecting to attempt.php - unless a password form is displayed.
 *
 * This code used to be at the top of attempt.php, if you are looking for CVS history.
 *
 * @package   mod_quiz
 * @copyright 2009 The Open University
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(__DIR__ . '/../../config.php');
require_once($CFG->dirroot . '/mod/quiz/locallib.php');

// Get submitted parameters.
$id = required_param('cmid', PARAM_INT); // Course module id
$forcenew = optional_param('forcenew', false, PARAM_BOOL); // Used to force a new preview
$page = optional_param('page', -1, PARAM_INT); // Page to jump to in the attempt.

if (!$cm = get_coursemodule_from_id('quiz', $id)) {
    print_error('invalidcoursemodule');
}
if (!$course = $DB->get_record('course', array('id' => $cm->course))) {
    print_error("coursemisconf");
}

$quizobj = quiz::create($cm->instance, $USER->id);
// This script should only ever be posted to, so set page URL to the view page.
$PAGE->set_url($quizobj->view_url());
// During quiz attempts, the browser back/forwards buttons should force a reload.
$PAGE->set_cacheable(false);

// Check login and sesskey.
require_login($quizobj->get_course(), false, $quizobj->get_cm());
require_sesskey();
$PAGE->set_heading($quizobj->get_course()->fullname);

// If no questions have been set up yet redirect to edit.php or display an error.
if (!$quizobj->has_questions()) {
    if ($quizobj->has_capability('mod/quiz:manage')) {
        redirect($quizobj->edit_url());
    } else {
        print_error('cannotstartnoquestions', 'quiz', $quizobj->view_url());
    }
}

// Create an object to manage all the other (non-roles) access rules.
$timenow = time();
$accessmanager = $quizobj->get_access_manager($timenow);

// Validate permissions for creating a new attempt and start a new preview attempt if required.
list($currentattemptid, $attemptnumber, $lastattempt, $messages, $page) =
    quiz_validate_new_attempt($quizobj, $accessmanager, $forcenew, $page, true);

// Check access.
if (!$quizobj->is_preview_user() && $messages) {
    $output = $PAGE->get_renderer('mod_quiz');
    print_error('attempterror', 'quiz', $quizobj->view_url(),
            $output->access_messages($messages));
}

if ($accessmanager->is_preflight_check_required($currentattemptid)) {
    // Need to do some checks before allowing the user to continue.
    $mform = $accessmanager->get_preflight_check_form(
            $quizobj->start_attempt_url($page), $currentattemptid);

    if ($mform->is_cancelled()) {
        $accessmanager->back_to_view_page($PAGE->get_renderer('mod_quiz'));

    } else if (!$mform->get_data()) {

        // Form not submitted successfully, re-display it and stop.
        $PAGE->set_url($quizobj->start_attempt_url($page));
        $PAGE->set_title($quizobj->get_quiz_name());
        $accessmanager->setup_attempt_page($PAGE);
        $output = $PAGE->get_renderer('mod_quiz');
        if (empty($quizobj->get_quiz()->showblocks)) {
            $PAGE->blocks->show_only_fake_blocks();
        }

        echo $output->start_attempt_page($quizobj, $mform);
        die();
    }

    // Pre-flight check passed.
    $accessmanager->notify_preflight_check_passed($currentattemptid);
}

// IF WITH ATTEMPTS ALREADY
// The proctoring logic is the same regardless if has attempts or not
if ($currentattemptid) {

    if ($lastattempt->state == quiz_attempt::OVERDUE) {
        // CHECK IF I NEED TO UPDATE THIS
        redirect($quizobj->summary_url($lastattempt->id));
    } else {

        if ($quizobj) {
            // Get quiz details
            $quiz_id = $quizobj->get_quizid();
            $quiz_config = $DB->get_record('proctor_upou_quiz_config', array('quiz_id' => $quiz_id));

            // Applicable to both Automated Proctoring and Snapshot Proctoring
            // If quiz has proctoring configured
            if ($quiz_config) {

                $proctor_verify_config = $DB->get_record('proctor_upou_quiz_students', array('quiz_id' => $quiz_id, 'user_id' => $USER->id));

                // If quiz has proctoring configured, but verify_face_status and verify_id_status are with value of 1
                if (($proctor_verify_config->verify_face_status == 1) && ($proctor_verify_config->verify_id_status == 1)) {

                    // Check the proctoring_type in mdl_proctor_upou_quiz_config:
                    // 1 - proctor_video_screenshare >> attempt_auto_proctor.php
                    // 2 - snapshot_video_screenshare >> attempt_snap_proctor.php
                    if ($quiz_config->proctoring_type == 1) {
                        redirect($quizobj->attempt_auto_proctor_url($currentattemptid, $page));
                    } else {
                        redirect($quizobj->attempt_snap_proctor_url($currentattemptid, $page));
                    }

                // If quiz has proctoring configured, but verify_face_status and verify_id_status are with value of 0
                // Redirect to the quiz instructions page
                } else {
                    redirect($quizobj->quiz_instructions_url($currentattemptid, $page));
                }

            } else {
                // If quiz has NO proctoring configured
                // Redirect to the attempt page.
                redirect($quizobj->attempt_url($currentattemptid, $page));
            }
        }
    }
}

//IF NO ATTEMPTS YET
// The proctoring logic is the same regardless if has attempts or not
$attempt = quiz_prepare_and_start_new_attempt($quizobj, $attemptnumber, $lastattempt);

if ($quizobj) {
    // Get quiz details
    $quiz_id = $quizobj->get_quizid();
    $quiz_config = $DB->get_record('proctor_upou_quiz_config', array('quiz_id' => $quiz_id));

    // Applicable to both Automated Proctoring and Snapshot Proctoring
    // If quiz has proctoring configured
    if ($quiz_config) {
        $proctor_verify_config = $DB->get_record('proctor_upou_quiz_students', array('quiz_id' => $quiz_id, 'user_id' => $USER->id));

        // If quiz has proctoring configured, but verify_face_status and verify_id_status are with value of 1
        if (($proctor_verify_config->verify_face_status == 1) && ($proctor_verify_config->verify_id_status == 1)) {

            // Check the proctoring_type in mdl_proctor_upou_quiz_config:
            // 1 - proctor_video_screenshare >> attempt_auto_proctor.php
            // 2 - snapshot_video_screenshare >> attempt_snap_proctor.php
            if ($quiz_config->proctoring_type == 1) {
                redirect($quizobj->attempt_auto_proctor_url($currentattemptid, $page));
            } else {
                redirect($quizobj->attempt_snap_proctor_url($currentattemptid, $page));
            }

        // If quiz has proctoring configured, but verify_face_status and verify_id_status are with value of 0
        // Redirect to the quiz instructions page
        } else {
            redirect($quizobj->quiz_instructions_url($currentattemptid, $page));
        }

    } else {
        // If quiz has NO proctoring configured
        // Redirect to the attempt page.
        redirect($quizobj->attempt_url($currentattemptid, $page));
    }
}

// // Original code
// // This is when there is an existing attempt ID
// // TESTED AND WORKING
// if ($currentattemptid) {
//     if ($lastattempt->state == quiz_attempt::OVERDUE) {
//         redirect($quizobj->summary_url($lastattempt->id));
//     } else {

//         if ($quizobj) {
//             // Get quiz details
//             $quiz_id = $quizobj->get_quizid();

//             // Check if done with both verify face and verify id ()
//             // The insert happens in the verifyFace or verifyID Lambda function
//             $quiz_student_config_record = $DB->get_record('proctor_upou_quiz_students', array('quiz_id' => $quiz_id, 'user_id' => $USER->id));
//             var_dump($quiz_student_config_record);

//             if (empty($quiz_student_config_record)) {
//                 // Redirect to the quiz instructions page.
//                 // The record is NOT YET existing in mdl_proctor_upou_quiz_students
//                 // Applicable to both Automated Proctoring and Snapshot Proctoring
//                 redirect($quizobj->quiz_instructions_url($currentattemptid, $page));
//             } else {
//                 // The record is existing in mdl_proctor_upou_quiz_students
//                 // Could be because the previous precheck was not successful?
//                  // Redirect to the attempt page.
//                 redirect($quizobj->attempt_url($currentattemptid, $page));
//             }
//         }
//     }
// }

// // Original code
// // enable this later?
// // check the purpose of this?
// // I think this is when there is no existing attempts yet
// // TEST THIS
// $attempt = quiz_prepare_and_start_new_attempt($quizobj, $attemptnumber, $lastattempt);
// echo 'new attempt vardump';
// var_dump($attempt);
// if ($quizobj) {
//    // Get quiz details
//    $quiz_id = $quizobj->get_quizid();

//    // Check if done with both verify face and verify id ()
//    // The insert happens in the verifyFace or verifyID Lambda function
//    $quiz_student_config_record = $DB->get_record('proctor_upou_quiz_students', array('quiz_id' => $quiz_id, 'user_id' => $USER->id));
//    echo 'proctor_upou_quiz_students vardump';
//    var_dump($quiz_student_config_record);

// //    if (empty($quiz_student_config_record)) {
// //        // Redirect to the quiz instructions page.
// //        // The record is NOT YET existing in mdl_proctor_upou_quiz_students
// //        // Applicable to both Automated Proctoring and Snapshot Proctoring
// //        redirect($quizobj->quiz_instructions_url($currentattemptid, $page));
// //    } else {
// //        // The record is existing in mdl_proctor_upou_quiz_students
// //        // Could be because the previous precheck was not successful?
// //         // Redirect to the attempt page.
// //        redirect($quizobj->attempt_url($currentattemptid, $page));
// //    }
// }