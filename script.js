// State & Storage Keys
const STORAGE_PREFIX = "mediqueue_";

const defaultDepartments = [
  { id: "gen", name: "General Medicine", doctor: "Dr. Arvind Rao, MD", room: "OPD 104", avgTime: 10, currentToken: 12, waitingCount: 4 },
  { id: "ped", name: "Pediatrics (Child OPD)", doctor: "Dr. Sunita Sen, DCH", room: "OPD 202", avgTime: 12, currentToken: 8, waitingCount: 3 },
  { id: "ortho", name: "Orthopedics & Joint", doctor: "Dr. K. Mehta, MS", room: "OPD 110", avgTime: 15, currentToken: 6, waitingCount: 5 },
  { id: "cardio", name: "Cardiology Screening", doctor: "Dr. Farhan Ali, DM", room: "OPD 305", avgTime: 15, currentToken: 4, waitingCount: 2 },
  { id: "ent", name: "ENT (Ear, Nose & Throat)", doctor: "Dr. R. Nayak, MS", room: "OPD 108", avgTime: 8, currentToken: 15, waitingCount: 6 },
  { id: "derma", name: "Dermatology / Skin", doctor: "Dr. P. Sharma, MD", room: "OPD 214", avgTime: 10, currentToken: 9, waitingCount: 3 }
];

const demoDoctorAccounts = [
  { email: "dr.rao@hospital.org", pass: "doc123", name: "Dr. Arvind Rao", deptId: "gen" },
  { email: "dr.sen@hospital.org", pass: "doc123", name: "Dr. Sunita Sen", deptId: "ped" }
];

// Load departments from localStorage or initialize
function getDepartments() {
  const stored = localStorage.getItem(STORAGE_PREFIX + "depts");
  if (!stored) {
    localStorage.setItem(STORAGE_PREFIX + "depts", JSON.stringify(defaultDepartments));
    return defaultDepartments;
  }
  return JSON.parse(stored);
}

function saveDepartments(depts) {
  localStorage.setItem(STORAGE_PREFIX + "depts", JSON.stringify(depts));
}

function getActiveUser() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "active_user") || "null");
}

function getActiveDoctor() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "active_doc") || "null");
}

function getMyToken() {
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + "my_token") || "null");
}

// Navigation Handler
function navigateTo(viewName) {
  const views = ["home", "book", "track", "patient", "doctor", "auth"];
  views.forEach(v => {
    const el = document.getElementById("view-" + v);
    if (el) el.classList.add("hidden");
    const navBtn = document.getElementById("nav-" + v);
    if (navBtn) navBtn.classList.remove("active");
  });

  const targetView = document.getElementById("view-" + viewName);
  if (targetView) targetView.classList.remove("hidden");

  const targetBtn = document.getElementById("nav-" + viewName);
  if (targetBtn) targetBtn.classList.add("active");

  window.scrollTo(0, 0);

  // Render appropriate view states
  if (viewName === "home") renderHome();
  if (viewName === "track") renderLiveQueueBoard();
  if (viewName === "book") renderBookingForm();
  if (viewName === "patient") renderPatientTokenView();
  if (viewName === "doctor") renderDoctorDesk();
  updateAuthHeader();
}

// Toast helper
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3200);
}

// Render Top Navbar Auth Button
function updateAuthHeader() {
  const authBox = document.getElementById("auth-header-actions");
  const user = getActiveUser();
  if (user) {
    authBox.innerHTML = `
      <span class="user-name-tag">👤 ${user.name.split(" ")[0]}</span>
      <button class="btn btn-secondary btn-sm" onclick="handleLogout()">Sign Out</button>
    `;
  } else {
    authBox.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="navigateTo('auth')">Sign In / Register</button>
    `;
  }
}

// 1. HOME VIEW RENDER
function renderHome() {
  const container = document.getElementById("home-dept-list");
  const depts = getDepartments();
  container.innerHTML = depts.map(d => {
    const waitMins = d.waitingCount * d.avgTime;
    return `
      <div class="card">
        <h3 style="color:var(--primary-navy); margin-bottom:0.25rem;">${d.name}</h3>
        <p class="text-muted" style="font-size:0.9rem; margin-bottom:0.75rem;">${d.doctor} • ${d.room}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:0.75rem;">
          <span style="font-size:0.9rem;">Waiting: <strong>${d.waitingCount}</strong></span>
          <span style="font-size:0.95rem; font-weight:700; color:var(--medical-blue);">~${waitMins} mins wait</span>
        </div>
      </div>
    `;
  }).join("");
}

function handleStartBooking() {
  const user = getActiveUser();
  if (!user) {
    showToast("Please create an account or sign in first.");
    navigateTo("auth");
  } else {
    navigateTo("book");
  }
}

// 2. BOOKING VIEW SETUP
function renderBookingForm() {
  const depts = getDepartments();
  const deptSelect = document.getElementById("book-department");
  deptSelect.innerHTML = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
  
  // Set default appointment date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("book-date").value = today;
  document.getElementById("book-date").min = today;

  onDepartmentSelectChange();
}

function onDepartmentSelectChange() {
  const deptId = document.getElementById("book-department").value;
  const depts = getDepartments();
  const selected = depts.find(d => d.id === deptId) || depts[0];

  const docSelect = document.getElementById("book-doctor");
  docSelect.innerHTML = `<option value="${selected.doctor}">${selected.doctor} (${selected.room})</option>`;

  updateBookingPreview(selected);
}

function onDoctorSelectChange() {
  onDepartmentSelectChange();
}

function updateBookingPreview(dept) {
  document.getElementById("preview-doc-name").innerText = dept.doctor;
  document.getElementById("preview-doc-dept").innerText = `${dept.name} • ${dept.room}`;
  document.getElementById("preview-doc-queue").innerText = `${dept.waitingCount} Patients Waiting`;
  
  const estimatedWait = dept.waitingCount * dept.avgTime;
  document.getElementById("preview-doc-wait").innerText = `~${estimatedWait} Mins Wait Time`;
}

function handleBookingSubmit(e) {
  e.preventDefault();
  const user = getActiveUser();
  if (!user) {
    showToast("Session expired. Please log in.");
    navigateTo("auth");
    return;
  }

  const deptId = document.getElementById("book-department").value;
  const depts = getDepartments();
  const deptIndex = depts.findIndex(d => d.id === deptId);
  const dept = depts[deptIndex];

  // Increase queue count and generate token
  dept.waitingCount += 1;
  const newTokenNumber = dept.currentToken + dept.waitingCount;
  const tokenCode = `MQ-${dept.id.toUpperCase()}-${newTokenNumber}`;
  const waitMins = (dept.waitingCount - 1) * dept.avgTime;

  saveDepartments(depts);

  const tokenObj = {
    tokenCode: tokenCode,
    tokenNumber: newTokenNumber,
    patientName: user.name,
    patientPhone: user.phone,
    department: dept.name,
    doctor: dept.doctor,
    room: dept.room,
    avgTime: dept.avgTime,
    bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    deptId: dept.id
  };

  localStorage.setItem(STORAGE_PREFIX + "my_token", JSON.stringify(tokenObj));
  showToast("Token Generated Successfully!");
  navigateTo("patient");
}

// 3. LIVE QUEUE VIEW
function renderLiveQueueBoard() {
  const container = document.getElementById("queue-board-list");
  const depts = getDepartments();

  container.innerHTML = depts.map(d => {
    const waitTime = d.waitingCount * d.avgTime;
    return `
      <div class="card" style="border-top:3px solid var(--primary-navy);">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:0.75rem;">
          <div>
            <h3 style="font-size:1.15rem; color:var(--primary-navy);">${d.name}</h3>
            <span style="font-size:0.85rem; color:var(--text-muted);">${d.room}</span>
          </div>
          <span style="background:#e0f2fe; color:#0369a1; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700; font-size:0.85rem;">Active</span>
        </div>
        <p style="font-weight:600; font-size:0.95rem; margin-bottom:1rem;">${d.doctor}</p>
        <div style="background:#f8fafc; border:1px solid var(--border-subtle); padding:1rem; border-radius:6px; margin-bottom:1rem; text-align:center;">
          <div style="font-size:0.85rem; color:var(--text-muted);">Currently Consulting Token</div>
          <div style="font-size:2rem; font-weight:800; color:var(--primary-navy);">MQ-${d.id.toUpperCase()}-${d.currentToken}</div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.92rem;">
          <span>Patients Waiting: <strong>${d.waitingCount}</strong></span>
          <span style="color:var(--medical-blue); font-weight:700;">~${waitTime} mins wait</span>
        </div>
      </div>
    `;
  }).join("");
}

// 4. PATIENT TOKEN DASHBOARD
function renderPatientTokenView() {
  const container = document.getElementById("patient-token-container");
  const token = getMyToken();
  const depts = getDepartments();

  if (!token) {
    container.innerHTML = `
      <div class="card" style="text-align:center; padding:3rem 1.5rem; max-width:550px; margin:0 auto;">
        <h3 style="color:var(--primary-navy); margin-bottom:0.5rem;">No Active Token Found</h3>
        <p class="text-muted" style="margin-bottom:1.5rem;">You do not currently have an active OPD appointment token booked.</p>
        <button class="btn btn-primary" onclick="handleStartBooking()">Book a Token Now</button>
      </div>
    `;
    return;
  }

  const dept = depts.find(d => d.id === token.deptId) || { currentToken: token.tokenNumber - 1, avgTime: token.avgTime };
  const patientsAhead = Math.max(0, token.tokenNumber - dept.currentToken - 1);
  const waitMins = patientsAhead * token.avgTime;

  container.innerHTML = `
    <div class="token-display-box">
      <span class="badge">Official OPD Token</span>
      <div class="token-huge">${token.tokenCode}</div>
      <p style="color:var(--text-muted); font-size:0.95rem;">Assigned to: <strong>${token.patientName}</strong></p>
      
      <div class="wait-callout">
        ${patientsAhead === 0 ? "You're Next! Proceed to consultation room." : `~${waitMins} Minutes (${patientsAhead} patients ahead)`}
      </div>

      <table class="info-table">
        <tr>
          <td>Department</td>
          <td>${token.department}</td>
        </tr>
        <tr>
          <td>Doctor</td>
          <td>${token.doctor}</td>
        </tr>
        <tr>
          <td>Room</td>
          <td>${token.room}</td>
        </tr>
        <tr>
          <td>Doctor Currently Serving</td>
          <td>MQ-${token.deptId.toUpperCase()}-${dept.currentToken}</td>
        </tr>
        <tr>
          <td>Avg Consultation Pace</td>
          <td>${token.avgTime} mins / patient</td>
        </tr>
      </table>

      <div style="margin-top:1.8rem; display:flex; gap:0.75rem;">
        <button class="btn btn-secondary flex-1" onclick="navigateTo('track')">View Full Queue</button>
        <button class="btn btn-danger flex-1" onclick="handleCancelToken()">Cancel Token</button>
      </div>
    </div>
  `;
}

function handleCancelToken() {
  if (confirm("Are you sure you want to cancel this appointment token?")) {
    const token = getMyToken();
    if (token) {
      const depts = getDepartments();
      const dept = depts.find(d => d.id === token.deptId);
      if (dept && dept.waitingCount > 0) {
        dept.waitingCount -= 1;
        saveDepartments(depts);
      }
    }
    localStorage.removeItem(STORAGE_PREFIX + "my_token");
    showToast("Token has been cancelled.");
    renderPatientTokenView();
  }
}

// 5. DOCTOR AUTH & DOCTOR DESK
function renderDoctorDesk() {
  const container = document.getElementById("doctor-view-container");
  const activeDoc = getActiveDoctor();

  if (!activeDoc) {
    // Show Doctor Login Screen
    container.innerHTML = `
      <div class="auth-card">
        <div class="form-header">
          <h2>Doctor & Staff Desk Login</h2>
          <p>Restricted access for consulting hospital physicians and staff.</p>
        </div>
        <form onsubmit="handleDoctorLogin(event)">
          <div class="form-group">
            <label>Staff Email</label>
            <input type="email" id="doc-email" class="form-input" value="dr.rao@hospital.org" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="doc-pass" class="form-input" value="doc123" required />
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Access Consultation Desk</button>
        </form>
        <div style="margin-top:1.25rem; font-size:0.85rem; color:var(--text-muted); background:#f8fafc; padding:0.75rem; border-radius:4px;">
          Demo Doctor Login: <strong>dr.rao@hospital.org</strong> | Password: <strong>doc123</strong>
        </div>
      </div>
    `;
    return;
  }

  // Doctor is logged in: Show Doctor Control Panel
  const depts = getDepartments();
  const dept = depts.find(d => d.id === activeDoc.deptId) || depts[0];

  container.innerHTML = `
    <div class="form-container" style="max-width:800px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:1rem; margin-bottom:1.5rem;">
        <div>
          <h2>${activeDoc.name}</h2>
          <p class="text-muted">${dept.name} • ${dept.room}</p>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="handleDoctorLogout()">Sign Out Desk</button>
      </div>

      <div class="grid grid-3" style="margin-bottom:1.5rem;">
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.85rem;">Currently Serving</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--primary-navy); margin:0.3rem 0;">
            MQ-${dept.id.toUpperCase()}-${dept.currentToken}
          </div>
        </div>
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.85rem;">Patients Waiting</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--medical-blue); margin:0.3rem 0;">
            ${dept.waitingCount}
          </div>
        </div>
        <div class="card" style="text-align:center;">
          <div class="text-muted" style="font-size:0.85rem;">Avg Time / Patient</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--text-main); margin:0.3rem 0;">
            ${dept.avgTime}m
          </div>
        </div>
      </div>

      <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:8px; padding:1.5rem; text-align:center;">
        <h4 style="margin-bottom:0.5rem; color:var(--primary-navy);">Queue Management Actions</h4>
        <p class="text-muted" style="font-size:0.95rem; margin-bottom:1.25rem;">
          Clicking below marks the current patient's consultation finished and updates wait times for all waiting patients.
        </p>
        <button class="btn btn-primary btn-lg" onclick="handleCallNextPatient('${dept.id}')">
          ✓ Complete Consultation & Call Next Token
        </button>
      </div>
    </div>
  `;
}

function handleDoctorLogin(e) {
  e.preventDefault();
  const email = document.getElementById("doc-email").value.trim();
  const pass = document.getElementById("doc-pass").value;

  const found = demoDoctorAccounts.find(d => d.email.toLowerCase() === email.toLowerCase() && d.pass === pass);
  if (found) {
    localStorage.setItem(STORAGE_PREFIX + "active_doc", JSON.stringify(found));
    showToast(`Welcome, ${found.name}`);
    renderDoctorDesk();
  } else {
    alert("Invalid doctor credentials. Please use demo credentials listed below.");
  }
}

function handleDoctorLogout() {
  localStorage.removeItem(STORAGE_PREFIX + "active_doc");
  showToast("Doctor signed out.");
  renderDoctorDesk();
}

function handleCallNextPatient(deptId) {
  const depts = getDepartments();
  const dept = depts.find(d => d.id === deptId);
  if (dept) {
    dept.currentToken += 1;
    if (dept.waitingCount > 0) {
      dept.waitingCount -= 1;
    }
    saveDepartments(depts);
    showToast(`Now Serving: MQ-${dept.id.toUpperCase()}-${dept.currentToken}`);
    renderDoctorDesk();
  }
}

// 6. PATIENT AUTH (REGISTER & LOGIN)
function switchAuthTab(mode) {
  const loginForm = document.getElementById("patient-login-form");
  const regForm = document.getElementById("patient-register-form");
  const tabLogin = document.getElementById("tab-login");
  const tabReg = document.getElementById("tab-register");

  if (mode === "login") {
    loginForm.classList.remove("hidden");
    regForm.classList.add("hidden");
    tabLogin.classList.add("active");
    tabReg.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    regForm.classList.remove("hidden");
    tabLogin.classList.remove("active");
    tabReg.classList.add("active");
  }
}

function handlePatientRegister(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const age = document.getElementById("reg-age").value;
  const gender = document.getElementById("reg-gender").value;
  const phone = document.getElementById("reg-phone").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  const patients = JSON.parse(localStorage.getItem(STORAGE_PREFIX + "patients") || "[]");

  // Check if exists
  const existing = patients.find(p => p.phone === phone || p.email === email);
  if (existing) {
    alert("An account with this phone or email already exists. Please log in.");
    switchAuthTab("login");
    return;
  }

  const newPatient = { id: "PAT-" + Date.now().toString().slice(-4), name, age, gender, phone, email, password };
  patients.push(newPatient);
  localStorage.setItem(STORAGE_PREFIX + "patients", JSON.stringify(patients));
  localStorage.setItem(STORAGE_PREFIX + "active_user", JSON.stringify(newPatient));

  showToast(`Account created. Welcome ${name}!`);
  navigateTo("book");
}

function handlePatientLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById("login-identifier").value.trim();
  const pass = document.getElementById("login-password").value;

  const patients = JSON.parse(localStorage.getItem(STORAGE_PREFIX + "patients") || "[]");
  const user = patients.find(p => (p.phone === identifier || p.email === identifier) && p.password === pass);

  if (user) {
    localStorage.setItem(STORAGE_PREFIX + "active_user", JSON.stringify(user));
    showToast(`Welcome back, ${user.name}!`);
    navigateTo("home");
  } else {
    alert("Invalid credentials. If you are new, please click 'Create New Account'.");
  }
}

function handleLogout() {
  localStorage.removeItem(STORAGE_PREFIX + "active_user");
  showToast("You have been signed out.");
  updateAuthHeader();
  navigateTo("home");
}

// Initial Boot
window.addEventListener("DOMContentLoaded", () => {
  renderHome();
  updateAuthHeader();
});