(function () {

const API = "https://inventory-system-syzl.onrender.com/api";

const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

if (role !== "admin") {
  window.location.href = "store.html";
}

async function loadDashboard() {
  try {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    const itemsRes = await fetch(`${API}/public/items`, { headers });
    const items = await itemsRes.json();

    const ordersRes = await fetch(`${API}/orders`, { headers });
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

loadDashboard();

})();