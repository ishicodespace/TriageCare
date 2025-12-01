// My Appointments JavaScript
// Handles appointment display, cancellation, and rescheduling

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  if (typeof Auth !== "undefined" && !Auth.isLoggedIn()) {
    // Redirect to login or show login prompt
    showLoginRequired();
    return;
  }

  initializeTabs();
  loadAppointments();
});

function showLoginRequired() {
  const appointmentsList = document.getElementById("appointments-list");
  if (appointmentsList) {
    appointmentsList.innerHTML = `
            <div class="login-required">
                <div class="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <h3>Sign In Required</h3>
                <p>Please sign in to view and manage your appointments.</p>
                <button class="btn-primary" onclick="showLoginModal()">Sign In</button>
            </div>
        `;
  }
}

function initializeTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");

      // Update active states
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Show target content
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${targetTab}-tab`) {
          content.classList.add("active");
        }
      });
    });
  });
}

function loadAppointments() {
  // Load appointments from localStorage
  const appointments = JSON.parse(
    localStorage.getItem("triagecare_appointments") || "[]"
  );
  const appointmentsList = document.getElementById("appointments-list");
  const emptyState = document.getElementById("empty-upcoming");

  if (appointments.length === 0) {
    if (appointmentsList) appointmentsList.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (appointmentsList) appointmentsList.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  // Render appointments
  appointmentsList.innerHTML = appointments
    .map((apt, index) => createAppointmentCard(apt, index))
    .join("");

  // Bind action handlers
  bindAppointmentActions();
}

function createAppointmentCard(appointment, index) {
  const appointmentDate = new Date(appointment.date);
  const formattedDate = appointmentDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate days until appointment
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const aptDate = new Date(appointment.date);
  aptDate.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((aptDate - today) / (1000 * 60 * 60 * 24));

  let timeUntil = "";
  if (daysUntil === 0) {
    timeUntil = "Today";
  } else if (daysUntil === 1) {
    timeUntil = "Tomorrow";
  } else {
    timeUntil = `In ${daysUntil} days`;
  }

  return `
        <div class="appointment-card upcoming" data-index="${index}">
            <div class="appointment-header">
                <div class="appointment-timing">
                    <span class="time-until ${
                      daysUntil <= 1 ? "soon" : ""
                    }">${timeUntil}</span>
                    <span class="appointment-datetime">${formattedDate} at ${
    appointment.time
  }</span>
                </div>
                <div class="appointment-actions-top">
                    <button class="action-btn-icon" onclick="addToCalendar(${index})" title="Add to Calendar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                            <line x1="12" y1="14" x2="12" y2="18"/>
                            <line x1="10" y1="16" x2="14" y2="16"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="appointment-body">
                <div class="doctor-info">
                    <div class="doctor-avatar">
                        ${getInitials(appointment.doctorName)}
                    </div>
                    <div class="doctor-details">
                        <h4>${appointment.doctorName}</h4>
                        <span class="specialty">${appointment.specialty}</span>
                    </div>
                </div>
                
                <div class="appointment-meta">
                    <div class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>${appointment.location || "Location TBD"}</span>
                    </div>
                    <div class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                        </svg>
                        <span>Confirmation sent via SMS</span>
                    </div>
                </div>
            </div>

            ${getPreparationInstructions(appointment.specialty)}

            <div class="appointment-footer">
                <button class="btn-secondary" onclick="rescheduleAppointment(${index})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Reschedule
                </button>
                <button class="btn-danger-outline" onclick="cancelAppointment(${index})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Cancel
                </button>
            </div>
        </div>
    `;
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function getPreparationInstructions(specialty) {
  const instructions = {
    Cardiologist: [
      "Avoid caffeine 24 hours before your appointment",
      "Bring list of current medications",
      "Wear comfortable, loose-fitting clothing",
    ],
    "General Physician": [
      "Fast for 8-12 hours if blood work is expected",
      "Bring previous medical records if available",
      "List any symptoms or concerns to discuss",
    ],
    Dermatologist: [
      "Remove nail polish if nails are being examined",
      "Avoid applying makeup or lotions on affected areas",
      "Take photos of skin changes to show progression",
    ],
    Gastroenterologist: [
      "Follow any fasting instructions provided",
      "Bring list of foods that cause discomfort",
      "Note frequency and timing of symptoms",
    ],
    Neurologist: [
      "Keep a headache/symptom diary if applicable",
      "Bring list of all medications including OTC",
      "Get adequate sleep the night before",
    ],
    default: [
      "Bring valid ID and insurance information",
      "Arrive 15 minutes early for paperwork",
      "Prepare questions for the doctor",
    ],
  };

  const tips = instructions[specialty] || instructions["default"];

  return `
        <div class="preparation-instructions">
            <h5>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                </svg>
                Preparation Instructions
            </h5>
            <ul>
                ${tips.map((tip) => `<li>${tip}</li>`).join("")}
            </ul>
        </div>
    `;
}

function bindAppointmentActions() {
  // Actions are bound via onclick in the HTML
}

function addToCalendar(index) {
  const appointments = JSON.parse(
    localStorage.getItem("triagecare_appointments") || "[]"
  );
  const apt = appointments[index];

  if (!apt) return;

  // Create calendar event URL (Google Calendar)
  const startDate = new Date(`${apt.date}T${convertTo24Hour(apt.time)}`);
  const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 min appointment

  const formatDate = (d) => d.toISOString().replace(/-|:|\.\d{3}/g, "");

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Doctor Appointment - ${apt.doctorName}`
  )}&dates=${formatDate(startDate)}/${formatDate(
    endDate
  )}&details=${encodeURIComponent(
    `Appointment with ${apt.doctorName} (${apt.specialty})`
  )}&location=${encodeURIComponent(apt.location || "")}`;

  window.open(calendarUrl, "_blank");
  showNotification("Opening Google Calendar...", "info");
}

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}:00`;
}

function rescheduleAppointment(index) {
  const appointments = JSON.parse(
    localStorage.getItem("triagecare_appointments") || "[]"
  );
  const apt = appointments[index];

  if (!apt) return;

  // Redirect to find-doctor page with pre-filled info
  showNotification("Redirecting to reschedule...", "info");
  setTimeout(() => {
    window.location.href = `find-doctor.html?reschedule=${index}`;
  }, 1000);
}

function cancelAppointment(index) {
  if (!confirm("Are you sure you want to cancel this appointment?")) {
    return;
  }

  const appointments = JSON.parse(
    localStorage.getItem("triagecare_appointments") || "[]"
  );

  // Move to cancelled appointments
  const cancelled = JSON.parse(
    localStorage.getItem("triagecare_cancelled") || "[]"
  );
  if (appointments[index]) {
    appointments[index].cancelledAt = new Date().toISOString();
    cancelled.push(appointments[index]);
    localStorage.setItem("triagecare_cancelled", JSON.stringify(cancelled));
  }

  // Remove from active appointments
  appointments.splice(index, 1);
  localStorage.setItem("triagecare_appointments", JSON.stringify(appointments));

  showNotification("Appointment cancelled successfully", "success");
  loadAppointments();

  // Update tab count
  const upcomingCount = document.querySelector(
    '.tab-btn[data-tab="upcoming"] .tab-count'
  );
  if (upcomingCount) {
    upcomingCount.textContent = appointments.length;
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add("show"), 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);

  notification
    .querySelector(".notification-close")
    .addEventListener("click", () => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    });
}

// Export for use in HTML
window.addToCalendar = addToCalendar;
window.rescheduleAppointment = rescheduleAppointment;
window.cancelAppointment = cancelAppointment;
