// Function to load logs from localStorage
function loadLogs() {
    let logs = JSON.parse(localStorage.getItem("habitLogs")) || [];
    const tbody = document.querySelector("#habitTable tbody");
    tbody.innerHTML = ""; // Clear table

    logs.forEach(log => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${log.date}</td>
            <td>${log.habit}</td>
            <td>${log.timeSpent}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Function to add new log
document.getElementById("habitForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const date = document.getElementById("date").value;
    const habit = document.getElementById("habit").value;
    const timeSpent = parseFloat(document.getElementById("timeSpent").value);

    const log = { date, habit, timeSpent };

    let logs = JSON.parse(localStorage.getItem("habitLogs")) || [];
    logs.push(log);
    localStorage.setItem("habitLogs", JSON.stringify(logs));

    // Clear form
    document.getElementById("habitForm").reset();

    // Refresh table
    loadLogs();
});

// Load table on page load
loadLogs();
