document.getElementById("registrationForm").addEventListener("submit", function(event) {
    const pwd = document.getElementById("password").value;
    const confirmPwd = document.getElementById("confirmPassword").value;
    const error = document.getElementById("error");

    if (pwd !== confirmPwd) {
        event.preventDefault();
        error.textContent = "Passwords do not match.";
    } else {
        error.textContent = "";
    }
});
