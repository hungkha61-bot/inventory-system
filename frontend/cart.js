const cartContainer = document.getElementById("cartContainer");
const totalPriceEl = document.getElementById("totalPrice");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ---------------- RENDER CART ----------------
function renderCart() {
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty 😢</p>";
    totalPriceEl.textContent = "";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${item.name}</h3>
      <p>Price: $${item.price}</p>
      <p>Qty: ${item.qty}</p>

      <button onclick="increaseQty('${item.id}')">+</button>
      <button onclick="decreaseQty('${item.id}')">-</button>
      <button onclick="removeItem('${item.id}')">Remove</button>
    `;

    cartContainer.appendChild(div);
  });

  totalPriceEl.textContent = `Total: $${total}`;
}

// ---------------- ACTIONS ----------------
function increaseQty(id) {
  const item = cart.find(i => i.id === id);
  item.qty++;

  saveCart();
}

function decreaseQty(id) {
  const item = cart.find(i => i.id === id);

  if (item.qty > 1) {
    item.qty--;
  } else {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

// ---------------- SAVE ----------------
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

//----------- CHECKOUT BTN -------------

const API = "https://inventory-system-syzl.onrender.com/api";
const token = localStorage.getItem("token");

document.getElementById("checkoutBtn").addEventListener("click", async () => {
  if (!token) return alert("Please login first!");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  try {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart,
        total
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    alert("✅ Order placed!");

    // 🔥 clear cart
    cart = [];
    localStorage.removeItem("cart");

    renderCart();

  } catch (err) {
    alert("❌ " + err.message);
  }
});

// ---------------- INIT ----------------
renderCart();