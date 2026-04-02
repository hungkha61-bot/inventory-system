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

    // IMAGE
    const img = document.createElement("img");
    img.src = item.image || "https://via.placeholder.com/200";

    img.addEventListener("click", () => {
      window.location.href = `./product.html?id=${item._id}`;
    });

    // NAME
    const name = document.createElement("h3");
    name.textContent = item.name;

    // PRICE
    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `$${item.price}`;

    // BUTTON
    const btn = document.createElement("button");
    btn.textContent = "Add to Cart";

    btn.addEventListener("click", () => {
      addToCart(item._id, item.name, item.price, item.image);

      // 🔥 UX FEEDBACK
      btn.textContent = "Added ✓";
      btn.style.background = "green";

      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.style.background = "black";
      }, 1000);
    });

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(btn);

    productGrid.appendChild(card);
  });
}

// ---------------- CART ----------------
function addToCart(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, image, qty: 1 }); // ✅ add image
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBtn.textContent = `Cart (${totalQty})`;
}


function goToProduct(id) {
  window.location.href = `./product.html?id=${id}`;
}

window.addToCart = addToCart;

// ---------------- INIT ----------------
updateCartUI();
loadProducts();