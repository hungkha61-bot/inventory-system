async function loadNavbar() {
  const res = await fetch("admin-navbar.html");
  const data = await res.text();

  document.getElementById("navbar").innerHTML = data;

  initNavbar();
}

function initNavbar() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // active link
  const links = document.querySelectorAll(".navbar a");
  links.forEach(link => {
    if (link.pathname === window.location.pathname) {
      link.classList.add("active");
    }
  });
}

loadNavbar();