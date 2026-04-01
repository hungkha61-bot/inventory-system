const API = "https://inventory-system-syzl.onrender.com/api";

const productGrid = document.getElementById("productGrid");
const cartBtn = document.getElementById("cartBtn");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ---------------- LOAD PRODUCTS ----------------
async function loadProducts() {
  try {
    const res = await fetch(`${API}/public/items`);
    const data = await res.json();

    renderProducts(data);
  } catch (err) {
    console.error(err);
  }
}

// ---------------- RENDER ----------------
function renderProducts(items) {
  productGrid.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.image || 'https://via.placeholder.com/200'}">
      <h3>${item.name}</h3>
      <p class="price">$${item.price}</p>
      <button onclick="addToCart('${item._id}', '${item.name}', ${item.price})">
        Add to Cart
      </button>
    `;

    productGrid.appendChild(card);
  });
}

// ---------------- CART ----------------
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBtn.textContent = `Cart (${totalQty})`;
}

cartBtn.addEventListener("click", () => {
  window.location.href = "cart.html";
});

// ---------------- INIT ----------------
updateCartUI();
loadProducts();