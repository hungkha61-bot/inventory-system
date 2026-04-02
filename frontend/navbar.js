const role = localStorage.getItem("role");

// hide admin link if not admin
const adminLink = document.getElementById("adminLink");
if (role !== "admin" && adminLink) {
  adminLink.style.display = "none";
}

// logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });
}

// ---------------- ACTIVE LINK ----------------
const links = document.querySelectorAll(".navbar a");

links.forEach(link => {
  // compare pathname only (safer)
  if (link.pathname === window.location.pathname) {
    link.style.color = "#00d4ff";
  }
});