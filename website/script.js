// ========================================
// STUDENT RECORD MANAGEMENT SYSTEM
// JAVASCRIPT
// ========================================


// STEP 1: SIDEBAR NAVIGATION

// Get all navigation buttons
const navLinks = document.querySelectorAll(".nav-link");

// Get all website pages
const pages = document.querySelectorAll(".page");

// Function to show the selected page
function showPage(pageId) {

    // Hide all pages
    pages.forEach(function(page) {
        page.classList.remove("active");
    });

    // Remove active colour from all buttons
    navLinks.forEach(function(link) {
        link.classList.remove("active");
    });

    // Show the selected page
    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    // Highlight the selected navigation button
    const selectedLink = document.querySelector(
        '.nav-link[data-page="' + pageId + '"]'
    );

    if (selectedLink) {
        selectedLink.classList.add("active");
    }
}


// Add click functionality to navigation buttons
navLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        const pageId = link.getAttribute("data-page");

        showPage(pageId);

    });

});


// STEP 2: VIEW ALL BUTTON

const viewAllButton = document.querySelector("[data-go]");

if (viewAllButton) {

    viewAllButton.addEventListener("click", function() {

        const pageId = viewAllButton.getAttribute("data-go");

        showPage(pageId);

    });

}
// ========================================
// STEP 3: ADD STUDENT FUNCTIONALITY
// ========================================

// Connect website to Python Flask backend
const API_URL = "http://127.0.0.1:5000";


// Store student records received from C backend
let students = [];


// Function to load student records from C backend
async function loadStudents() {

    try {

        const response = await fetch(API_URL + "/students");

        if (!response.ok) {
            throw new Error("Unable to load student records");
        }

        students = await response.json();

        displayStudents();

    } catch (error) {

        console.error("Backend connection error:", error);

        alert("Unable to connect to the backend. Please check whether the Python server is running.");

    }
}


// Function to display student records
function displayStudents() {

    const tableBody = document.getElementById("studentsTableBody");
    const recentBody = document.getElementById("recentStudentsBody");

    // Clear existing table content
    tableBody.innerHTML = "";

    // Display message if there are no students
    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">No student records available.</td>
            </tr>
        `;

        recentBody.innerHTML = `
            <tr>
                <td colspan="4">No student records available.</td>
            </tr>
        `;

        updateDashboard();
updateReports();
return;
    }

    // Display all students
    students.forEach(function(student) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.roll}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.year}</td>
            <td>${student.semester}</td>
            <td>${student.marks.toFixed(2)}</td>
            <td>
    <button class="primary-btn edit-student"
        data-roll="${student.roll}" type="button">
        Edit
    </button>

    <button class="delete-btn delete-student"
        data-roll="${student.roll}" type="button">
        Delete
    </button>
</td>
        `;

        tableBody.appendChild(row);
    });


    // Display the five most recently added students
    recentBody.innerHTML = "";

    students.slice(-5).reverse().forEach(function(student) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.roll}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.marks.toFixed(2)}</td>
        `;

        recentBody.appendChild(row);
    });

    updateDashboard();
    updateReports();
}


// Function to update dashboard statistics
function updateDashboard() {

    const total = students.length;

    const average = total > 0
        ? students.reduce((sum, student) => sum + student.marks, 0) / total
        : 0;

    const highest = total > 0
        ? Math.max(...students.map(student => student.marks))
        : 0;

    const departments = new Set(
        students.map(student => student.department)
    );

    document.getElementById("totalStudents").textContent = total;

    document.getElementById("averageMarks").textContent =
        average.toFixed(2) + "%";

    document.getElementById("topMarks").textContent =
        highest.toFixed(2);

    document.getElementById("totalDepartments").textContent =
        departments.size;
}


// Handle Add Student form submission
const studentForm = document.getElementById("studentForm");

studentForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const newStudent = {
        roll: Number(document.getElementById("roll").value),
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        department: document.getElementById("department").value,
        year: document.getElementById("year").value,
        semester: document.getElementById("semester").value,
        marks: Number(document.getElementById("marks").value)
    };

    const duplicate = students.some(function(student) {
        return student.roll === newStudent.roll;
    });

    if (duplicate) {
        alert("A student with this roll number already exists!");
        return;
    }

    try {

        const response = await fetch(API_URL + "/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newStudent)
        });

        if (!response.ok) {
            throw new Error("Unable to add student");
        }

        await loadStudents();

        studentForm.reset();

        alert("Student added successfully!");

        showPage("students");

    } catch (error) {

        console.error(error);
        alert("Unable to add student. Please check the backend.");

    }

});
// Display records from c backend when website opens
loadStudents();

// ========================================
// STEP 4: SEARCH STUDENT FUNCTIONALITY
// ========================================

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function() {

    // Get the search text
    const searchText = searchInput.value.toLowerCase().trim();

    // Get the student table
    const tableBody = document.getElementById("studentsTableBody");

    // Clear the previous results
    tableBody.innerHTML = "";

    // Filter student records
    const filteredStudents = students.filter(function(student) {

        return (
            String(student.roll).includes(searchText) ||
            student.name.toLowerCase().includes(searchText) ||
            student.department.toLowerCase().includes(searchText)
        );

    });

    // Display a message if no student is found
    if (filteredStudents.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">No matching student found.</td>
            </tr>
        `;

        return;
    }

    // Display matching students
    filteredStudents.forEach(function(student) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.roll}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.year}</td>
            <td>${student.semester}</td>
            <td>${student.marks.toFixed(2)}</td>
            <td>
    <button class="primary-btn edit-student"
        data-roll="${student.roll}" type="button">
        Edit
    </button>

    <button class="delete-btn delete-student"
        data-roll="${student.roll}" type="button">
        Delete
    </button>
</td>
        `;

        tableBody.appendChild(row);

    });

});

// ========================================
// STEP 5: UPDATE STUDENT FUNCTIONALITY
// ========================================

const studentsTableBody = document.getElementById("studentsTableBody");

studentsTableBody.addEventListener("click", async function(event) {

    if (!event.target.classList.contains("edit-student")) {
        return;
    }

    const roll = Number(event.target.dataset.roll);

    const student = students.find(function(s) {
        return s.roll === roll;
    });

    if (!student) {
        alert("Student not found!");
        return;
    }

    const newName = prompt("Enter new name:", student.name);
    if (newName === null) return;

    const newEmail = prompt("Enter new email:", student.email);
    if (newEmail === null) return;

    const newPhone = prompt("Enter new phone:", student.phone);
    if (newPhone === null) return;

    const newDepartment = prompt("Enter new department:", student.department);
    if (newDepartment === null) return;

    const newYear = prompt("Enter new year:", student.year);
    if (newYear === null) return;

    const newSemester = prompt("Enter new semester:", student.semester);
    if (newSemester === null) return;

    const newMarks = prompt("Enter new marks (0-100):", student.marks);
    if (newMarks === null) return;

    if (
        newName.trim() === "" ||
        newEmail.trim() === "" ||
        newPhone.trim() === "" ||
        newDepartment.trim() === "" ||
        newYear.trim() === "" ||
        newSemester.trim() === "" ||
        newMarks.trim() === "" ||
        isNaN(Number(newMarks)) ||
        Number(newMarks) < 0 ||
        Number(newMarks) > 100
    ) {
        alert("Please enter valid student details!");
        return;
    }

    const updatedStudent = {
        name: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        department: newDepartment.trim(),
        year: newYear.trim(),
        semester: newSemester.trim(),
        marks: Number(newMarks)
    };

    try {

        const response = await fetch(API_URL + "/students/" + roll, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedStudent)
        });

        if (!response.ok) {
            throw new Error("Unable to update student");
        }

        await loadStudents();

        alert("Student record updated successfully!");

    } catch (error) {

        console.error(error);
        alert("Unable to update student. Please check the backend.");

    }

});

// ========================================
// STEP 6: DELETE STUDENT FUNCTIONALITY
// ========================================

studentsTableBody.addEventListener("click", async function(event) {

    if (!event.target.classList.contains("delete-student")) {
        return;
    }

    const roll = Number(event.target.dataset.roll);

    const studentIndex = students.findIndex(function(student) {
        return student.roll === roll;
    });

    if (studentIndex === -1) {
        alert("Student not found!");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(API_URL + "/students/" + roll, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete student");
        }

        await loadStudents();

        alert("Student deleted successfully!");

    } catch (error) {

        console.error(error);
        alert("Unable to delete student. Please check the backend.");

    }

});

// ========================================
// STEP 7: REPORTS AND ANALYTICS
// ========================================

let performanceChart = null;
let passFailChart = null;

function updateReports() {

    const total = students.length;

    // Handle empty student records
    if (total === 0) {

        document.getElementById("highestMarks").textContent = "0";
        document.getElementById("lowestMarks").textContent = "0";
        document.getElementById("reportAverage").textContent = "0%";

        document.getElementById("reportMessage").textContent =
            "No student records available. Add students to view reports.";

        if (performanceChart) {
            performanceChart.destroy();
            performanceChart = null;
        }

        if (passFailChart) {
            passFailChart.destroy();
            passFailChart = null;
        }

        return;
    }

    // Calculate highest marks
    const highest = Math.max(
        ...students.map(student => Number(student.marks))
    );

    // Calculate lowest marks
    const lowest = Math.min(
        ...students.map(student => Number(student.marks))
    );

    // Calculate average marks
    const average = students.reduce(
        (sum, student) => sum + Number(student.marks), 0
    ) / total;

    // Display report values
    document.getElementById("highestMarks").textContent =
        highest.toFixed(2);

    document.getElementById("lowestMarks").textContent =
        lowest.toFixed(2);

    document.getElementById("reportAverage").textContent =
        average.toFixed(2) + "%";

    // Display performance summary
    document.getElementById("reportMessage").textContent =
        "Your system currently has " + total +
        " student records, with an average score of " +
        average.toFixed(2) + "%.";

    // ========================================
    // STUDENT MARKS DISTRIBUTION
    // ========================================

    const ranges = {
        "90–100": 0,
        "80–89": 0,
        "70–79": 0,
        "60–69": 0,
        "Below 60": 0
    };

    students.forEach(student => {

        const marks = Number(student.marks);

        if (marks >= 90) {
            ranges["90–100"]++;
        } else if (marks >= 80) {
            ranges["80–89"]++;
        } else if (marks >= 70) {
            ranges["70–79"]++;
        } else if (marks >= 60) {
            ranges["60–69"]++;
        } else {
            ranges["Below 60"]++;
        }

    });

    // Create bar chart
    const ctx = document.getElementById("performanceChart");

    if (performanceChart) {
        performanceChart.destroy();
    }

    performanceChart = new Chart(ctx, {

        type: "bar",

        data: {
            labels: Object.keys(ranges),

            datasets: [{
                label: "Number of Students",
                data: Object.values(ranges),

                backgroundColor: [
                    "#2563eb",
                    "#3b82f6",
                    "#60a5fa",
                    "#93c5fd",
                    "#cbd5e1"
                ],

                borderRadius: 8,
                borderSkipped: false
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                title: {
                    display: true,
                    text: "Student Marks Distribution"
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        stepSize: 1
                    },

                    title: {
                        display: true,
                        text: "Number of Students"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Marks Range"
                    }
                }
            }
        }
    });

    // ========================================
    // PASS AND FAIL PIE CHART
    // ========================================

    const passed = students.filter(
        student => Number(student.marks) >= 40
    ).length;

    const failed = total - passed;

    const pieCtx = document.getElementById("passFailChart");

    if (passFailChart) {
        passFailChart.destroy();
    }

    passFailChart = new Chart(pieCtx, {

        type: "pie",

        data: {
            labels: ["Passed", "Failed"],

            datasets: [{
                data: [passed, failed],

                backgroundColor: [
                    "#22c55e",
                    "#ef4444"
                ],

                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                title: {
                    display: true,
                    text: "Pass vs Fail Analysis"
                },

                legend: {
                    position: "bottom"
                }
            }
        }
    });

}