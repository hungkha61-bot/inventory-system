const API = "https://inventory-system-syzl.onrender.com/api";
const token = localStorage.getItem("token");

const container = document.getElementById("ordersContainer");

async function loadOrders() {
  if (!token) {
    container.innerHTML = "<p>Please login first 😢</p>";
    return;
  }

  try {
    const res = await fetch(`${API}/orders/my`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const orders = await res.json();

    renderOrders(orders);

  } catch (err) {
    console.error(err);
  }
}

function renderOrders(orders) {
  container.innerHTML = "";

  if (!orders.length) {
    container.innerHTML = "<p>No orders yet 😢</p>";
    return;
  }

  orders.forEach(order => {
    const div = document.createElement("div");
    div.className = "card";

    const itemsHTML = order.items.map(item => `
      <li>${item.name} - $${item.price} x ${item.qty}</li>
    `).join("");

    div.innerHTML = `
      <h3>🧾 Order</h3>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <ul>${itemsHTML}</ul>
      <p><strong>Total:</strong> $${order.total}</p>
    `;

    container.appendChild(div);
  });
}

loadOrders();