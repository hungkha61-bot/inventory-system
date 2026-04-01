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

    const img = document.createElement("img");
    img.src = item.image;
    img.addEventListener("click", () => {
        console.log("GO TO:", item._id);
        window.location.href = `./product.html?id=${item._id}`;
    });


const name = document.createElement("h3");
name.textContent = item.name;

const price = document.createElement("p");
price.className = "price";
price.textContent = `$${item.price}`;

const btn = document.createElement("button");
btn.textContent = "Add to Cart";

btn.addEventListener("click", () => {
  addToCart(item._id, item.name, item.price);
});

card.appendChild(img);
card.appendChild(name);
card.appendChild(price);
card.appendChild(btn);

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

function goToProduct(id) {
  window.location.href = `./product.html?id=${id}`;
}

window.addToCart = addToCart;

// ---------------- INIT ----------------
updateCartUI();
loadProducts();