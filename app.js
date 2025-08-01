// app.js

const appState = {
  user: null,
  isLoggedIn: false,
  complaints: [],
  users: [], // Array to store all users for demo (persist in localStorage)
};

function saveUsers(users) {
  localStorage.setItem('dct_users', JSON.stringify(users));
}

function loadUsers() {
  const u = localStorage.getItem('dct_users');
  return u ? JSON.parse(u) : [];
}

function saveUser(user) {
  localStorage.setItem('dct_user', JSON.stringify(user));
}

function loadUser() {
  const u = localStorage.getItem('dct_user');
  return u ? JSON.parse(u) : null;
}

function saveComplaints(comps) {
  localStorage.setItem('dct_complaints', JSON.stringify(comps));
}

function loadComplaints() {
  const c = localStorage.getItem('dct_complaints');
  return c ? JSON.parse(c) : [];
}

function logout() {
  localStorage.removeItem('dct_user');
  appState.user = null;
  appState.isLoggedIn = false;
  window.location.href = 'index.html';
}

function updateNavbar() {
  const userSection = document.getElementById('user-section');
  if (!userSection) return;

  if (appState.isLoggedIn && appState.user) {
    const welcomeMsg = userSection.querySelector('#welcome-msg');
    const logoutBtn = userSection.querySelector('#logout-btn');
    const signInBtn = userSection.querySelector('#sign-in-btn');

    welcomeMsg.textContent = `Welcome, ${appState.user.username}!`;
    welcomeMsg.style.display = 'inline';
    logoutBtn.style.display = 'inline-block';
    signInBtn.style.display = 'none';

    logoutBtn.onclick = logout;
  } else {
    const welcomeMsg = userSection.querySelector('#welcome-msg');
    const logoutBtn = userSection.querySelector('#logout-btn');
    const signInBtn = userSection.querySelector('#sign-in-btn');

    welcomeMsg.style.display = 'none';
    logoutBtn.style.display = 'none';
    signInBtn.style.display = 'inline-block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Load users, user & complaints on any page load
  appState.users = loadUsers();
  const user = loadUser();
  if (user) {
    appState.user = user;
    appState.isLoggedIn = true;
  }
  appState.complaints = loadComplaints();

  updateNavbar();

  // Register form handler
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;

      const errors = [];
      if (!username) errors.push('Username is required.');
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email is required.');
      if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
      if (password !== confirmPassword) errors.push('Passwords do not match.');

      const errorDiv = document.getElementById('register-errors');
      errorDiv.innerHTML = '';
      if (errors.length) {
        errors.forEach(err => {
          const p = document.createElement('p');
          p.textContent = err;
          errorDiv.appendChild(p);
        });
        return;
      }

      // Check if username or email exists
      const userExists = appState.users.find(u => u.username === username || u.email === email);
      if (userExists) {
        errorDiv.textContent = 'Username or email already exists.';
        return;
      }

      // Save new user
      const newUser = { username, email, password };
      appState.users.push(newUser);
      saveUsers(appState.users);

      // Log in this user
      appState.user = newUser;
      appState.isLoggedIn = true;
      saveUser(newUser);

      alert('Registration successful! Redirecting to complaint page...');
      window.location.href = 'complaint.html';
    });
  }

  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;

      const errorDiv = document.getElementById('login-errors');
      errorDiv.innerHTML = '';

      if (!username || !password) {
        errorDiv.textContent = 'Please enter username and password.';
        return;
      }

      // Check if user exists and password matches
      const existingUser = appState.users.find(u => u.username === username && u.password === password);
      if (!existingUser) {
        errorDiv.textContent = 'Invalid username or password.';
        return;
      }

      // Login success
      appState.user = existingUser;
      appState.isLoggedIn = true;
      saveUser(existingUser);

      alert('Login successful! Redirecting to complaint page...');
      window.location.href = 'complaint.html';
    });
  }

  // Complaint form handler
  const complaintForm = document.getElementById('complaint-form');
  if (complaintForm) {
    // Redirect if not logged in
    if (!appState.isLoggedIn) {
      alert('Please log in to file a complaint.');
      window.location.href = 'login.html';
      return;
    }

    complaintForm.addEventListener('submit', e => {
      e.preventDefault();

      const fullName = document.getElementById('complaint-fullname').value.trim();
      const college = document.getElementById('complaint-college').value.trim();
      const year = document.getElementById('complaint-year').value;
      const type = document.getElementById('complaint-type').value;
      const subject = document.getElementById('complaint-subject').value.trim();
      const description = document.getElementById('complaint-description').value.trim();

      const errors = [];
      if (!fullName) errors.push('Full Name is required.');
      if (!college) errors.push('College Name is required.');
      if (!year) errors.push('Year is required.');
      if (!type) errors.push('Complaint Type is required.');
      if (!subject) errors.push('Subject is required.');
      if (!description) errors.push('Description is required.');

      const errorDiv = document.getElementById('complaint-errors');
      errorDiv.innerHTML = '';
      if (errors.length) {
        errors.forEach(err => {
          const p = document.createElement('p');
          p.textContent = err;
          errorDiv.appendChild(p);
        });
        return;
      }

      // Save complaint
      const complaint = {
        id: Date.now(),
        fullName,
        college,
        year,
        type,
        subject,
        description,
        date: new Date().toISOString(),
      };

      appState.complaints.push(complaint);
      saveComplaints(appState.complaints);

      alert('Complaint submitted successfully!');
      complaintForm.reset();
    });
  }

  // Logout buttons
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }
});
