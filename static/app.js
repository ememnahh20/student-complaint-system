// ==========================================
// STUDENT COMPLAINT SYSTEM - APP.JS
// ==========================================


// ==========================================
// 1. VARIABLES
// ==========================================

let currentStudentId = "";
let anonymous = false;

// Store all complaints from the database
let allComplaints = [];


// ==========================================
// 2. SCREEN NAVIGATION
// ==========================================

function showScreen(screenId) {

    document.getElementById("welcome-screen")
        .classList.add("hidden");

    document.getElementById("login-screen")
        .classList.add("hidden");

    document.getElementById("app-screen")
        .classList.add("hidden");

    document.getElementById(screenId)
        .classList.remove("hidden");
}


// ==========================================
// 3. PAGE NAVIGATION
// ==========================================

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function(page) {

        page.classList.add("hidden");

    });

    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.remove("hidden");

    }
}


// ==========================================
// 4. LOGIN
// ==========================================

function login() {

    const studentId =
        document.getElementById("login-student-id")
            .value
            .trim();

    const password =
        document.getElementById("login-password")
            .value
            .trim();


    // Check if fields are empty
    if (studentId === "" || password === "") {

        alert(
            "Please enter your Student ID and password."
        );

        return;
    }


    // Save Student ID
    currentStudentId = studentId;


    // Show application
    document.getElementById("welcome-screen")
        .classList.add("hidden");

    document.getElementById("login-screen")
        .classList.add("hidden");

    document.getElementById("app-screen")
        .classList.remove("hidden");


    // Open dashboard
    showPage("dashboard-page");


    // Load existing complaints
    loadComplaints();
}


// ==========================================
// 5. ANONYMOUS BUTTON
// ==========================================

function setAnonymous(value) {

    anonymous = value;

    const yesButton =
        document.getElementById("anonymous-yes");

    const noButton =
        document.getElementById("anonymous-no");


    // Remove selected status
    yesButton.classList.remove("selected");

    noButton.classList.remove("selected");


    // Select correct button
    if (value === true) {

        yesButton.classList.add("selected");

    } else {

        noButton.classList.add("selected");

    }
}


// ==========================================
// 6. REVIEW COMPLAINT
// ==========================================

function reviewComplaint() {

    const category =
        document.getElementById("category")
            .value;

    const subject =
        document.getElementById("subject")
            .value
            .trim();

    const description =
        document.getElementById("description")
            .value
            .trim();


    // Check required fields
    if (
        category === "" ||
        subject === "" ||
        description === ""
    ) {

        alert(
            "Please complete all required fields."
        );

        return;
    }


    // Put information into review page
    document.getElementById("review-category")
        .textContent = category;

    document.getElementById("review-subject")
        .textContent = subject;

    document.getElementById("review-description")
        .textContent = description;

    document.getElementById("review-anonymous")
        .textContent =
        anonymous ? "Yes" : "No";


    // Go to review page
    showPage("review-page");
}


// ==========================================
// 7. SUBMIT COMPLAINT
// ==========================================

async function submitComplaint() {

    const category =
        document.getElementById("category")
            .value;

    const subject =
        document.getElementById("subject")
            .value
            .trim();

    const description =
        document.getElementById("description")
            .value
            .trim();


    // Check if logged in
    if (currentStudentId === "") {

        alert("Please log in first.");

        showScreen("login-screen");

        return;
    }


    // Prepare data for FastAPI
    const complaintData = {

        student_id: currentStudentId,

        student_name: anonymous
            ? "Anonymous Student"
            : "Student " + currentStudentId,

        student_email: anonymous
            ? "anonymous@jrcc.edu"
            : currentStudentId + "@jrcc.edu",

        title: subject,

        description: description,

        category: category
    };


    console.log(
        "Sending complaint:",
        complaintData
    );


    try {

        // Send data to FastAPI
        const response =
            await fetch(
                "/complaints",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        complaintData
                    )
                }
            );


        // Check if request failed
        if (!response.ok) {

            const errorData =
                await response.json();

            console.error(
                "SERVER ERROR:",
                errorData
            );

            alert(
                "SUBMIT ERROR\n\n" +
                JSON.stringify(
                    errorData,
                    null,
                    2
                )
            );

            return;
        }


        // Convert response to JavaScript object
        const result =
            await response.json();


        console.log(
            "Complaint submitted:",
            result
        );


        // Show generated complaint ID
        document.getElementById(
            "reference-number"
        ).textContent =
            result.complaint_id;


        // Go to success page
        showPage("submitted-page");


        // Clear form
        clearComplaintForm();


        // Refresh complaints
        loadComplaints();

    }

    catch (error) {

        console.error(
            "Error:",
            error
        );

        alert(
            "Cannot connect to the server. " +
            "Please make sure FastAPI is running."
        );
    }
}


// ==========================================
// 8. LOAD COMPLAINTS
// ==========================================

async function loadComplaints() {

    try {

        const response =
            await fetch("/complaints");


        if (!response.ok) {

            throw new Error(
                "Failed to get complaints."
            );
        }


        const complaints =
            await response.json();


        console.log(
            "Complaints:",
            complaints
        );


        // Save all complaints
        allComplaints = complaints;


        // Display all complaints by default
        displayComplaints(allComplaints);


        // Make All filter active
        setActiveFilter("All");


        // Update dashboard numbers
        updateDashboard(allComplaints);

    }

    catch (error) {

        console.error(
            "Error loading complaints:",
            error
        );


        const container =
            document.getElementById(
                "complaints-list"
            );


        if (container) {

            container.innerHTML =
                "<p>Unable to load complaints.</p>";

        }
    }
}


// ==========================================
// 9. FILTER COMPLAINTS
// ==========================================

function filterComplaints(status) {

    // Highlight selected filter button
    setActiveFilter(status);


    // Show all complaints
    if (status === "All") {

        displayComplaints(allComplaints);

        return;
    }


    // Get complaints with selected status
    const filteredComplaints =
        allComplaints.filter(
            function(complaint) {

                return complaint.status === status;

            }
        );


    // Display filtered complaints
    displayComplaints(filteredComplaints);
}


// ==========================================
// 10. ACTIVE FILTER BUTTON
// ==========================================

function setActiveFilter(status) {

    const buttons =
        document.querySelectorAll(
            ".filter-buttons button"
        );


    buttons.forEach(function(button) {

        button.classList.remove("selected");


        if (
            button.textContent.trim() === status
        ) {

            button.classList.add("selected");

        }

    });
}


// ==========================================
// 11. DISPLAY COMPLAINTS
// ==========================================

function displayComplaints(complaints) {

    const container =
        document.getElementById(
            "complaints-list"
        );


    if (!container) {

        return;
    }


    // No complaints
    if (complaints.length === 0) {

        container.innerHTML =
            "<p>No complaints found.</p>";

        return;
    }


    // Clear old complaints
    container.innerHTML = "";


    // Display every complaint
    complaints.forEach(
        function(complaint) {


            // ==========================================
            // CREATE COMPLAINT CARD
            // ==========================================

            const card =
                document.createElement("div");

            card.className =
                "complaint-card";


            // ==========================================
            // COMPLAINT TITLE
            // ==========================================

            const title =
                document.createElement("h3");

            title.textContent =
                complaint.title;


            // ==========================================
            // CATEGORY
            // ==========================================

            const category =
                document.createElement("p");

            category.textContent =
                "Category: " +
                complaint.category;


            // ==========================================
            // REFERENCE NUMBER
            // ==========================================

            const reference =
                document.createElement("p");

            reference.textContent =
                "Reference: " +
                complaint.complaint_id;


            // ==========================================
            // CURRENT STATUS LABEL
            // ==========================================

            const statusText =
                document.createElement("p");

            statusText.textContent =
                "Current Status:";

            statusText.className =
                "status-label";


            // ==========================================
            // CURRENT STATUS
            // ==========================================

            const status =
                document.createElement("span");

            status.className =
                "status";

            status.textContent =
                complaint.status;


            // ==========================================
            // UPDATE STATUS LABEL
            // ==========================================

            const updateLabel =
                document.createElement("p");

            updateLabel.textContent =
                "Update Status";

            updateLabel.className =
                "status-label";


            // ==========================================
            // STATUS BUTTONS CONTAINER
            // ==========================================

            const statusButtons =
                document.createElement("div");

            statusButtons.className =
                "status-buttons";


            // ==========================================
            // PENDING BUTTON
            // ==========================================

            const pendingButton =
                document.createElement("button");

            pendingButton.textContent =
                "Pending";

            pendingButton.onclick =
                function() {

                    updateComplaintStatus(
                        complaint.complaint_id,
                        "Pending"
                    );

                };


            // ==========================================
            // IN PROGRESS BUTTON
            // ==========================================

            const progressButton =
                document.createElement("button");

            progressButton.textContent =
                "In Progress";

            progressButton.onclick =
                function() {

                    updateComplaintStatus(
                        complaint.complaint_id,
                        "In Progress"
                    );

                };


            // ==========================================
            // RESOLVED BUTTON
            // ==========================================

            const resolvedButton =
                document.createElement("button");

            resolvedButton.textContent =
                "Resolved";

            resolvedButton.onclick =
                function() {

                    updateComplaintStatus(
                        complaint.complaint_id,
                        "Resolved"
                    );

                };


            // ==========================================
            // ADD STATUS BUTTONS
            // ==========================================

            statusButtons.appendChild(
                pendingButton
            );

            statusButtons.appendChild(
                progressButton
            );

            statusButtons.appendChild(
                resolvedButton
            );


            // ==========================================
            // ADD EVERYTHING TO CARD
            // ==========================================

            card.appendChild(title);

            card.appendChild(category);

            card.appendChild(reference);

            card.appendChild(statusText);

            card.appendChild(status);

            card.appendChild(updateLabel);

            card.appendChild(statusButtons);


            // ==========================================
            // ADD CARD TO PAGE
            // ==========================================

            container.appendChild(card);

        }
    );
}


// ==========================================
// 12. UPDATE COMPLAINT STATUS
// ==========================================

async function updateComplaintStatus(
    complaintId,
    newStatus
) {

    try {

        console.log(
            "Updating complaint:",
            complaintId,
            "to",
            newStatus
        );


        const response =
            await fetch(
                `/complaints/${complaintId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        // Check if update failed
        if (!response.ok) {

            const errorData =
                await response.json();


            console.error(
                "UPDATE STATUS ERROR:",
                errorData
            );


            alert(
                "Unable to update complaint status.\n\n" +
                JSON.stringify(
                    errorData,
                    null,
                    2
                )
            );


            return;
        }


        // Get updated complaint
        const result =
            await response.json();


        console.log(
            "Status updated:",
            result
        );


        // Show confirmation
        alert(
            "Complaint status updated to " +
            newStatus +
            "."
        );


        // Reload complaints
        await loadComplaints();

    }

    catch (error) {

        console.error(
            "Error updating status:",
            error
        );


        alert(
            "Cannot connect to the server. " +
            "Please make sure FastAPI is running."
        );
    }
}


// ==========================================
// 13. UPDATE DASHBOARD
// ==========================================

function updateDashboard(complaints) {

    let submitted = 0;

    let pending = 0;

    let resolved = 0;


    // Count complaints
    complaints.forEach(
        function(complaint) {

            submitted++;


            if (
                complaint.status === "Pending"
            ) {

                pending++;

            }


            if (
                complaint.status === "Resolved"
            ) {

                resolved++;

            }

        }
    );


    // ==========================================
    // UPDATE NUMBERS
    // ==========================================

    document.getElementById(
        "submitted-count"
    ).textContent =
        submitted;


    document.getElementById(
        "pending-count"
    ).textContent =
        pending;


    document.getElementById(
        "resolved-count"
    ).textContent =
        resolved;


    // ==========================================
    // SHOW LATEST COMPLAINT
    // ==========================================

    const recentComplaint =
        document.getElementById(
            "recent-complaint"
        );


    if (complaints.length > 0) {

        const latest =
            complaints[
                complaints.length - 1
            ];


        recentComplaint.textContent =
            latest.title +
            " • " +
            latest.status;

    } else {

        recentComplaint.textContent =
            "No complaints yet.";

    }
}


// ==========================================
// 14. CLEAR COMPLAINT FORM
// ==========================================

function clearComplaintForm() {

    document.getElementById(
        "category"
    ).value = "";


    document.getElementById(
        "subject"
    ).value = "";


    document.getElementById(
        "description"
    ).value = "";


    // Reset anonymous option
    anonymous = false;

    setAnonymous(false);
}


// ==========================================
// 15. STARTING STATE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {


        // Make sure welcome screen is shown
        showScreen(
            "welcome-screen"
        );


        // Default anonymous = No
        setAnonymous(false);


        // Default filter = All
        setActiveFilter("All");

    }
);