// ---------------- LOAD NAVBAR ----------------
async function loadNavbar() {
  const res = await fetch("navbar.html");
  const data = await res.text();

  document.getElementById("navbar").innerHTML = data;

  initNavbar(); // 🔥 run logic AFTER load
}

// ---------------- INIT LOGIC ----------------
function initNavbar() {
  const role = localStorage.getItem("role");

  // ADMIN LINK CONTROL
  const adminLink = document.getElementById("adminLink");
  if (role !== "admin" && adminLink) {
    adminLink.style.display = "none";
  }

  // ---------------- GLOBAL CLICK HANDLER ----------------
document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "logoutBtn") {
    console.log("Logging out...");

    localStorage.clear();
    window.location.href = "index.html";
  }
});
  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // CART COUNT
  const cartLink = document.getElementById("cartLink");
  if (cartLink) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartLink.textContent = `Cart (${totalQty})`;
  }

  // ACTIVE LINK
  const links = document.querySelectorAll(".navbar a");
  links.forEach(link => {
    if (link.pathname === window.location.pathname) {
      link.classList.add("active");
    }
  });
}

// ---------------- RUN ----------------
loadNavbar();