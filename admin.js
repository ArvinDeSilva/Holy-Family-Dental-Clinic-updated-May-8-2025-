let currentDetailId = null;
let currentRejectId = null;
let currentTodayAppointmentId = null;
let currentAcceptId = null;
let currentAcceptIds = [];

// Debug logging function
function debugLog(label, data) {
    console.log(`%c${label}:`, 'color: #00bfff; font-weight: bold', data);
}

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

// Set initial theme
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.checked = currentTheme === 'dark';

themeToggle.addEventListener('change', function() {
    const theme = this.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// Toast notification function
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container') || (() => {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    })();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon;
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle" style="color: #28a745;"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-times-circle" style="color: #dc3545;"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle" style="color: var(--sidebar-active);"></i>';
    }
    
    toast.innerHTML = `${icon} ${message}`;
    toastContainer.appendChild(toast);

    // Remove toast after animation
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Appointment data
const appointmentRequests = [
    {
        id: 1,
        patientName: "Ric Arvin C. De Silva",
        requestedDate: new Date().toISOString().split('T')[0],
        requestedTime: "10:00 AM",
        procedure: "Dental Cleaning",
        requestDate: new Date().toISOString().split('T')[0],
        contact: "09123456789",
        notes: "Patient has sensitivity to cold",
        patientInfo: {
            patientId: "HFDC-2023-001",
            birthdate: "1990-05-15",
            age: 33,
            gender: "Male",
            address: "123 Main St, Quezon City",
            email: "ricarvin@example.com"
        }
    },
    {
        id: 2,
        patientName: "Sammuel Cabison",
        requestedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        requestedTime: "2:30 PM",
        procedure: "Root Canal",
        requestDate: new Date().toISOString().split('T')[0],
        contact: "+63 912 345 6789",
        notes: "Follow-up treatment",
        patientInfo: {
            patientId: "HFDC-2023-002",
            birthdate: "1991-06-15",
            age: 32,
            gender: "Male",
            address: "456 Oak St, Makati City",
            email: "sammycabisheesh@example.com"
        }
    }
];

const appointmentLogs = [];
const todayAppointments = [
    {
        id: 1,
        patientName: "John Smith",
        date: new Date().toISOString().split('T')[0],
        time: "10:00 AM",
        procedure: "Dental Cleaning",
        status: "Scheduled",
        patientInfo: {
            patientId: "HFDC-2023-003",
            birthdate: "1985-03-20",
            age: 38,
            gender: "Male",
            address: "789 Pine St, Manila",
            email: "johnsmith@example.com"
        }
    },
    {
        id: 2,
        patientName: "Maria Garcia",
        date: new Date().toISOString().split('T')[0],
        time: "11:30 AM",
        procedure: "Tooth Extraction",
        status: "Confirmed",
        patientInfo: {
            patientId: "HFDC-2023-004",
            birthdate: "1988-11-12",
            age: 35,
            gender: "Female",
            address: "321 Elm St, Pasig City",
            email: "mariagarcia@example.com"
        }
    },
    {
        id: 3,
        patientName: "David Wilson",
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: "9:00 AM",
        procedure: "Tooth Extraction",
        status: "Confirmed",
        patientInfo: {
            patientId: "HFDC-2023-005",
            birthdate: "1979-09-05",
            age: 44,
            gender: "Male",
            address: "654 Maple St, Taguig City",
            email: "davidwilson@example.com"
        }
    }
];

// Statistics data
const statsData = {
    weekly: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        visits: [30, 45, 35, 50, 40, 35, 45],
        income: [1500, 2250, 1750, 2500, 2000, 1750, 2250]
    },
    monthly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        visits: [200, 250, 180, 300],
        income: [10000, 12500, 9000, 15000]
    },
    yearly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        visits: [800, 900, 1200, 1100, 1300, 1400, 1200, 1100, 1000, 1200, 1300, 1500],
        income: [40000, 45000, 60000, 55000, 65000, 70000, 60000, 55000, 50000, 60000, 65000, 75000]
    }
};

// Helper function to convert 12-hour to 24-hour format
function convertTo24Hour(time12h) {
    if (!time12h) return '';
    
    const [time, modifier] = time12h.toUpperCase().split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    
    if (modifier === 'PM' && hours < 12) {
        hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return `${String(hours).padStart(2, '0')}:${minutes}:00`;
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    debugLog('Initializing dashboard...');
    debugLog('Initial Appointment Requests', appointmentRequests);
    debugLog('Initial Today Appointments', todayAppointments);
    
    // Verify DOM elements
    const criticalElements = [
        'rejectConfirmationModal',
        'appointmentDetailsModal',
        'requestTableBody',
        'todayTableBody'
    ];
    
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Critical element missing: ${id}`);
        }
    });
    
    // Initialize components
    initCharts();
    updateRequestsTable();
    updateRequestCount();
    initializeTodaySection();
    initializeCalendar();
    updateStatistics();

    // Handle select all checkboxes
    document.getElementById('selectAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#requestTableBody input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
        updateBulkActionVisibility('requestTableBody', 'requestBulkActions', 'requestSelectedCount');
    });

    document.getElementById('selectAllToday').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('#todayTableBody input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
        updateBulkActionVisibility('todayTableBody', 'appointmentBulkActions', 'appointmentSelectedCount');
    });

    // Check for expired appointments every minute
    checkExpiredAppointments();
    setInterval(checkExpiredAppointments, 60000);
    updateTodayCount();
});

// Appointment functions
function logAppointmentAction(request, action) {
    const logEntry = {
        id: request.id,
        patientName: request.patientName,
        requestedDateTime: `${request.requestedDate} ${request.requestedTime}`,
        procedure: request.procedure,
        status: action,
        actionDate: new Date().toISOString(),
        actionType: action === "Auto-Cancelled" ? "System" : "Manual"
    };

    // Get existing logs from localStorage
    let appointmentLogs = JSON.parse(localStorage.getItem('appointmentLogs') || '[]');
    appointmentLogs.push(logEntry);
    
    // Save updated logs to localStorage
    localStorage.setItem('appointmentLogs', JSON.stringify(appointmentLogs));
}

function updateRequestsTable() {
    const tableBody = document.getElementById('requestTableBody');
    tableBody.innerHTML = '';
    
    if (appointmentRequests.length === 0) {
        // Create a row showing no requests
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px;">
                <i class="fas fa-inbox" style="font-size: 24px; color: var(--text-muted); margin-bottom: 10px;"></i>
                <p style="color: var(--text-muted); margin: 0;">No appointment requests available</p>
            </td>
        `;
        tableBody.appendChild(emptyRow);
        
        // Disable select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        selectAllCheckbox.disabled = true;
        selectAllCheckbox.checked = false;
        
        // Hide bulk actions if visible
        const bulkActions = document.getElementById('requestBulkActions');
        bulkActions.classList.remove('show');
        return;
    }

    // Enable select all checkbox if there are requests
    const selectAllCheckbox = document.getElementById('selectAll');
    selectAllCheckbox.disabled = false;
    
    appointmentRequests.forEach(request => {
        const requestDate = new Date(request.requestDate);
        const requestedDate = new Date(request.requestedDate);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="checkbox-wrapper"><input type="checkbox" data-id="${request.id}" ${selectAllCheckbox.checked ? 'checked' : ''}></td>
            <td class="clickable-cell" onclick="showAppointmentDetails(${request.id})">
                <span class="patient-name">${request.patientName}</span>
            </td>
            <td class="clickable-cell" onclick="showAppointmentDetails(${request.id})">
                ${formatDateForDisplay(requestedDate)}
            </td>
            <td class="clickable-cell" onclick="showAppointmentDetails(${request.id})">
                ${ensureTimeFormat(request.requestedTime)}
            </td>
            <td class="clickable-cell" onclick="showAppointmentDetails(${request.id})">
                <span class="procedure-tag">${request.procedure}</span>
            </td>
            <td class="clickable-cell" onclick="showAppointmentDetails(${request.id})">
                ${formatDateToString(requestDate)}
            </td>
            <td>
                <button class="action-btn accept-btn" onclick="acceptRequest(${request.id})">
                    <i class="fas fa-check"></i> Accept
                </button>
                <button class="action-btn reject-btn" onclick="showRejectModal(${request.id})">
                    <i class="fas fa-times"></i> Reject
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Update bulk actions visibility after table update
    updateBulkActionVisibility('requestTableBody', 'requestBulkActions', 'requestSelectedCount');
}

function updateRequestCount() {
    const requestCount = document.getElementById('requestCount');
    const count = appointmentRequests.length;
    requestCount.textContent = count;
    
    // Show/hide based on count
    if (count > 0) {
        requestCount.classList.add('show');
    } else {
        requestCount.classList.remove('show');
    }
}

function openTodayTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.tab-pane');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabContents.forEach(tab => tab.classList.remove('active'));
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

function showTodayAppointmentDetails(id) {
    currentTodayAppointmentId = id;
    const appointment = todayAppointments.find(app => app.id === id);
    
    if (!appointment) {
        showToast('Appointment not found', 'error');
        return;
    }

    // Reset all tabs to inactive
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Set patient info tab as active
    document.getElementById('today-patient-info').classList.add('active');
    document.querySelector('.tab-btn[onclick*="today-patient-info"]').classList.add('active');
    
    // Populate patient info
    document.getElementById('today-patient-name').textContent = appointment.patientName;
    document.getElementById('today-patient-id').textContent = appointment.patientInfo?.patientId || 'N/A';
    document.getElementById('today-contact').textContent = appointment.patientInfo?.contact || appointment.contact || 'Not provided';
    document.getElementById('today-email').textContent = appointment.patientInfo?.email || 'Not provided';
    document.getElementById('today-age').textContent = appointment.patientInfo?.age || 'Not provided';
    document.getElementById('today-gender').textContent = appointment.patientInfo?.gender || 'Not provided';
    document.getElementById('today-address').textContent = appointment.patientInfo?.address || 'Not provided';
    
    // Populate appointment info
    document.getElementById('today-appointment-date').textContent = formatDateForDisplay(new Date(appointment.date));
    document.getElementById('today-appointment-time').textContent = ensureTimeFormat(appointment.time);
    document.getElementById('today-procedure').textContent = appointment.procedure;
    
    // Set status badge
    const statusBadge = document.getElementById('today-status');
    statusBadge.textContent = appointment.status;
    statusBadge.className = 'status-badge status-' + appointment.status.toLowerCase();
    
    // Load photos and forms
    loadTodayPatientPhotos(id);
    loadTodayPatientForms(id);
    
    // Load appointment history
    loadTodayAppointmentHistory(id);
    
    // Show modal
    document.getElementById('todayAppointmentModal').classList.add('active');
}

function loadTodayPatientPhotos(patientId) {
    const beforePhotos = document.getElementById('today-before-photos');
    const afterPhotos = document.getElementById('today-after-photos');
    
    // Clear existing photos
    beforePhotos.innerHTML = '';
    afterPhotos.innerHTML = '';
    
    // Sample data - replace with actual data from your backend
    const sampleBeforePhotos = [];
    const sampleAfterPhotos = [];
    
    if (sampleBeforePhotos.length === 0) {
        beforePhotos.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-camera-slash"></i>
                <p>No before photos uploaded</p>
            </div>
        `;
    } else {
        sampleBeforePhotos.forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `
                <img src="${photo.url}" alt="Before treatment">
                <button class="delete-photo" onclick="deleteTodayPhoto(${photo.id}, 'before')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            beforePhotos.appendChild(photoItem);
        });
    }
    
    if (sampleAfterPhotos.length === 0) {
        afterPhotos.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-camera-slash"></i>
                <p>No after photos uploaded</p>
            </div>
        `;
    } else {
        sampleAfterPhotos.forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `
                <img src="${photo.url}" alt="After treatment">
                <button class="delete-photo" onclick="deleteTodayPhoto(${photo.id}, 'after')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            afterPhotos.appendChild(photoItem);
        });
    }
}

function loadTodayPatientForms(patientId) {
    const formsList = document.getElementById('today-forms-list');
    const formPreview = document.getElementById('today-form-preview');
    
    // Clear existing forms
    formsList.innerHTML = '';
    
    // Sample data - replace with actual data from your backend
    const sampleForms = [];
    
    if (sampleForms.length === 0) {
        formsList.innerHTML = `
            <li class="empty-state">
                <i class="fas fa-file-excel"></i>
                <p>No forms uploaded</p>
            </li>
        `;
    } else {
        sampleForms.forEach(form => {
            const formItem = document.createElement('li');
            formItem.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <div>
                    <div>${form.name}</div>
                    <small>${formatDateForDisplay(new Date(form.date))}</small>
                </div>
            `;
            formItem.addEventListener('click', () => previewTodayForm(form.id));
            formsList.appendChild(formItem);
        });
    }
}

function uploadTodayPhoto(type) {
    showToast(`Upload ${type} photo functionality would be implemented here`, 'info');
}

function uploadTodayForm() {
    showToast('Upload form functionality would be implemented here', 'info');
}

function deleteTodayPhoto(photoId, type) {
    if (confirm(`Are you sure you want to delete this ${type} photo?`)) {
        showToast(`Deleted ${type} photo`, 'success');
        loadTodayPatientPhotos(currentTodayAppointmentId);
    }
}

function previewTodayForm(formId) {
    const formPreview = document.getElementById('today-form-preview');
    formPreview.innerHTML = `
        <iframe src="path/to/form_${formId}.pdf" style="width:100%; height:100%; border:none;"></iframe>
    `;
}

// Today's appointments functions
function initializeTodaySection() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('todayDate').textContent = today.toLocaleDateString('en-US', options);
    updateAppointmentsForDate(today);
}

function confirmAppointment(id) {
    const appointmentIndex = todayAppointments.findIndex(app => app.id === id);
    if (appointmentIndex !== -1) {
        todayAppointments[appointmentIndex].status = "Confirmed";
        updateAppointmentsForDate(new Date(todayAppointments[appointmentIndex].date));
        updateStatistics();
        showToast(`Appointment confirmed for ${todayAppointments[appointmentIndex].patientName}`, 'success');
    }
}

function cancelAppointment(id) {
    const appointmentIndex = todayAppointments.findIndex(app => app.id === id);
    if (appointmentIndex !== -1) {
        const appointment = todayAppointments[appointmentIndex];
        todayAppointments[appointmentIndex].status = "Cancelled";
        
        // Update canceled count
        const canceledCount = document.getElementById('canceledCount');
        canceledCount.textContent = (parseInt(canceledCount.textContent) + 1).toString();
        
        // Update UI
        updateAppointmentsForDate(new Date(appointment.date));
        updateStatistics();
        updateCalendar(new Date());
        
        showToast(`Appointment cancelled for ${appointment.patientName}`, 'warning');
    }
}

function completeAppointment(id) {
    const appointmentIndex = todayAppointments.findIndex(app => app.id === id);
    if (appointmentIndex !== -1) {
        const appointment = todayAppointments[appointmentIndex];
        
        // Update status to completed
        todayAppointments[appointmentIndex].status = "Completed";
        
        // Update the status badge in the modal
        const statusBadge = document.getElementById('today-status');
        statusBadge.textContent = "Completed";
        statusBadge.className = 'status-badge status-completed';
        
        // Add to completed appointments count
        const completedCount = document.getElementById('completedCount');
        completedCount.textContent = (parseInt(completedCount.textContent) + 1).toString();
        
        // Update UI without closing modal
        updateAppointmentsForDate(new Date(appointment.date));
        updateStatistics();
        updateCalendar(new Date());
        
        showToast(`Appointment completed for ${appointment.patientName}`, 'success');
    }
}

function closePhotoConfirmationModal() {
    const modal = document.querySelector('.confirmation-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function finalizeCompletion(id) {
    const appointmentIndex = todayAppointments.findIndex(app => app.id === id);
    if (appointmentIndex !== -1) {
        const appointment = todayAppointments[appointmentIndex];
        
        // Create completed appointment record
        const completedAppointment = {
            ...appointment,
            status: "Completed",
            completedDate: new Date().toISOString()
        };
        
        // Add to completed appointments count
        const completedCount = document.getElementById('completedCount');
        completedCount.textContent = (parseInt(completedCount.textContent) + 1).toString();
        
        // Remove from today's appointments
        todayAppointments.splice(appointmentIndex, 1);
        
        // Update calendar by removing the appointment dot
        updateCalendar(new Date());
        
        // Update today's appointment count in notification badge
        updateTodayCount();
        
        // Update UI
        updateAppointmentsForDate(new Date(appointment.date));
        updateStatistics();
        
        showToast(`Appointment completed for ${appointment.patientName}`, 'success');
        closePhotoConfirmationModal();
        closeTodayAppointmentModal();
    }
}

function updateTodayCount() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointmentCount = todayAppointments.filter(app => 
        app.date === todayStr && 
        app.status !== "Completed" && 
        app.status !== "Cancelled"
    ).length;
    
    const todayCountBadge = document.getElementById('todayCount');
    todayCountBadge.textContent = todayAppointmentCount;
    
    // Show/hide the notification badge
    if (todayAppointmentCount > 0) {
        todayCountBadge.classList.add('show');
    } else {
        todayCountBadge.classList.remove('show');
    }
}

function cancelTodayAppointment(id) {
    if (confirm("Are you sure you want to cancel this appointment?")) {
        const appointmentIndex = todayAppointments.findIndex(app => app.id === id);
        if (appointmentIndex !== -1) {
            const appointment = todayAppointments[appointmentIndex];
            todayAppointments[appointmentIndex].status = "Cancelled";
            
            // Update the status badge in the modal
            const statusBadge = document.getElementById('today-status');
            statusBadge.textContent = "Cancelled";
            statusBadge.className = 'status-badge status-cancelled';
            
            // Update UI without closing modal
            updateAppointmentsForDate(new Date(appointment.date));
            updateStatistics();
            updateCalendar(new Date());
            
            showToast(`Appointment cancelled for ${appointment.patientName}`, 'warning');
        }
    }
}

// Add these new helper functions for date formatting
function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

function formatDateToString(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

function ensureTimeFormat(timeStr) {
    if (!timeStr) return '';
    
    // If time already includes AM/PM, return as is
    if (timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM')) {
        return timeStr;
    }

    // Convert 24h to 12h format with AM/PM
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

function updateAppointmentsForDate(date) {
    // Format the selected date to YYYY-MM-DD format
    const formattedDate = date.toISOString().split('T')[0];
    const todayTableBody = document.getElementById('todayTableBody');
    const todayCount = document.getElementById('todayCount');
    
    // Clear existing appointments
    todayTableBody.innerHTML = '';
    
    // Filter appointments for selected date using strict equality
    const dateAppointments = todayAppointments.filter(appointment => {
        // Parse the appointment date string into a Date object
        const apptDate = new Date(appointment.date);
        // Compare year, month, and day separately
        return apptDate.getFullYear() === date.getFullYear() &&
               apptDate.getMonth() === date.getMonth() &&
               apptDate.getDate() === date.getDate();
    });
    
    // Update appointment count
    todayCount.textContent = dateAppointments.length;
    
    // Show/hide based on count
    if (dateAppointments.length > 0) {
        todayCount.classList.add('show');
    } else {
        todayCount.classList.remove('show');
    }
    
    // Sort appointments by time
    dateAppointments.sort((a, b) => {
        return a.time.localeCompare(b.time);
    });
    
    // Populate table with filtered and sorted appointments
    dateAppointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        const row = document.createElement('tr');
        row.onclick = (e) => {
            if (!e.target.closest('button') && !e.target.closest('input[type="checkbox"]')) {
                showTodayAppointmentDetails(appointment.id);
            }
        };
        row.style.cursor = 'pointer';

        // Determine which buttons/status to show based on status
        let actionColumn = '';
        if (appointment.status === "Scheduled") {
            actionColumn = `
                <button class="action-btn confirm-btn" onclick="event.stopPropagation(); confirmAppointment(${appointment.id})">
                    <i class="fas fa-check"></i> Confirm
                </button>
                <button class="action-btn cancel-btn" onclick="event.stopPropagation(); cancelAppointment(${appointment.id})">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
        } else if (appointment.status === "Confirmed") {
            actionColumn = `<span class="status-badge status-confirmed"><i class="fas fa-check-circle"></i> Confirmed</span>`;
        } else if (appointment.status === "Completed" || appointment.status === "Cancelled") {
            actionColumn = `<span class="status-badge status-${appointment.status.toLowerCase()}">${appointment.status}</span>`;
        }

        row.innerHTML = `
            <td class="checkbox-wrapper">
                ${appointment.status === "Scheduled" ? `<input type="checkbox" data-id="${appointment.id}">` : ''}
            </td>
            <td><span class="patient-name" data-full-text="${appointment.patientName}">${appointment.patientName}</span></td>
            <td>${formatDateForDisplay(appointmentDate)}</td>
            <td>${ensureTimeFormat(appointment.time)}</td>
            <td><span class="procedure-tag" data-full-text="${appointment.procedure}">${appointment.procedure}</span></td>
            <td><span class="status-badge status-${appointment.status.toLowerCase()}">
                ${appointment.status}
            </span></td>
            <td>${actionColumn}</td>
        `;
        todayTableBody.appendChild(row);
    });

    
    // Update bulk actions visibility
    updateBulkActionVisibility('todayTableBody', 'appointmentBulkActions', 'appointmentSelectedCount');
}
// Statistics functions
function updateStatistics() {
    const today = new Date().toISOString().split('T')[0];
    
    // Count scheduled appointments for today
    const scheduledToday = todayAppointments.filter(app => 
        app.status === "Scheduled" && app.date === today
    ).length;
    
    // Count upcoming appointments (confirmed and not today)
    const upcoming = todayAppointments.filter(app => 
        app.status === "Confirmed" && app.date !== today
    ).length;
    
    // Count completed appointments
    const completed = todayAppointments.filter(app => 
        app.status === "Completed"
    ).length;
    
    // Count cancelled appointments
    const canceled = todayAppointments.filter(app => 
        app.status === "Cancelled"
    ).length;
    
    // Count pending requests
    const pending = appointmentRequests.length;
    
    // Count walk-ins (example - you might need to adjust this)
    const walkIns = todayAppointments.filter(app => 
        app.status === "Walk-in"
    ).length;

    document.getElementById('scheduledCount').textContent = scheduledToday;
    document.getElementById('upcomingCount').textContent = upcoming;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('canceledCount').textContent = canceled;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('walkInCount').textContent = walkIns;
}

// Chart functions
let patientActivityChart;

function initCharts() {
    const ctx = document.getElementById('patientActivityChart').getContext('2d');
    
    patientActivityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: statsData.weekly.labels,
            datasets: [{
                label: 'Patient Visits',
                data: statsData.weekly.visits,
                backgroundColor: 'rgba(0, 191, 255, 0.7)',
                borderColor: 'rgba(0, 191, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                        callback: function(value) {
                            const metric = document.getElementById('chartMetric').value;
                            if (metric === 'income') return '₱' + value.toLocaleString('en-PH');
                            return value;
                        }
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const metric = document.getElementById('chartMetric').value;
                            if (metric === 'income') return '₱' + context.parsed.y.toLocaleString('en-PH');
                            return context.parsed.y;
                        }
                    }
                },
                legend: { display: false }
            }
        }
    });
    
    updateTimePeriod('weekly');
    
    document.querySelectorAll('.time-period-btn').forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            updateTimePeriod(period);
            document.querySelectorAll('.time-period-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    document.getElementById('chartMetric').addEventListener('change', function() {
        const activePeriod = document.querySelector('.time-period-btn.active').getAttribute('data-period');
        updateChartData(activePeriod, this.value);
    });
}

function updateTimePeriod(period) {
    const metric = document.getElementById('chartMetric').value;
    updateChartData(period, metric);
    updatePercentageText(period);
}

function updateChartData(period, metric) {
    const data = statsData[period];
    
    patientActivityChart.data.datasets[0].label = metric === 'visits' ? 'Patient Visits' : 'Total Income ($)';
    patientActivityChart.data.datasets[0].data = metric === 'visits' ? data.visits : data.income;
    patientActivityChart.data.datasets[0].backgroundColor = metric === 'visits' ? 
        'rgba(0, 191, 255, 0.7)' : 'rgba(76, 175, 80, 0.7)';
    patientActivityChart.data.datasets[0].borderColor = metric === 'visits' ? 
        'rgba(0, 191, 255, 1)' : 'rgba(76, 175, 80, 1)';
    
    patientActivityChart.data.labels = data.labels;
    patientActivityChart.update();
}

function updatePercentageText(period) {
    const percentageElement = document.querySelector('.percentage-change');
    const metric = document.getElementById('chartMetric').value;
    const data = statsData[period][metric];
    
    const current = Array.isArray(data) ? data[data.length - 1] : data;
    const previous = Array.isArray(data) ? data[data.length - 2] : data * 0.9;
    
    const percentage = Math.round(((current - previous) / previous) * 100);
    const timeFrame = period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year';
    
    const text = `${percentage}% ${percentage >= 0 ? 'higher' : 'lower'} than last ${timeFrame}`;
    percentageElement.textContent = text;
    percentageElement.style.color = percentage >= 0 ? '#00bfff' : '#f44336';
}

// Calendar functions
function initializeCalendar() {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthYear = document.getElementById('currentMonthYear');
    
    calendarDays.innerHTML = '';
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day-header';
        dayElement.textContent = day;
        calendarDays.appendChild(dayElement);
    });

    updateCalendar(new Date());

    document.getElementById('prevMonth').addEventListener('click', () => {
        const currentDate = new Date(currentMonthYear.dataset.date);
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar(currentDate);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        const currentDate = new Date(currentMonthYear.dataset.date);
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar(currentDate);
    });

    document.getElementById('today').addEventListener('click', () => {
        const today = new Date();
        updateCalendar(today);
        
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        const allDays = document.querySelectorAll('.calendar-day');
        allDays.forEach(dayElement => {
            if (dayElement.classList.contains('today')) {
                dayElement.classList.add('selected');
                const formattedDate = today.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                document.getElementById('todayDate').textContent = formattedDate;
                updateAppointmentsForDate(today);
            }
        });
    });

    currentMonthYear.addEventListener('click', (e) => {
        const currentDate = new Date(currentMonthYear.dataset.date);
        if (!document.querySelector('.modal-overlay')) {
            showYearPicker(currentDate.getFullYear());
        }
    });
}

function updateCalendar(date) {
    const currentMonthYear = document.getElementById('currentMonthYear');
    const calendarGrid = document.getElementById('calendarGrid');
    const today = new Date();
    
    currentMonthYear.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    currentMonthYear.dataset.date = date.toISOString();
    calendarGrid.innerHTML = '';
    
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startingDay = firstDay.getDay();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const totalDays = lastDay.getDate();
    
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        
        // Format dates consistently for comparison
        const formattedDate = formatDate(currentDate);
        
        if (currentDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('selected');
            }
        }

        const hasAppointments = todayAppointments.some(appointment => {
            const apptDate = new Date(appointment.date);
            return apptDate.getFullYear() === currentDate.getFullYear() &&
                   apptDate.getMonth() === currentDate.getMonth() &&
                   apptDate.getDate() === currentDate.getDate() &&
                   appointment.status !== "Completed" && 
                   appointment.status !== "Cancelled";
        });
        
        if (hasAppointments) {
            dayElement.classList.add('has-appointments');
            
            // Create and append the appointment indicator dot
            const dot = document.createElement('div');
            dot.className = 'appointment-dot';
            dayElement.appendChild(dot);
        }

        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
        
        dayElement.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day.selected').forEach(el => {
                el.classList.remove('selected');
            });
            dayElement.classList.add('selected');
            
            updateAppointmentsForDate(currentDate);
            
            const formattedDate = currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('todayDate').textContent = formattedDate;
        });
    }
}

// Helper function to format dates consistently
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Date picker functions
function showYearPicker(year) {
    closeDatePicker();
    
    const calendarContainer = document.querySelector('.calendar-container');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const datePickerPopup = document.createElement('div');
    datePickerPopup.className = 'date-picker-popup';
    
    calendarContainer.appendChild(overlay);
    overlay.appendChild(datePickerPopup);
    
    setTimeout(() => overlay.classList.add('active'), 10);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeDatePicker();
    });
    
    const header = document.createElement('div');
    header.className = 'date-picker-header';
    header.innerHTML = `<h3>Select Year</h3><i class="fas fa-times" onclick="closeDatePicker()"></i>`;
    datePickerPopup.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'date-picker-grid';
    
    const startYear = year - 50;
    const endYear = year + 50;
    
    for (let y = startYear; y <= endYear; y++) {
        const yearElement = document.createElement('div');
        yearElement.className = 'year-option' + (y === year ? 'selected' : '');
        yearElement.textContent = y;
        yearElement.addEventListener('click', () => {
            document.querySelectorAll('.year-option').forEach(el => el.classList.remove('selected'));
            yearElement.classList.add('selected');
            showMonthPicker(y);
        });
        grid.appendChild(yearElement);
    }
    
    datePickerPopup.appendChild(grid);
    datePickerPopup.appendChild(createDatePickerActions());
    
    setTimeout(() => {
        const selectedYear = datePickerPopup.querySelector('.year-option.selected');
        if (selectedYear) selectedYear.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 100);
}

function showMonthPicker(year) {
    const datePickerPopup = document.querySelector('.date-picker-popup');
    if (!datePickerPopup) return;
    
    datePickerPopup.innerHTML = '';
    datePickerPopup.appendChild(createDatePickerHeader(`Select Month ${year}`));
    
    const grid = document.createElement('div');
    grid.className = 'date-picker-grid';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((month, index) => {
        const monthElement = document.createElement('div');
        monthElement.className = 'month-option';
        monthElement.textContent = month;
        monthElement.addEventListener('click', () => {
            const currentDate = new Date();
            currentDate.setFullYear(year);
            currentDate.setMonth(index);
            updateCalendar(currentDate);
            closeDatePicker();
        });
        grid.appendChild(monthElement);
    });
    
    datePickerPopup.appendChild(grid);
    datePickerPopup.appendChild(createDatePickerActions());
}

function createDatePickerHeader(title) {
    const header = document.createElement('div');
    header.className = 'date-picker-header';
    header.innerHTML = `<h3>${title}</h3><i class="fas fa-times" onclick="closeDatePicker()"></i>`;
    return header;
}

function createDatePickerActions() {
    const actions = document.createElement('div');
    actions.className = 'date-picker-actions';
    actions.innerHTML = `<button class="cancel" onclick="closeDatePicker()">Cancel</button>`;
    return actions;
}

function closeDatePicker() {
    const calendarContainer = document.querySelector('.calendar-container');
    const overlay = calendarContainer.querySelector('.modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

// Modal functions
function showRejectModal(id) {
    currentRejectId = id;
    // Close details modal before showing reject modal
    closeDetailsModal();
    document.getElementById('rejectConfirmationModal').classList.add('active');
}

function closeRejectModal() {
    document.getElementById('rejectConfirmationModal').classList.remove('active');
    currentRejectId = null;
    document.getElementById('rejectionReason').value = '';
}

function submitRejection() {
    const reason = document.getElementById('rejectionReason').value.trim();
    if (!reason) {
        showToast('Please provide a reason for rejection', 'warning');
        return;
    }
    
    if (currentRejectId) {
        rejectRequest(currentRejectId, reason);
    } else {
        bulkRejectRequests(reason);
    }
    
    closeRejectModal();
    currentDetailId = null;
}

function rejectRequest(id, reason) {
    const requestIndex = appointmentRequests.findIndex(req => req.id === id);
    if (requestIndex !== -1) {
        const request = appointmentRequests[requestIndex];
        
        // Log the rejection
        logAppointmentAction({
            ...request,
            rejectionReason: reason
        }, "Rejected");
        
        // Remove the request from the array
        appointmentRequests.splice(requestIndex, 1);
        
        // Update UI
        updateRequestsTable();
        updateRequestCount();
        updateStatistics();
        
        // Show success notification
        showToast(`Rejected appointment for ${request.patientName}`, 'warning');
    }
}

function openTab(evt, tabName) {
    const modalId = evt.target.closest('.confirmation-modal').id;
    const modal = document.getElementById(modalId);
    
    if (!modal) return;

    const tabContents = modal.querySelectorAll('.tab-pane');
    const tabButtons = modal.querySelectorAll('.tab-btn');
    
    tabContents.forEach(tab => tab.classList.remove('active'));
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
        evt.currentTarget.classList.add('active');
    }
}

function showAppointmentDetails(id) {
    debugLog('Opening details for ID', id);
    currentDetailId = id;
    const request = appointmentRequests.find(req => req.id === id);
    
    if (!request) {
        debugLog('Request not found for ID', id);
        showToast('Appointment not found', 'error');
        return;
    }

    // Reset all tabs to inactive
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Set patient info tab as active
    document.getElementById('patient-info').classList.add('active');
    document.querySelector('.tab-btn[onclick*="patient-info"]').classList.add('active');
    
    debugLog('Found request', request);
    
    // Close any other open modals first
    closeAcceptModal();
    closeRejectModal();
    
    // Populate patient info
    document.getElementById('detail-patient-name').textContent = request.patientName;
    document.getElementById('detail-patient-id').textContent = request.patientInfo?.patientId || 'N/A';
    document.getElementById('detail-contact').textContent = request.contact || 'Not provided';
    document.getElementById('detail-email').textContent = request.patientInfo?.email || 'Not provided';
    document.getElementById('detail-age').textContent = request.patientInfo?.age || 'Not provided';
    document.getElementById('detail-gender').textContent = request.patientInfo?.gender || 'Not provided';
    document.getElementById('detail-address').textContent = request.patientInfo?.address || 'Not provided';
    
    // Populate appointment info
    document.getElementById('detail-requested-date').textContent = formatDateForDisplay(new Date(request.requestedDate));
    document.getElementById('detail-requested-time').textContent = ensureTimeFormat(request.requestedTime);
    document.getElementById('detail-procedure').textContent = request.procedure;
    document.getElementById('detail-notes').textContent = request.notes || 'No additional notes';
    
    // Load photos and forms (placeholder - you would implement actual loading)
    loadPatientPhotos(id);
    loadPatientForms(id);
    
    // Load appointment history
    loadAppointmentHistory(id);
    
    // Show modal
    document.getElementById('appointmentDetailsModal').classList.add('active');
}

function loadPatientPhotos(patientId) {
    const beforePhotos = document.getElementById('before-photos');
    const afterPhotos = document.getElementById('after-photos');
    
    // Clear existing photos
    beforePhotos.innerHTML = '';
    afterPhotos.innerHTML = '';
    
    // Add empty state for both sections by default
    beforePhotos.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-camera-slash"></i>
            <p>No before photos uploaded</p>
            <small>Upload a photo (800x600 pixels)</small>
        </div>
    `;
    
    afterPhotos.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-camera-slash"></i>
            <p>No after photos uploaded</p>
            <small>Upload a photo (800x600 pixels)</small>
        </div>
    `;
}

function uploadPhoto(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Create temporary image to check dimensions
        const img = new Image();
        img.onload = function() {
            // Create canvas with fixed dimensions
            const canvas = document.createElement('canvas');
            canvas.width = 800;  // Fixed width
            canvas.height = 600; // Fixed height
            
            // Draw and resize image to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 800, 600);
            
            // Convert to base64
            const resizedImage = canvas.toDataURL('image/jpeg', 0.85);
            
            // Update UI with the new photo
            const photoContainer = document.getElementById(`${type}-photos`);
            photoContainer.innerHTML = `
                <div class="photo-item">
                    <img src="${resizedImage}" alt="${type} treatment photo">
                    <button class="delete-photo" onclick="deletePhoto('${type}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            showToast(`${type} photo uploaded successfully`, 'success');
        };
        
        img.onerror = function() {
            showToast('Error loading image', 'error');
        };
        
        // Read the file
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };
    
    input.click();
}

function deletePhoto(type) {
    if (confirm(`Are you sure you want to delete this ${type} photo?`)) {
        const photoContainer = document.getElementById(`${type}-photos`);
        photoContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-camera-slash"></i>
                <p>No ${type} photos uploaded</p>
                <small>Upload a photo (800x600 pixels)</small>
            </div>
        `;
        showToast(`${type} photo deleted`, 'success');
    }
}

function loadPatientForms(patientId) {
    const formsList = document.getElementById('forms-list');
    const formPreview = document.getElementById('form-preview');
    
    // Clear existing forms
    formsList.innerHTML = '';
    
    // Sample data - replace with actual data from your backend
    const sampleForms = [
        { id: 1, name: 'Medical History Form.pdf', date: '2023-05-15' },
        { id: 2, name: 'Consent Form.pdf', date: '2023-05-15' }
    ];
    
    if (sampleForms.length === 0) {
        formsList.innerHTML = `
            <li class="empty-state">
                <i class="fas fa-file-excel"></i>
                <p>No forms uploaded</p>
            </li>
        `;
    } else {
        sampleForms.forEach(form => {
            const formItem = document.createElement('li');
            formItem.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <div>
                    <div>${form.name}</div>
                    <small>${formatDateForDisplay(new Date(form.date))}</small>
                </div>
            `;
            formItem.addEventListener('click', () => previewForm(form.id));
            formsList.appendChild(formItem);
        });
    }
}

function previewForm(formId) {
    const formPreview = document.getElementById('form-preview');
    formPreview.innerHTML = `
        <iframe src="path/to/form_${formId}.pdf" style="width:100%; height:100%; border:none;"></iframe>
    `;
}

function uploadForm() {
    showToast('Upload form functionality would be implemented here', 'info');
}

function loadAppointmentHistory(patientId) {
    const historyList = document.getElementById('appointmentHistoryList');
    
    // Sample data - replace with actual history data from your backend
    const appointmentHistory = []; // Empty array to simulate no history
    
    if (appointmentHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard"></i>
                <p>No appointment history available</p>
                <small>This patient hasn't had any previous appointments</small>
            </div>
        `;
        return;
    }
    
    // If there is history, display it
    historyList.innerHTML = appointmentHistory.map(appointment => `
        <div class="history-item">
            <div class="history-header">
                <h5>${appointment.procedure}</h5>
                <span class="history-date">${formatDateForDisplay(appointment.date)}</span>
            </div>
            <span class="status-badge status-${appointment.status.toLowerCase()}">
                <i class="fas fa-check-circle"></i> ${appointment.status}
            </span>
            <div class="history-details">
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <div class="info-content">
                        <label>Time</label>
                        <span>${appointment.time}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-user-md"></i>
                    <div class="info-content">
                        <label>Dentist</label>
                        <span>${appointment.dentist}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function closeDetailsModal() {
    const modal = document.getElementById('appointmentDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        currentDetailId = null;
    }
}

function closeAllModals() {
    closeDetailsModal();
    closeAcceptModal();
    closeRejectModal();
    closeTodayAppointmentModal();
}

function acceptRequest(id) {
    // First close the details modal if it's open
    closeDetailsModal();
    
    // Then set up and show the accept confirmation
    currentAcceptId = id;
    currentAcceptIds = [id];
    const request = appointmentRequests.find(req => req.id === id);
    
    document.getElementById('acceptModalTitle').textContent = 'Accept Appointment';
    document.getElementById('acceptModalMessage').textContent = 
        `Are you sure you want to accept the appointment for ${request.patientName}?`;
    document.getElementById('acceptConfirmationModal').classList.add('active');
}

function closeAcceptModal() {
    document.getElementById('acceptConfirmationModal').classList.remove('active');
    currentAcceptId = null;
    currentAcceptIds = [];
}

function confirmAcceptAppointment() {
    if (currentAcceptId) {
        // Single appointment accept
        const requestIndex = appointmentRequests.findIndex(req => req.id === currentAcceptId);
        if (requestIndex !== -1) {
            const request = appointmentRequests[requestIndex];
            
            const newAppointment = {
                id: Date.now(),
                patientName: request.patientName,
                date: request.requestedDate,
                time: request.requestedTime,
                procedure: request.procedure,
                status: "Scheduled",
                patientInfo: request.patientInfo
            };
            
            todayAppointments.push(newAppointment);
            logAppointmentAction(request, "Accepted");
            appointmentRequests.splice(requestIndex, 1);
            
            showToast(`Accepted appointment for ${request.patientName}`, 'success');
        }
    } else {
        // Bulk accept
        currentAcceptIds.forEach(id => {
            const requestIndex = appointmentRequests.findIndex(req => req.id === id);
            if (requestIndex !== -1) {
                const request = appointmentRequests[requestIndex];
                
                const newAppointment = {
                    id: Date.now() + Math.random(),
                    patientName: request.patientName,
                    date: request.requestedDate,
                    time: request.requestedTime,
                    procedure: request.procedure,
                    status: "Scheduled",
                    patientInfo: request.patientInfo
                };
                
                todayAppointments.push(newAppointment);
                logAppointmentAction(request, "Accepted");
                appointmentRequests.splice(requestIndex, 1);
            }
        });
        
        showToast(`Accepted ${currentAcceptIds.length} appointments`, 'success');
        document.getElementById('selectAll').checked = false;
        updateBulkActionVisibility('requestTableBody', 'requestBulkActions', 'requestSelectedCount');
    }
    
    // Update UI
    updateRequestsTable();
    updateRequestCount();
    updateStatistics();
    updateCalendar(new Date());
    updateAppointmentsForDate(new Date());
    
    // Close modal
    closeAcceptModal();
}

// Bulk action functions
function updateBulkActionVisibility(tableId, bulkActionId, selectedCountId) {
    const checkboxes = document.querySelectorAll(`#${tableId} input[type="checkbox"]`);
    const selectedCount = Array.from(checkboxes).filter(cb => cb.checked && !cb.id.includes('selectAll')).length;
    const bulkActions = document.getElementById(bulkActionId);
    const countElement = document.getElementById(selectedCountId);
    
    // Immediately hide bulk actions if no items are selected
    if (selectedCount === 0) {
        bulkActions.classList.remove('show');
        // Clear the "Select All" checkbox
        const selectAllCheckbox = document.getElementById(tableId === 'requestTableBody' ? 'selectAll' : 'selectAllToday');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
    } else {
        bulkActions.classList.add('show');
        countElement.textContent = selectedCount;
    }
}

function showBulkRejectModal() {
    const checkboxes = document.querySelectorAll('#requestTableBody input[type="checkbox"]:checked');
    const count = checkboxes.length;
    
    document.getElementById('rejectConfirmationModal').classList.add('active');
    document.querySelector('#rejectConfirmationModal .confirmation-title').innerHTML = 
        `<i class="fas fa-times-circle" style="color: #dc3545;"></i> Reject ${count} Appointments`;
    document.querySelector('#rejectConfirmationModal .confirmation-message').innerHTML = 
        `You are about to reject <strong>${count}</strong> selected appointment(s).<br>Please provide a reason:`;
}

function bulkRejectRequests(reason) {
    const checkboxes = document.querySelectorAll('#requestTableBody input[type="checkbox"]:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    
    ids.forEach(id => {
        rejectRequest(id, reason);
    });

    document.getElementById('selectAll').checked = false;
    closeRejectModal();
    updateBulkActionVisibility('requestTableBody', 'requestBulkActions', 'requestSelectedCount');
}

function bulkConfirmAppointments() {
    const checkboxes = document.querySelectorAll('#todayTableBody input[type="checkbox"]:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    
    ids.forEach(id => {
        confirmAppointment(id);
    });

    document.getElementById('selectAllToday').checked = false;
    updateBulkActionVisibility('todayTableBody', 'appointmentBulkActions', 'appointmentSelectedCount');
}

function bulkCancelAppointments() {
    const checkboxes = document.querySelectorAll('#todayTableBody input[type="checkbox"]:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    
    ids.forEach(id => {
        cancelAppointment(id);
    });

    document.getElementById('selectAllToday').checked = false;
    updateBulkActionVisibility('todayTableBody', 'appointmentBulkActions', 'appointmentSelectedCount');
}

function bulkAcceptRequests() {
    closeAllModals();
    const checkboxes = document.querySelectorAll('#requestTableBody input[type="checkbox"]:checked');
    currentAcceptIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    currentAcceptId = null;
    
    document.getElementById('acceptModalTitle').textContent = 'Accept Multiple Appointments';
    document.getElementById('acceptModalMessage').textContent = 
        `Are you sure you want to accept ${currentAcceptIds.length} appointments?`;
    document.getElementById('acceptConfirmationModal').classList.add('active');
}

// Search and filter functions
function filterAppointments() {
    const searchText = document.getElementById('searchRequests').value.toLowerCase();
    const selectedProcedure = document.getElementById('procedureFilter').value;
    const tableRows = document.querySelectorAll('#requestTableBody tr');
    
    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let matchesSearch = false;
        let matchesProcedure = !selectedProcedure;
        
        // Skip the first cell (checkbox) and the last cell (actions)
        for (let i = 1; i < cells.length - 1; i++) {
            const cell = cells[i];
            const text = cell.textContent;
            
            // Remove existing highlights
            cell.innerHTML = cell.innerHTML.replace(/<mark class="highlight">(.*?)<\/mark>/g, '$1');
            
            if (searchText && text.toLowerCase().includes(searchText)) {
                // Highlight matching text
                const regex = new RegExp(`(${searchText})`, 'gi');
                cell.innerHTML = text.replace(regex, '<mark class="highlight">$1</mark>');
                matchesSearch = true;
            }
            
            // Check if this cell contains the procedure
            if (i === 4 && text.includes(selectedProcedure)) { // Index 4 is the procedure column
                matchesProcedure = true;
            }
        }
        
        // Show/hide rows based on both search and filter
        row.style.display = (searchText === '' || matchesSearch) && (matchesProcedure) ? '' : 'none';
    });
    
    // Update "no results" message
    updateNoResultsMessage(searchText, selectedProcedure);
}

function updateNoResultsMessage(searchText, selectedProcedure) {
    const visibleRows = document.querySelectorAll('#requestTableBody tr[style=""]').length;
    const noResults = document.querySelector('.no-results');
    
    if ((searchText || selectedProcedure) && visibleRows === 0) {
        if (!noResults) {
            const message = document.createElement('tr');
            message.className = 'no-results';
            let filterText = '';
            if (searchText && selectedProcedure) {
                filterText = `"${searchText}" and procedure "${selectedProcedure}"`;
            } else if (searchText) {
                filterText = `"${searchText}"`;
            } else {
                filterText = `procedure "${selectedProcedure}"`;
            }
            message.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 20px;">
                    <i class="fas fa-search" style="font-size: 24px; color: var(--text-muted); margin-bottom: 10px;"></i>
                    <p style="color: var(--text-muted); margin: 0;">No results found for ${filterText}</p>
                </td>
            `;
            document.getElementById('requestTableBody').appendChild(message);
        }
    } else if (noResults) {
        noResults.remove();
    }
}

function resetFilters() {
    document.getElementById('searchRequests').value = '';
    document.getElementById('procedureFilter').value = '';
    filterAppointments();
    showToast('Filters have been reset', 'info');
}

// Setup modal closing handlers
function setupModalClosing(modalId) {
    const modal = document.getElementById(modalId);
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            if (modalId === 'appointmentDetailsModal') {
                closeDetailsModal();
            } else if (modalId === 'todayAppointmentModal') {
                closeTodayAppointmentModal();
            }
        }
    });
}

// Initialize modal closing handlers
document.addEventListener('DOMContentLoaded', function() {
    setupModalClosing('appointmentDetailsModal');
    setupModalClosing('todayAppointmentModal');
});

function closeTodayAppointmentModal() {
    document.getElementById('todayAppointmentModal').classList.remove('active');
    currentTodayAppointmentId = null;
}

function loadTodayAppointmentHistory(patientId) {
    const historyList = document.getElementById('today-appointment-history-list');
    
    // Clear existing content
    historyList.innerHTML = '';
    
    // Sample data - replace with actual history data from your backend
    const appointmentHistory = []; // Empty array to simulate no history
    
    if (appointmentHistory.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty-state">
                <i class="fas fa-calendar-times"></i>
                <h4>No Appointment History</h4>
                <p>This patient hasn't had any previous appointments</p>
                <small>New appointments will appear here once completed</small>
            </div>
        `;
        return;
    }
    
    // If there is history, display it
    historyList.innerHTML = appointmentHistory.map(appointment => `
        <div class="history-item">
            <div class="history-header">
                <h5>${appointment.procedure}</h5>
                <span class="history-date">${formatDateForDisplay(appointment.date)}</span>
            </div>
            <span class="status-badge status-${appointment.status.toLowerCase()}">
                ${appointment.status}
            </span>
            <div class="history-details">
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <div class="info-content">
                        <label>Time</label>
                        <span>${appointment.time}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-user-md"></i>
                    <div class="info-content">
                        <label>Dentist</label>
                        <span>${appointment.dentist}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Check for expired appointments
function checkExpiredAppointments() {
    const now = new Date();
    const expired = appointmentRequests.filter(request => {
        const requestDate = new Date(request.requestedDate + ' ' + convertTo24Hour(request.requestedTime));
        return requestDate < now;
    });

    if (expired.length > 0) {
        expired.forEach(request => {
            // Log the auto-cancellation
            logAppointmentAction(request, "Auto-Cancelled");
            
            // Remove from requests array
            const index = appointmentRequests.findIndex(req => req.id === request.id);
            if (index !== -1) {
                appointmentRequests.splice(index, 1);
            }
            
            // Show notification
            showToast(`Appointment for ${request.patientName} auto-cancelled due to expiration`, 'warning');
        });

        // Update UI
        updateRequestsTable();
        updateRequestCount();
        updateStatistics();
        updateCalendar(new Date());
    }
}

// Initialize event listeners for search and filter
document.getElementById('searchRequests').addEventListener('input', filterAppointments);
document.getElementById('procedureFilter').addEventListener('change', filterAppointments);

// Initialize event listeners for modal closing
document.getElementById('rejectConfirmationModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeRejectModal();
    }
});

document.getElementById('acceptConfirmationModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAcceptModal();
    }
});

document.getElementById('appointmentDetailsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDetailsModal();
    }
});

document.getElementById('todayAppointmentModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeTodayAppointmentModal();
    }
});

// Update select all checkboxes
function updateSelectAllCheckbox(tableId, selectAllId) {
    const checkboxes = document.querySelectorAll(`#${tableId} input[type="checkbox"]:not([id="${selectAllId}"])`);
    const selectAllCheckbox = document.getElementById(selectAllId);
    const totalCheckboxes = checkboxes.length;
    const checkedCheckboxes = Array.from(checkboxes).filter(cb => cb.checked).length;

    // Simply check if all checkboxes are checked, no indeterminate state
    selectAllCheckbox.checked = totalCheckboxes > 0 && totalCheckboxes === checkedCheckboxes;
    // Remove indeterminate state
    selectAllCheckbox.indeterminate = false;
}

// Modify existing event listeners for select all
document.getElementById('selectAll').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('#requestTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
    updateBulkActionVisibility('requestTableBody', 'requestBulkActions', 'requestSelectedCount');
});

document.getElementById('selectAllToday').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('#todayTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
    updateBulkActionVisibility('todayTableBody', 'appointmentBulkActions', 'appointmentSelectedCount');
});

// Modify event delegation for checkbox changes
document.getElementById('requestTableBody').addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
        updateBulkActionVisibility('requestTableBody', 'requestBulkActions', 'requestSelectedCount');
        updateSelectAllCheckbox('requestTableBody', 'selectAll');
    }
});

document.getElementById('todayTableBody').addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
        updateBulkActionVisibility('todayTableBody', 'appointmentBulkActions', 'appointmentSelectedCount');
        updateSelectAllCheckbox('todayTableBody', 'selectAllToday');
    }
});