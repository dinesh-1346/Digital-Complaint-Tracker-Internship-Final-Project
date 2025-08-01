/* ===========================================================================
   Digital Complaint Tracker - app.js
   Author: ChatGPT
   Description: Complete front-end JS for navigation, UI effects, form handling,
   simulated login, user feedback, animations, and more.
   =========================================================================== */

/* ========== GLOBAL VARIABLES & STATE ========== */
const appState = {
  user: null, // { username, fullName, email }
  isLoggedIn: false,
  complaints: [], // array of complaints saved locally
  currentPage: 'index', // 'index' | 'complaint' | 'register'
  validationErrors: [],
};

/* ========== UTILITY FUNCTIONS ========== */

/**
 * Smooth scrolls to a target element by selector.
 * @param {string} selector CSS selector of the target element
 */
function smoothScrollTo(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Creates an element with given attributes and children
 * @param {string} tag Element tag name
 * @param {Object} attributes Attributes object
 * @param  {...any} children Child nodes or text content
 * @returns {HTMLElement}
 */
function createElement(tag, attributes = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, val]) => {
    if (key === 'class') el.className = val;
    else if (key === 'html') el.innerHTML = val;
    else el.setAttribute(key, val);
  });
  children.forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  });
  return el;
}

/**
 * Debounce utility to limit function calls in rapid succession
 * @param {Function} func Function to debounce
 * @param {number} wait Delay in ms
 * @returns {Function}
 */
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Generates a random unique ID string
 * @param {number} length Length of the ID string
 * @returns {string}
 */
function generateId(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/* ========== STORAGE FUNCTIONS ========== */

/**
 * Saves user data to localStorage (simulate backend persistence)
 * @param {Object} user User object
 */
function saveUser(user) {
  localStorage.setItem('dct_user', JSON.stringify(user));
}

/**
 * Loads user data from localStorage
 * @returns {Object|null}
 */
function loadUser() {
  const userStr = localStorage.getItem('dct_user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Saves complaints to localStorage
 * @param {Array} complaints Array of complaints
 */
function saveComplaints(complaints) {
  localStorage.setItem('dct_complaints', JSON.stringify(complaints));
}

/**
 * Loads complaints from localStorage
 * @returns {Array}
 */
function loadComplaints() {
  const compStr = localStorage.getItem('dct_complaints');
  return compStr ? JSON.parse(compStr) : [];
}

/* ========== NAVIGATION & ROUTING ========== */

/**
 * Handles navigation clicks to switch pages
 * @param {string} pageId 'index' | 'complaint' | 'register'
 */
function navigateTo(pageId) {
  appState.currentPage = pageId;

  // Hide all main sections
  document.querySelectorAll('main > section').forEach(sec => {
    sec.style.display = 'none';
  });

  // Show selected page section
  const targetSection = document.getElementById(`${pageId}-page`);
  if (targetSection) {
    targetSection.style.display = 'block';
  }

  // Adjust navbar active link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  // Special: if complaint page and not logged in, redirect to register
  if (pageId === 'complaint' && !appState.isLoggedIn) {
    alert('You must be logged in to file a complaint. Redirecting to Sign In.');
    navigateTo('register');
  }

  // Update URL hash (simulate SPA)
  history.pushState(null, '', `#${pageId}`);

  // Scroll to top on navigation
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ========== FORM VALIDATION ========== */

/**
 * Validates registration form fields
 * @param {HTMLFormElement} form
 * @returns {Array} Array of error messages (empty if no errors)
 */
function validateRegistrationForm(form) {
  const errors = [];
  const username = form.querySelector('#register-username').value.trim();
  const email = form.querySelector('#register-email').value.trim();
  const password = form.querySelector('#register-password').value.trim();
  const confirmPassword = form.querySelector('#register-confirm-password').value.trim();

  if (!username) errors.push('Username is required.');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Valid email is required.');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
  if (password !== confirmPassword) errors.push('Passwords do not match.');

  return errors;
}

/**
 * Validates complaint form fields
 * @param {HTMLFormElement} form
 * @returns {Array} Array of error messages (empty if no errors)
 */
function validateComplaintForm(form) {
  const errors = [];
  const fullName = form.querySelector('#complaint-fullname').value.trim();
  const collegeName = form.querySelector('#complaint-college').value.trim();
  const year = form.querySelector('#complaint-year').value;
  const complaintType = form.querySelector('#complaint-type').value;
  const subject = form.querySelector('#complaint-subject').value.trim();
  const description = form.querySelector('#complaint-description').value.trim();

  if (!fullName) errors.push('Full Name is required.');
  if (!collegeName) errors.push('College Name is required.');
  if (!year) errors.push('Year is required.');
  if (!complaintType) errors.push('Complaint Type is required.');
  if (!subject) errors.push('Subject is required.');
  if (!description) errors.push('Complaint description is required.');

  return errors;
}

/* ========== FORM SUBMISSION HANDLERS ========== */

/**
 * Handles registration form submission
 * @param {Event} e
 */
function handleRegisterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const errors = validateRegistrationForm(form);

  const errorContainer = document.getElementById('register-errors');
  errorContainer.innerHTML = '';

  if (errors.length) {
    errors.forEach(err => {
      const errEl = createElement('div', { class: 'alert alert-danger' }, err);
      errorContainer.appendChild(errEl);
    });
    return;
  }

  // Save user to app state and localStorage
  const user = {
    username: form['register-username'].value.trim(),
    email: form['register-email'].value.trim(),
    fullName: '', // Could be filled later
  };

  appState.user = user;
  appState.isLoggedIn = true;
  saveUser(user);

  // Show success message
  errorContainer.appendChild(createElement('div', { class: 'alert alert-success' }, 'Registration successful! Redirecting...'));

  // Redirect to complaint page after short delay
  setTimeout(() => {
    navigateTo('complaint');
  }, 1500);
}

/**
 * Handles complaint form submission
 * @param {Event} e
 */
function handleComplaintSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const errors = validateComplaintForm(form);
  const errorContainer = document.getElementById('complaint-errors');
  errorContainer.innerHTML = '';

  if (errors.length) {
    errors.forEach(err => {
      const errEl = createElement('div', { class: 'alert alert-danger' }, err);
      errorContainer.appendChild(errEl);
    });
    return;
  }

  // Collect complaint data
  const complaint = {
    id: generateId(),
    fullName: form['complaint-fullname'].value.trim(),
    collegeName: form['complaint-college'].value.trim(),
    year: form['complaint-year'].value,
    complaintType: form['complaint-type'].value,
    subject: form['complaint-subject'].value.trim(),
    description: form['complaint-description'].value.trim(),
    attachedFileName: form['complaint-file'].files[0]?.name || null,
    dateSubmitted: new Date().toISOString(),
    status: 'Pending',
  };

  // Save complaint locally
  appState.complaints.push(complaint);
  saveComplaints(appState.complaints);

  // Reset form and show success message
  form.reset();
  errorContainer.appendChild(createElement('div', { class: 'alert alert-success' }, 'Complaint submitted successfully!'));

  // Optionally: display or update complaint list
  updateComplaintList();
}

/* ========== UI UPDATES ========== */

/**
 * Updates complaint list display (if implemented)
 */
function updateComplaintList() {
  const listContainer = document.getElementById('complaint-list');
  if (!listContainer) return;
  listContainer.innerHTML = '';

  if (!appState.complaints.length) {
    listContainer.appendChild(createElement('p', {}, 'No complaints submitted yet.'));
    return;
  }

  appState.complaints.forEach(comp => {
    const compCard = createElement('div', { class: 'card mb-3' },
      createElement('div', { class: 'card-body' },
        createElement('h5', { class: 'card-title' }, comp.subject),
        createElement('h6', { class: 'card-subtitle mb-2 text-muted' }, `By: ${comp.fullName} (${comp.collegeName})`),
        createElement('p', { class: 'card-text' }, comp.description),
        createElement('small', { class: 'text-muted' }, `Status: ${comp.status} | Submitted on: ${new Date(comp.dateSubmitted).toLocaleString()}`)
      )
    );
    listContainer.appendChild(compCard);
  });
}

/**
 * Displays welcome message or updates UI after login
 */
function updateUIAfterLogin() {
  const userDisplay = document.getElementById('user-display');
  if (!userDisplay) return;
  if (appState.isLoggedIn && appState.user) {
    userDisplay.textContent = `Welcome, ${appState.user.username}!`;
  } else {
    userDisplay.textContent = '';
  }
}

/* ========== EVENT LISTENERS SETUP ========== */

/**
 * Attach event listeners to nav links
 */
function setupNavLinks() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = e.target.dataset.page;
      if (page) navigateTo(page);
    });
  });
}

/**
 * Attach form submit listeners
 */
function setupForms() {
  const registerForm = document.getElementById('register-form');
  if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

  const complaintForm = document.getElementById('complaint-form');
  if (complaintForm) complaintForm.addEventListener('submit', handleComplaintSubmit);
}

/* ========== PAGE LOAD INITIALIZATION ========== */

/**
 * Initializes the app on page load
 */
function initApp() {
  // Load user and complaints from localStorage
  const user = loadUser();
  const complaints = loadComplaints();

  if (user) {
    appState.user = user;
    appState.isLoggedIn = true;
  }
  if (complaints && complaints.length) {
    appState.complaints = complaints;
  }

  // Setup UI
  updateUIAfterLogin();
  updateComplaintList();

  // Setup event listeners
  setupNavLinks();
  setupForms();

  // Setup initial page based on URL hash or default
  const hash = window.location.hash.replace('#', '');
  if (hash === 'complaint' && appState.isLoggedIn) {
    navigateTo('complaint');
  } else if (hash === 'register' && !appState.isLoggedIn) {
    navigateTo('register');
  } else {
    navigateTo('index');
  }

  // Navbar scroll background toggle
  window.addEventListener('scroll', debounce(() => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 100));
}

/* ========== MISC UI ENHANCEMENTS ========== */

/**
 * Adds smooth fadeIn animation to elements on scroll using IntersectionObserver
 */
function setupScrollAnimations() {
  const fadeElems = document.querySelectorAll('.fade-in');
  if (!fadeElems.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  fadeElems.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });
}

/**
 * Simulated API call (returns a resolved Promise after delay)
 * @param {any} data Data to resolve with
 * @param {number} delay Delay in ms
 * @returns {Promise}
 */
function fakeApiCall(data, delay = 1000) {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
}

/* ========== KEYBOARD NAVIGATION HELPERS ========== */

/**
 * Enables keyboard navigation for modals (trap focus inside)
 * @param {HTMLElement} modalElement
 */
function trapFocusInModal(modalElement) {
  const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
  const focusableElements = modalElement.querySelectorAll(focusableElementsString);
  const firstFocusableEl = focusableElements[0];
  const lastFocusableEl = focusableElements[focusableElements.length - 1];

  modalElement.addEventListener('keydown', function(e) {
    const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);

    if (!isTabPressed) return;

    if (e.shiftKey) { // shift + tab
      if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } else { // tab
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus();
        e.preventDefault();
      }
    }
  });
}

/* ========== EXPORTS / PUBLIC API ========== */

/**
 * Initialize the whole app once DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupScrollAnimations();
});
