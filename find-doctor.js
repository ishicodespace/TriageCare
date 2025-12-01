// Find Doctor Page JavaScript
// Calendar and Booking Functionality

const today = new Date();
const startMonth = today.getMonth();
const startYear = today.getFullYear();
let currentMonth = startMonth;
let currentYear = startYear;
let selectedDate = null;
let selectedTime = null;
let selectedMonth = currentMonth;
let selectedYear = currentYear;

// Check if user is logged in before booking
function tryBooking(doctorName, specialty) {
  if (typeof Auth !== "undefined" && Auth.isLoggedIn()) {
    openBooking(doctorName, specialty);
  } else {
    // Store booking intent
    window.pendingBooking = { doctorName, specialty };
    showLoginModal();
  }
}

// Open booking modal
function openBooking(doctorName, specialty) {
  const modal = document.getElementById("booking-modal");
  const doctorNameEl = document.getElementById("booking-doctor-name");

  doctorNameEl.textContent = `${doctorName} - ${specialty}`;
  modal.classList.add("active");

  // Reset selections
  selectedDate = null;
  selectedTime = null;
  currentMonth = startMonth;
  currentYear = startYear;

  // Initialize calendar
  const calendarGrid = modal.querySelector(".calendar-grid");
  const monthLabel = modal.querySelector(".calendar-month > span");
  const leftArrow = modal.querySelectorAll(".cal-nav")[0];
  const rightArrow = modal.querySelectorAll(".cal-nav")[1];

  renderCalendar(calendarGrid, monthLabel, currentMonth, currentYear);
  bindDaySelection(calendarGrid);
  updateArrowStates(leftArrow);

  // Arrow navigation
  leftArrow.onclick = () => {
    if (
      currentYear > startYear ||
      (currentYear === startYear && currentMonth > startMonth)
    ) {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(calendarGrid, monthLabel, currentMonth, currentYear);
      bindDaySelection(calendarGrid);
      updateArrowStates(leftArrow);
      resetTimeSlots();
    }
  };

  rightArrow.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(calendarGrid, monthLabel, currentMonth, currentYear);
    bindDaySelection(calendarGrid);
    updateArrowStates(leftArrow);
    resetTimeSlots();
  };
}

function updateArrowStates(leftArrow) {
  if (currentYear === startYear && currentMonth === startMonth) {
    leftArrow.classList.add("disabled");
  } else {
    leftArrow.classList.remove("disabled");
  }
}

function resetTimeSlots() {
  const timeSlotsTitle = document.querySelector(".time-slots h5");
  const slotsGrid = document.querySelector(".slots-grid");
  const confirmBtn = document.querySelector(".confirm-btn");

  selectedDate = null;
  selectedTime = null;
  timeSlotsTitle.textContent = "Select a date first";
  slotsGrid.innerHTML = "";
  confirmBtn.textContent = "Confirm Appointment";
  confirmBtn.classList.remove("ready");
}

// Close booking modal
function closeBooking() {
  const modal = document.getElementById("booking-modal");
  modal.classList.remove("active");
}

// Render calendar
function renderCalendar(calendarGrid, monthLabel, month, year) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (monthLabel) {
    monthLabel.textContent = `${monthNames[month]} ${year}`;
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = new Date();
  const isCurrentMonth =
    month === todayDate.getMonth() && year === todayDate.getFullYear();
  const isPastMonth =
    year < todayDate.getFullYear() ||
    (year === todayDate.getFullYear() && month < todayDate.getMonth());

  let html = `
    <span class="day-header">Su</span>
    <span class="day-header">Mo</span>
    <span class="day-header">Tu</span>
    <span class="day-header">We</span>
    <span class="day-header">Th</span>
    <span class="day-header">Fr</span>
    <span class="day-header">Sa</span>
  `;

  for (let i = 0; i < firstDay; i++) {
    html += `<span class="day"></span>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(year, month, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isPast = isPastMonth || (isCurrentMonth && day < todayDate.getDate());
    const isToday = isCurrentMonth && day === todayDate.getDate();

    let classes = "day";
    if (isPast) {
      classes += " past";
    } else if (isWeekend) {
      classes += "";
    } else {
      classes += " available";
    }

    if (isToday) {
      classes += " today";
    }

    html += `<span class="${classes}">${day}</span>`;
  }

  const totalCells = firstDay + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    html += `<span class="day"></span>`;
  }

  calendarGrid.innerHTML = html;
}

// Bind day selection
function bindDaySelection(calendarGrid) {
  const days = calendarGrid.querySelectorAll(".day.available");
  const timeSlotsTitle = document.querySelector(".time-slots h5");
  const slotsGrid = document.querySelector(".slots-grid");
  const confirmBtn = document.querySelector(".confirm-btn");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  days.forEach((day) => {
    day.addEventListener("click", () => {
      calendarGrid.querySelectorAll(".day.selected").forEach((d) => {
        d.classList.remove("selected");
      });

      day.classList.add("selected");
      selectedDate = day.textContent;
      selectedMonth = currentMonth;
      selectedYear = currentYear;

      if (timeSlotsTitle) {
        timeSlotsTitle.textContent = `Available Times for ${monthNames[currentMonth]} ${day.textContent}`;
      }

      updateTimeSlots(slotsGrid, confirmBtn);

      selectedTime = null;
      updateConfirmButton(confirmBtn, selectedDate, null);
    });
  });
}

// Update time slots
function updateTimeSlots(slotsGrid, confirmBtn) {
  if (!slotsGrid) return;

  const allTimes = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
  ];

  const shuffled = allTimes.sort(() => 0.5 - Math.random());
  const available = shuffled.slice(0, Math.floor(Math.random() * 3) + 4);
  available.sort((a, b) => {
    const timeA = new Date("1/1/2025 " + a);
    const timeB = new Date("1/1/2025 " + b);
    return timeA - timeB;
  });

  slotsGrid.innerHTML = available
    .map((time) => `<button class="time-slot">${time}</button>`)
    .join("");

  // Bind time slot clicks
  slotsGrid.querySelectorAll(".time-slot").forEach((slot) => {
    slot.addEventListener("click", () => {
      slotsGrid.querySelectorAll(".time-slot.selected").forEach((s) => {
        s.classList.remove("selected");
      });
      slot.classList.add("selected");
      selectedTime = slot.textContent;
      updateConfirmButton(confirmBtn, selectedDate, selectedTime);
    });
  });
}

// Update confirm button
function updateConfirmButton(btn, date, time) {
  if (!btn) return;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (date && time) {
    btn.textContent = `Confirm: ${monthNames[currentMonth]} ${date} at ${time}`;
    btn.classList.add("ready");
    btn.onclick = () => confirmAppointment();
  } else if (date) {
    btn.textContent = `Select a time slot`;
    btn.classList.remove("ready");
    btn.onclick = null;
  } else {
    btn.textContent = `Confirm Appointment`;
    btn.classList.remove("ready");
    btn.onclick = null;
  }
}

// Confirm appointment
function confirmAppointment() {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const doctorNameEl = document.getElementById(
    "booking-doctor-name"
  ).textContent;
  const [doctorName, specialty] = doctorNameEl.split(" - ");

  // Save appointment to localStorage
  const appointment = {
    id: Date.now(),
    doctorName: doctorName.trim(),
    specialty: specialty ? specialty.trim() : "General Consultation",
    date: `${selectedYear}-${String(selectedMonth + 1).padStart(
      2,
      "0"
    )}-${String(selectedDate).padStart(2, "0")}`,
    time: selectedTime,
    location: getRandomLocation(),
    bookedAt: new Date().toISOString(),
    status: "confirmed",
  };

  const appointments = JSON.parse(
    localStorage.getItem("triagecare_appointments") || "[]"
  );
  appointments.push(appointment);
  localStorage.setItem("triagecare_appointments", JSON.stringify(appointments));

  closeBooking();

  // Show confirmation
  const modal = document.createElement("div");
  modal.className = "appointment-modal active";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h3>Appointment Confirmed!</h3>
      <p class="modal-details">
        <strong>${doctorName} - ${
    specialty || "General Consultation"
  }</strong><br>
        <span class="modal-datetime">${
          monthNames[selectedMonth]
        } ${selectedDate}, ${selectedYear} at ${selectedTime}</span>
      </p>
      <div class="modal-info">
        <p>📧 Confirmation email sent</p>
        <p>📱 Reminder set for 24 hours before</p>
        <p>📋 <a href="my-appointments.html" style="color: var(--primary-color);">View My Appointments</a></p>
      </div>
      <button class="modal-close-btn">Done</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".modal-close-btn").addEventListener("click", () => {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      setTimeout(() => modal.remove(), 300);
    }
  });
}

// Get random location for demo
function getRandomLocation() {
  const locations = [
    "Apollo Hospital, Mumbai",
    "Fortis Healthcare, Delhi",
    "Max Hospital, Gurgaon",
    "Manipal Hospital, Bangalore",
    "AIIMS, New Delhi",
    "Medanta, Gurgaon",
    "Kokilaben Hospital, Mumbai",
    "CMC Vellore, Tamil Nadu",
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

// Close modal on outside click
document.getElementById("booking-modal").addEventListener("click", (e) => {
  if (e.target.id === "booking-modal") {
    closeBooking();
  }
});

// Close modal on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeBooking();
  }
});
