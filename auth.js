// Authentication Module for TriageCare AI
// Simulated authentication using localStorage

const Auth = {
  // Check if user is logged in
  isLoggedIn() {
    return localStorage.getItem("triagecare_user") !== null;
  },

  // Get current user
  getCurrentUser() {
    const userData = localStorage.getItem("triagecare_user");
    return userData ? JSON.parse(userData) : null;
  },

  // Login user
  login(email, password) {
    // Simulated login - in real app, this would call an API
    const users = JSON.parse(localStorage.getItem("triagecare_users") || "[]");
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      localStorage.setItem("triagecare_user", JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    }
    return { success: false, message: "Invalid email or password" };
  },

  // Register new user
  register(name, email, password) {
    const users = JSON.parse(localStorage.getItem("triagecare_users") || "[]");

    // Check if email already exists
    if (users.find((u) => u.email === email)) {
      return { success: false, message: "Email already registered" };
    }

    const newUser = {
      id: Date.now(),
      name: name,
      email: email,
      password: password,
    };

    users.push(newUser);
    localStorage.setItem("triagecare_users", JSON.stringify(users));

    // Auto login after registration
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
    localStorage.setItem("triagecare_user", JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  // Logout user
  logout() {
    localStorage.removeItem("triagecare_user");
    window.location.reload();
  },

  // Get first name for display
  getFirstName() {
    const user = this.getCurrentUser();
    if (user && user.name) {
      return user.name.split(" ")[0];
    }
    return "";
  },
};

// Update navigation based on auth state
function updateNavigation() {
  const authContainer = document.getElementById("auth-nav");
  if (!authContainer) return;

  if (Auth.isLoggedIn()) {
    const user = Auth.getCurrentUser();
    const firstName = Auth.getFirstName();
    authContainer.innerHTML = `
      <div class="user-menu">
        <button class="user-menu-btn" onclick="toggleUserMenu()">
          <div class="user-avatar">${firstName.charAt(0).toUpperCase()}</div>
          <span class="user-name">${firstName}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div class="user-dropdown" id="user-dropdown">
          <div class="dropdown-header">
            <strong>${user.name}</strong>
            <span>${user.email}</span>
          </div>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            My Profile
          </a>
          <a href="my-appointments.html" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            My Appointments
          </a>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout" onclick="Auth.logout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    `;
  } else {
    authContainer.innerHTML = `
      <button class="btn-secondary" onclick="showLoginModal()">Sign In</button>
      <button class="btn-primary" onclick="showSignupModal()">Sign Up</button>
    `;
  }
}

// Toggle user dropdown menu
function toggleUserMenu() {
  const dropdown = document.getElementById("user-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("active");
  }
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const userMenu = document.querySelector(".user-menu");
  const dropdown = document.getElementById("user-dropdown");
  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

// Show login modal
function showLoginModal() {
  const existingModal = document.getElementById("auth-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "auth-modal";
  modal.className = "auth-modal active";
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="close-modal" onclick="closeAuthModal()">&times;</button>
      <div class="auth-header">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#login-gradient)" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          <defs>
            <linearGradient id="login-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0ea5e9"/>
              <stop offset="100%" stop-color="#10b981"/>
            </linearGradient>
          </defs>
        </svg>
        <h2>Welcome Back</h2>
        <p>Sign in to your TriageCare account</p>
      </div>
      <form id="login-form" onsubmit="handleLogin(event)">
        <div class="form-group">
          <label for="login-email">Email</label>
          <input type="email" id="login-email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <input type="password" id="login-password" placeholder="Enter your password" required>
        </div>
        <div class="form-error" id="login-error"></div>
        <button type="submit" class="btn-primary full-width">Sign In</button>
      </form>
      <div class="auth-footer">
        <p>Don't have an account? <a href="#" onclick="showSignupModal()">Sign Up</a></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAuthModal();
  });
}

// Show signup modal
function showSignupModal() {
  const existingModal = document.getElementById("auth-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "auth-modal";
  modal.className = "auth-modal active";
  modal.innerHTML = `
    <div class="auth-modal-content">
      <button class="close-modal" onclick="closeAuthModal()">&times;</button>
      <div class="auth-header">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#signup-gradient)" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          <defs>
            <linearGradient id="signup-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0ea5e9"/>
              <stop offset="100%" stop-color="#10b981"/>
            </linearGradient>
          </defs>
        </svg>
        <h2>Create Account</h2>
        <p>Join TriageCare for better healthcare</p>
      </div>
      <form id="signup-form" onsubmit="handleSignup(event)">
        <div class="form-group">
          <label for="signup-name">Full Name</label>
          <input type="text" id="signup-name" placeholder="Enter your full name" required>
        </div>
        <div class="form-group">
          <label for="signup-email">Email</label>
          <input type="email" id="signup-email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label for="signup-password">Password</label>
          <input type="password" id="signup-password" placeholder="Create a password" required minlength="6">
        </div>
        <div class="form-error" id="signup-error"></div>
        <button type="submit" class="btn-primary full-width">Create Account</button>
      </form>
      <div class="auth-footer">
        <p>Already have an account? <a href="#" onclick="showLoginModal()">Sign In</a></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAuthModal();
  });
}

// Close auth modal
function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }
}

// Handle login form submission
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");

  const result = Auth.login(email, password);
  if (result.success) {
    closeAuthModal();
    updateNavigation();
    showNotification("Welcome back, " + Auth.getFirstName() + "!", "success");
  } else {
    errorEl.textContent = result.message;
  }
}

// Handle signup form submission
function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const errorEl = document.getElementById("signup-error");

  const result = Auth.register(name, email, password);
  if (result.success) {
    closeAuthModal();
    updateNavigation();
    showNotification(
      "Welcome to TriageCare, " + Auth.getFirstName() + "!",
      "success"
    );
  } else {
    errorEl.textContent = result.message;
  }
}

// Show notification (if not already defined)
if (typeof showNotification !== "function") {
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add("active"), 10);
    setTimeout(() => {
      notification.classList.remove("active");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Require login for booking
function requireLoginForBooking(callback) {
  if (Auth.isLoggedIn()) {
    callback();
  } else {
    showLoginModal();
    // Store the callback to execute after login
    window.pendingBookingCallback = callback;
  }
}

// Initialize auth on page load
document.addEventListener("DOMContentLoaded", () => {
  updateNavigation();
});
