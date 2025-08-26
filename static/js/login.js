// Toggle show/hide password with eye icon
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", function () {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;

  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});

// Username validation
document.getElementById("username").addEventListener("input", function () {
  const val = this.value;
  const msg = document.getElementById("usernameMsg");

  if (/^[a-zA-Z0-9]{4,16}$/.test(val)) {
    msg.textContent = "Valid username ✔";
    msg.className = "message valid";
  } else {
    msg.textContent = "Username must be 4–16 alphanumeric characters";
    msg.className = "message error";
  }
});

// Password validation
document.getElementById("password").addEventListener("input", function () {
  const val = this.value;
  const msg = document.getElementById("passwordMsg");

  if (val.length >= 6 && !val.includes(" ")) {
    msg.textContent = "Valid password ✔";
    msg.className = "message valid";
  } else {
    msg.textContent = "Password must be at least 6 characters, no spaces";
    msg.className = "message error";
  }
});
