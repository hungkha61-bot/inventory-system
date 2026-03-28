const API = "https://inventory-system-syzl.onrender.com/api";

let allItems = [];

async function loadProducts() {
  const res = await fetch(`${API}/public/items`);
  allItems = await res.json();
  renderProducts(allItems);
}

function renderProducts(items) {
  const container = document.getElementById("productList");
  container.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="https://inventory-system-syzl.onrender.com${item.image}" />
      <h3>${item.name}</h3>
      <p class="price">$${item.price}</p>
      <button onclick="viewDetail('${item._id}')">View</button>
    `;

    container.appendChild(div);
  });
}

function viewDetail(id) {
  window.location.href = `product.html?id=${id}`;
}

// 🔍 SEARCH
document.getElementById("searchInput").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();

  const filtered = allItems.filter(item =>
    item.name.toLowerCase().includes(keyword)
  );

  renderProducts(filtered);
});

loadProducts();