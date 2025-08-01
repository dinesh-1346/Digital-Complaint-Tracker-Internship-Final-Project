document.addEventListener("DOMContentLoaded", () => {
  const regForm = document.getElementById("registerForm");
  const nameInput = document.getElementById("regName");
  const emailInput = document.getElementById("regEmail");
  const passwordInput = document.getElementById("regPassword");
  const confirmInput = document.getElementById("regConfirm");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmError = document.getElementById("confirmError");
  const regMessage = document.getElementById("regMessage");

  // Password checklist elements
  const lengthCheck = document.getElementById("lengthCheck");
  const upperCheck = document.getElementById("upperCheck");
  const lowerCheck = document.getElementById("lowerCheck");
  const numberCheck = document.getElementById("numberCheck");
  const specialCheck = document.getElementById("specialCheck");

  const toLoginBtn = document.getElementById("toLoginBtn");
  toLoginBtn.onclick = () => {
    // Just alert for now, replace with real login view logic
    alert("Replace this with Login page rendering");
  };

  function validatePassword(pw) {
    return {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[!@#$%^&*]/.test(pw),
    };
  }

  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    const checks = validatePassword(val);

    lengthCheck.classList.toggle("valid", checks.length);
    lengthCheck.classList.toggle("invalid", !checks.length);

    upperCheck.classList.toggle("valid", checks.upper);
    upperCheck.classList.toggle("invalid", !checks.upper);

    lowerCheck.classList.toggle("valid", checks.lower);
    lowerCheck.classList.toggle("invalid", !checks.lower);

    numberCheck.classList.toggle("valid", checks.number);
    numberCheck.classList.toggle("invalid", !checks.number);

    specialCheck.classList.toggle("valid", checks.special);
    specialCheck.classList.toggle("invalid", !checks.special);
  });

  regForm.addEventListener("submit", async e => {
    e.preventDefault();

    nameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmError.textContent = "";
    regMessage.textContent = "";

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    let hasError = false;

    if (!name) {
      nameError.textContent = "Name is required.";
      hasError = true;
    }
    if (!email) {
      emailError.textContent = "Email is required.";
      hasError = true;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      emailError.textContent = "Email format invalid.";
      hasError = true;
    }
    const pwChecks = validatePassword(password);
    if (!pwChecks.length || !pwChecks.upper || !pwChecks.lower || !pwChecks.number || !pwChecks.special) {
      passwordError.textContent = "Password does not meet requirements.";
      hasError = true;
    }
    if (password !== confirm) {
      confirmError.textContent = "Passwords do not match.";
      hasError = true;
    }

    if (hasError) return;

    // Here you would send registration data to server (PHP backend)
    try {
      const response = await fetch("api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        regMessage.style.color = "green";
        regMessage.textContent = "Registration successful! Redirecting to login...";
        setTimeout(() => {
          // redirect or render login page
          alert("Redirect to login page here");
        }, 1500);
      } else {
        regMessage.style.color = "red";
        regMessage.textContent = data.error || "Registration failed.";
      }
    } catch (err) {
      regMessage.style.color = "red";
      regMessage.textContent = "Network error.";
    }
  });
});
