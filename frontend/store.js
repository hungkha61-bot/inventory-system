const API = "https://inventory-system-syzl.onrender.com/api";

async function loadProducts() {
  try {
    const res = await fetch(`${API}/public/items`);
    const items = await res.json();

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

  } catch (err) {
    console.error(err);
  }
}

function viewDetail(id) {
  window.location.href = `product.html?id=${id}`;
}

loadProducts();