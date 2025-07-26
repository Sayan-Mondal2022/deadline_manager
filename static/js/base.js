// Simulate login status check
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

const authLinks = document.getElementById("auth-links");
const accountLink = document.getElementById("account-link");

if (isLoggedIn) {
  authLinks.style.display = "none";
  accountLink.style.display = "inline";
} else {
  authLinks.style.display = "inline";
  accountLink.style.display = "none";
}

// Simulate login (example only — attach to real login later)
function login() {
  localStorage.setItem("isLoggedIn", "true");
  location.reload();
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  location.reload();
}
