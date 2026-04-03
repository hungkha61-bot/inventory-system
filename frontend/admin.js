const API = "https://inventory-system-syzl.onrender.com/api";

// 🔒 Protect admin page
const role = localStorage.getItem("role");

if (role !== "admin") {
  window.location.href = "store.html";
}

// ---------------- DASHBOARD ----------------
async function loadDashboard() {
  try {
    const itemsRes = await fetch(`${API}/items`);
    const items = await itemsRes.json();

    const ordersRes = await fetch(`${API}/orders`);
    const orders = await ordersRes.json();

    document.getElementById("totalProducts").textContent = items.length;
    document.getElementById("totalOrders").textContent = orders.length;

    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    document.getElementById("totalRevenue").textContent = "$" + revenue;

    const lowStock = items.filter(i => i.quantity < 5).length;
    document.getElementById("lowStock").textContent = lowStock;

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
  }
}

// ---------------- INIT ----------------
loadDashboard();