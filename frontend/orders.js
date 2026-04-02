const API = "https://inventory-system-syzl.onrender.com/api";
const token = localStorage.getItem("token");
const container = document.getElementById("orders");

async function loadOrders() {
  try {
    const res = await fetch(`${API}/orders`);
    const orders = await res.json();

    if (!orders.length) {
      container.innerHTML = "<p>No orders yet 😢</p>";
      return;
    }

    orders.forEach(order => {
      const div = document.createElement("div");
      div.className = "order-card";

      let itemsHTML = "";

      order.items.forEach(i => {
        itemsHTML += `
          <li>
            <img src="${i.image}" width="50">
            ${i.name} x ${i.qty} = $${i.price * i.qty}
          </li>
        `;
      });

      div.innerHTML = `
        <h3>Order ID: ${order._id}</h3>
        <p>Status: <strong class="status ${order.status}">${order.status}</strong></p>
        <ul>${itemsHTML}</ul>
        <p><strong>Total:</strong> $${order.total}</p>
        <small>${new Date(order.createdAt).toLocaleString()}</small>
        `;

    if (order.status === "Pending") {
  const btn = document.createElement("button");
  btn.textContent = "Mark as Delivered";

  btn.style.marginTop = "10px";

  btn.onclick = async () => {
    try {
      const res = await fetch(`${API}/orders/${order._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "Delivered" })
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Update failed: " + err);
        return;
      }

      alert("Order marked as Delivered ✅");

      // reload to update UI
      location.reload();

    } catch (err) {
      console.error(err);
    }
  };

  div.appendChild(btn); // ⭐ ADD BUTTON TO CARD
}

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
  }
}

loadOrders();

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