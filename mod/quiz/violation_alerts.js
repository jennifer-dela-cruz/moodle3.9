function formatDate(date) {

    date = new Date(date);

    // Get individual components
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');  // Month is zero-based, so add 1
    var day = String(date.getDate()).padStart(2, '0');
    var hours = String(date.getHours()).padStart(2, '0');
    var minutes = String(date.getMinutes()).padStart(2, '0');
    var seconds = String(date.getSeconds()).padStart(2, '0');

    // Format the output string
    var formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    // console.log('formattedDate: ', formattedDate);

    return formattedDate;
}

async function fetchRecords(created_time_start, created_time_end) {
    // var quiz_id = 7;
    // var student_id = 2;
    var quiz_id = document.getElementById('quiz_id').value;
    var student_id = document.getElementById('user_id').value;
    var displayDuration = 10000; // 10 seconds
    var fadeOutDuration = 5000; // 5 seconds

    // Lambda Get Violations v2
    const apiUrl = 'https://qf6s9v2afl.execute-api.us-east-1.amazonaws.com/v1/' + quiz_id + '/' + student_id;

    const requestData = {
        quiz_id: quiz_id,
        student_id: student_id,
        created_time_start: created_time_start,
        created_time_end: created_time_end
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        const data = await response.json();

        // For troubleshooting purposes
        // Objects are enclosed in curly braces {}.
        // Arrays are ordered lists enclosed in square brackets [].
        console.log("data: ", data);
        // console.log("data > data type: ", typeof data);
        // Display all records based on quiz_id and student_id
        // the data.body value is an array although it displays 'object'
        console.log("data.body: ", data.body);
        // console.log("data.body > data type: ", typeof data.body);

        container = document.getElementById('violation-container');

        for (let j = 0; j < data.body.length; j++) {
            // Show the violation message in the logs
            console.log("Record", j + ": " + data.body[j][5]);
            const record = data.body[j][5];

            // Show the div element
            container.style.display = 'block';

            const recordDiv = document.createElement('div');
            recordDiv.id = "records-container-child";
            recordDiv.innerHTML = record;

            container.appendChild(recordDiv);

            // Set the delay before starting to fade out
            await new Promise(resolve => setTimeout(resolve, displayDuration));

            // Hide the div element
            container.style.display = 'none';

            // Start fading out
            recordDiv.style.opacity = 0;

            // Remove the record after fading out
            await new Promise(resolve => setTimeout(() => {
                recordDiv.remove();
                resolve();
            }, fadeOutDuration)); // 5 seconds fade out


        }

    } catch (error) {
        console.error('Error fetching records:', error);
    }
}

// Set the delay for getting the violations
var delay = 1 * 60 * 1000; // 1 minute

// x-minute interval loop function
async function startLoop() {

    // Use a flag to control the loop
    var isLooping = true;

    // The below is the same as the time the page loads
    var created_time_start = Date.now() - delay;
    console.log('created_time_start: ', new Date(created_time_start));

    var created_time_end = Date.now();
    console.log('created_time_end: ', new Date(created_time_end));

    console.log('============================================');

    while (isLooping) {
    // for (let i = 0; i < 3; i++) { // for troubleshooting purposes
        await fetchRecords(formatDate(created_time_start), formatDate(created_time_end));

        // Set the next start and end date_time
        var created_time_start = created_time_end + 1000; // add 1 second
        console.log('next created_time_start: ', new Date(created_time_start));
        var created_time_end = created_time_start + delay;
        console.log('next created_time_end: ', new Date(created_time_end));
        console.log('============================================');

        // Delay here before getting the next set of records
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log("This line will be executed after a few second delay.");
    }
}

// Start the loop
console.log('page_load_start: ', new Date(Date.now()));
console.log('============================================');
setTimeout(startLoop, delay);
// startLoop();

// To stop the loop, set the flag to false
// Call stopLoop() to exit the loop - TO DO
function stopLoop() {
    isLooping = false;
}

