const API = "https://inventory-system-syzl.onrender.com/api";

const container = document.getElementById("productDetail");

// get ID from URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// load product
async function loadProduct() {
  try {
    const res = await fetch(`${API}/public/items`);
    const items = await res.json();

    const product = items.find(i => i._id === id);

    if (!product) {
      container.innerHTML = "<p>Product not found 😢</p>";
      return;
    }

    render(product);

  } catch (err) {
    console.error(err);
  }
}

function render(p) {
  container.innerHTML = `
    <img src="${p.image}" style="width:100%;height:300px;object-fit:cover;">
    <h2>${p.name}</h2>
    <p><strong>Price:</strong> $${p.price}</p>
    <p><strong>Stock:</strong> ${p.quantity}</p>
    <button onclick="addToCart('${p._id}','${p.name}', ${p.image}, ${p.price})">
      Add to Cart
    </button>
  `;
}

// reuse cart logic
function addToCart(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

loadProduct();