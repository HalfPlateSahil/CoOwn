// Ownership Data with passwords and booking limits per month
const ownershipData = [
    { name: "Saahil", password: "saahil123", percentage: 40, maxBookings: 12 },  // 40% ownership
    { name: "Rohan", password: "rohan456", percentage: 30, maxBookings: 9 },    // 30% ownership
    { name: "Anita", password: "anita789", percentage: 20, maxBookings: 6 },    // 20% ownership
    { name: "Vikas", password: "vikas123", percentage: 10, maxBookings: 3 }     // 10% ownership
];

// Store Scheduled Bookings with month tracking
let scheduledBookings = [];

// Track current user's bookings within the current month
let currentUserBookings = [];

// Store User Condition Reports
let conditionReports = [];

// Store Usage History
let usageHistory = [];

// User Login Simulation
let currentUser = '';
let currentUserMaxBookings = 0;

// Load Ownership Data
function loadOwnershipData() {
    const ownershipTableBody = document.querySelector("#ownershipTable tbody");
    ownershipData.forEach(owner => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${owner.name}</td><td>${owner.percentage}%</td>`;
        ownershipTableBody.appendChild(row);
    });
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Find the user in the ownership data
    const user = ownershipData.find(owner => owner.name === username && owner.password === password);
    
    if (user) {
        currentUser = user.name;
        currentUserMaxBookings = user.maxBookings;
        document.getElementById('userProfile').textContent = `Logged in as: ${currentUser}`;
        document.getElementById('bookingInfo').innerHTML = `
            <p>Total Bookings Available: ${currentUserMaxBookings}</p>
            <p>Bookings Used This Month: ${currentUserBookings.length}</p>
        `;
        document.getElementById('login').style.display = 'none';
        document.getElementById('ownership').style.display = 'block';
        document.getElementById('schedule').style.display = 'block';
        document.getElementById('reportCondition').style.display = 'block';
        document.getElementById('usageHistory').style.display = 'block';
        
        // Load user's current bookings for the month
        loadCurrentUserBookings();
    } else {
        alert("Incorrect username or password. Please try again.");
    }
}

// Add Booking
function addBooking(event) {
    event.preventDefault();

    const bookingType = document.querySelector('input[name="bookingType"]:checked').value;
    const date = document.getElementById('date').value;
    const numberOfDays = document.getElementById('numberOfDays').value;
    const month = document.getElementById('month').value;

    let bookingDates = [];

    if (bookingType === "single") {
        // Single Day Booking
        bookingDates.push(date);
    } else if (bookingType === "multiple") {
        // Multiple Days Booking
        if (!numberOfDays || numberOfDays < 2) {
            alert("Please enter a valid number of days (at least 2).");
            return;
        }

        for (let i = 0; i < numberOfDays; i++) {
            let newDate = new Date(date);
            newDate.setDate(newDate.getDate() + i);
            bookingDates.push(newDate.toISOString().split('T')[0]);
        }
    } else if (bookingType === "monthly") {
        // Monthly Booking
        if (!month) {
            alert("Please select a month.");
            return;
        }

        const monthStart = new Date(month + "-01");
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthStart.getMonth() + 1);

        for (let d = monthStart; d < monthEnd; d.setDate(d.getDate() + 1)) {
            bookingDates.push(d.toISOString().split('T')[0]);
        }
    }

    // Check if user has reached their max booking limit for the month
    const userBookingsThisMonth = currentUserBookings.filter(booking => isDateInCurrentMonth(booking.date));

    if (userBookingsThisMonth.length + bookingDates.length > currentUserMaxBookings) {
        alert(`You have reached your maximum booking limit of ${currentUserMaxBookings} days this month.`);
        return;
    }

    // Add booking
    bookingDates.forEach(bDate => {
        scheduledBookings.push({ name: currentUser, date: bDate });
        
        // Log usage history
        usageHistory.push({ name: currentUser, date: bDate, time: new Date().toLocaleTimeString() });
    });

    // Reload the current user's bookings
    loadCurrentUserBookings();
    
    // Display bookings and usage history, and show success notification
    displayBookings();
    displayUsageHistory();
    alert(`${currentUser} has successfully booked the car!`);

    // Update booking info
    updateBookingInfo();
}

// Logout User
function logout() {
    currentUser = '';
    currentUserMaxBookings = 0;
    scheduledBookings = [];
    currentUserBookings = [];
    usageHistory = [];
    document.getElementById('login').style.display = 'block';
    document.getElementById('ownership').style.display = 'none';
    document.getElementById('schedule').style.display = 'none';
    document.getElementById('reportCondition').style.display = 'none';
    document.getElementById('usageHistory').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('bookingInfo').innerHTML = '';
}

// Display Booking Information
function updateBookingInfo() {
    const bookingInfo = document.getElementById('bookingInfo');
    bookingInfo.innerHTML = `
        <p>Total Bookings Available: ${currentUserMaxBookings}</p>
        <p>Bookings Used This Month: ${currentUserBookings.length}</p>
    `;
}

// Display Scheduled Bookings
function displayBookings() {
    const scheduleList = document.getElementById('scheduleList');
    scheduleList.innerHTML = '';
    scheduledBookings.forEach(booking => {
        const listItem = document.createElement('li');
        listItem.textContent = `${booking.name} booked on ${booking.date}`;
        scheduleList.appendChild(listItem);
    });
}

// Display Usage History
function displayUsageHistory() {
    const usageList = document.getElementById('usageList');
    usageList.innerHTML = '';
    usageHistory.forEach(usage => {
        const listItem = document.createElement('li');
        listItem.textContent = `${usage.name} used the car on ${usage.date} at ${usage.time}`;
        usageList.appendChild(listItem);
    });
}

// Load Current User Bookings
function loadCurrentUserBookings() {
    const thisMonth = new Date().getMonth();
    currentUserBookings = scheduledBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return booking.name === currentUser && bookingDate.getMonth() === thisMonth;
    });
}

// Check if date is in current month
function isDateInCurrentMonth(dateString) {
    const date = new Date(dateString);
    const currentMonth = new Date().getMonth();
    return date.getMonth() === currentMonth;
}

// Event Listeners
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('scheduleForm').addEventListener('submit', addBooking);
document.getElementById('logoutButton').addEventListener('click', logout);

// Show additional inputs based on booking type selection
document.querySelectorAll('input[name="bookingType"]').forEach(input => {
    input.addEventListener('change', function() {
        document.getElementById('additionalDays').style.display = this.value === 'multiple' ? 'block' : 'none';
        document.getElementById('monthSelection').style.display = this.value === 'monthly' ? 'block' : 'none';
    });
});

// Load Ownership Data on Page Load
loadOwnershipData();
