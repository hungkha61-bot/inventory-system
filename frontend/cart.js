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

    const row = document.createElement("div");
    row.className = "cart-row";

    row.innerHTML = `
      <img src="${item.image || 'https://via.placeholder.com/80'}">

      <div class="cart-info">
        <h3>${item.name}</h3>
        <p>$${item.price}</p>
      </div>

      <div class="cart-qty">
        <button onclick="decreaseQty('${item.id}')">-</button>
        <span>${item.qty}</span>
        <button onclick="increaseQty('${item.id}')">+</button>
      </div>

      <div class="cart-total">
        $${item.price * item.qty}
      </div>

      <button class="remove-btn" onclick="removeItem('${item.id}')">
        ✕
      </button>
    `;

    cartContainer.appendChild(row);
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
const res = await fetch("https://inventory-system-syzl.onrender.com/api/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ items: cart })
});

const text = await res.text();
console.log("SERVER RESPONSE:", text);

if (!res.ok) {
  alert("Order failed: " + text);
  return;
}

const data = JSON.parse(text);
alert("Order placed!");
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