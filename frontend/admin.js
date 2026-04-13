(function () {

const API = "https://inventory-system-syzl.onrender.com/api";

const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
  return;
}

const userRole = role ? role.toLowerCase() : "user";

function applyRolePermissions() {
  if (userRole !== "admin") {
    const adminElements = document.querySelectorAll(".admin-only");
    adminElements.forEach(el => el.style.display = "none");
  }
}

async function loadDashboard() {
  try {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    const itemsRes = await fetch(`${API}/public/items`, { headers });
    if (!itemsRes.ok) throw new Error(itemsRes.status);
    const items = await itemsRes.json();

    const ordersRes = await fetch(`${API}/orders`, { headers });
    if (!ordersRes.ok) throw new Error(ordersRes.status);
    const orders = await ordersRes.json();

    document.getElementById("totalProducts").textContent = items.length;
    document.getElementById("totalOrders").textContent = orders.length;

    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    document.getElementById("totalRevenue").textContent = "$" + revenue;

    const lowStock = items.filter(i => i.quantity < 5).length;
    document.getElementById("lowStock").textContent = lowStock;

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyRolePermissions();
  loadDashboard();
});

})();