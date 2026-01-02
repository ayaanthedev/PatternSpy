// Initialize chart variable
let chart;

// Function to get current date and day
function getCurrentDateInfo() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
        date: now.toISOString().split('T')[0],
        day: days[now.getDay()],
        displayDate: `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
    };
}

// Function to update header with current date
function updateDateDisplay() {
    const dateInfo = getCurrentDateInfo();
    document.getElementById('currentDate').textContent = dateInfo.displayDate;
    document.getElementById('currentDay').textContent = dateInfo.day;
}

// Function to get day name from date string
function getDayName(dateString) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString + 'T00:00:00');
    return days[date.getDay()];
}

// Function to get week dates (last 7 days)
function getWeekDates() {
    const dates = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
}

// Function to aggregate data by date and habit
function aggregateDataByDateAndHabit(logs) {
    const aggregated = {};
    
    logs.forEach(log => {
        const key = `${log.date}-${log.habit}`;
        if (!aggregated[key]) {
            aggregated[key] = {
                date: log.date,
                habit: log.habit,
                timeSpent: 0
            };
        }
        aggregated[key].timeSpent += parseFloat(log.timeSpent);
    });
    
    return Object.values(aggregated);
}

// Function to prepare weekly chart data
function prepareWeeklyChartData(logs) {
    const weekDates = getWeekDates();
    const aggregatedLogs = aggregateDataByDateAndHabit(logs);
    
    // Get all unique habits
    const habits = [...new Set(aggregatedLogs.map(log => log.habit))];
    
    // Prepare series data for each habit
    const series = habits.map(habit => {
        const data = weekDates.map(date => {
            const log = aggregatedLogs.find(l => l.date === date && l.habit === habit);
            return log ? parseFloat(log.timeSpent.toFixed(1)) : 0;
        });
        
        return {
            name: habit,
            data: data
        };
    });
    
    // Format dates for display (e.g., "Mon 02")
    const categories = weekDates.map(date => {
        const d = new Date(date + 'T00:00:00');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${days[d.getDay()]} ${d.getDate()}`;
    });
    
    return { series, categories };
}

// Function to render weekly chart
function renderWeeklyChart(logs) {
    const { series, categories } = prepareWeeklyChartData(logs);
    
    const options = {
        series: series,
        chart: {
            type: 'line',
            height: 350,
            background: 'transparent',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                }
            }
        },
        colors: ['#2E0C99', '#AEC8D5', '#6B42D6', '#8BA9BA', '#4A1FBD', '#C5D9E3', '#5232B5'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        markers: {
            size: 5,
            hover: {
                size: 7
            }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#A8B2D1',
                    fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            title: {
                text: 'Hours',
                style: {
                    color: '#A8B2D1',
                    fontSize: '14px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 600
                }
            },
            labels: {
                style: {
                    colors: '#A8B2D1',
                    fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif'
                },
                formatter: function(value) {
                    return value.toFixed(1) + 'h';
                }
            }
        },
        grid: {
            borderColor: 'rgba(174, 200, 213, 0.05)',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            labels: {
                colors: '#A8B2D1'
            },
            markers: {
                width: 12,
                height: 12,
                radius: 12
            },
            itemMargin: {
                horizontal: 15,
                vertical: 5
            }
        },
        tooltip: {
            theme: 'dark',
            x: {
                show: true
            },
            y: {
                formatter: function(value) {
                    return value.toFixed(1) + ' hours';
                }
            },
            style: {
                fontSize: '13px',
                fontFamily: 'DM Sans, sans-serif'
            }
        }
    };
    
    // Destroy existing chart if it exists
    if (chart) {
        chart.destroy();
    }
    
    // Create new chart
    chart = new ApexCharts(document.querySelector("#weeklyChart"), options);
    chart.render();
}

// Function to load logs from localStorage
function loadLogs() {
    let logs = JSON.parse(localStorage.getItem("habitLogs")) || [];
    const tbody = document.querySelector("#habitTable tbody");
    const emptyState = document.getElementById("emptyState");
    
    tbody.innerHTML = ""; // Clear table
    
    if (logs.length === 0) {
        emptyState.classList.add('visible');
    } else {
        emptyState.classList.remove('visible');
        
        // Sort logs by date (newest first)
        logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        logs.forEach((log, index) => {
            const tr = document.createElement("tr");
            tr.style.animation = `fadeIn 0.4s ease-out ${index * 0.05}s both`;
            
            tr.innerHTML = `
                <td>${formatDateDisplay(log.date)}</td>
                <td>${log.day}</td>
                <td><strong>${log.habit}</strong></td>
                <td>${parseFloat(log.timeSpent).toFixed(1)}</td>
                <td>
                    <button class="delete-btn" onclick="deleteLog('${log.date}', '${log.habit}', ${log.timeSpent})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Update chart
    renderWeeklyChart(logs);
}

// Function to format date for display
function formatDateDisplay(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Function to add new log
document.getElementById("habitForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const dateInfo = getCurrentDateInfo();
    const habit = document.getElementById("habit").value.trim();
    const timeSpent = parseFloat(document.getElementById("timeSpent").value);
    
    if (habit === "" || timeSpent <= 0) {
        alert("Please enter valid habit name and time spent.");
        return;
    }
    
    const log = {
        date: dateInfo.date,
        day: dateInfo.day,
        habit: habit,
        timeSpent: timeSpent
    };
    
    let logs = JSON.parse(localStorage.getItem("habitLogs")) || [];
    logs.push(log);
    localStorage.setItem("habitLogs", JSON.stringify(logs));
    
    // Clear form
    document.getElementById("habitForm").reset();
    
    // Show success feedback
    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-text">Added! ✓</span>';
    submitBtn.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
    }, 2000);
    
    // Refresh table and chart
    loadLogs();
});

// Function to delete a log
function deleteLog(date, habit, timeSpent) {
    if (confirm(`Delete "${habit}" entry from ${formatDateDisplay(date)}?`)) {
        let logs = JSON.parse(localStorage.getItem("habitLogs")) || [];
        
        // Find and remove the specific log
        const index = logs.findIndex(log => 
            log.date === date && 
            log.habit === habit && 
            parseFloat(log.timeSpent) === parseFloat(timeSpent)
        );
        
        if (index > -1) {
            logs.splice(index, 1);
            localStorage.setItem("habitLogs", JSON.stringify(logs));
            loadLogs();
        }
    }
}

// Function to clear all data
document.getElementById("clearAll").addEventListener("click", function() {
    if (confirm("Are you sure you want to clear all habit data? This cannot be undone.")) {
        localStorage.removeItem("habitLogs");
        loadLogs();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateDateDisplay();
    loadLogs();
    
    // Update date display every minute
    setInterval(updateDateDisplay, 60000);
});