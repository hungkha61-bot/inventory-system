// script.js

const API = "https://inventory-system-syzl.onrender.com/api";
let token = null;
let role = null;
let email = null;
let currentEditId = null;

token = localStorage.getItem("token");
role = localStorage.getItem("role");
document.addEventListener("DOMContentLoaded", () => {
  if (role === "admin") {
    registerSection.style.display = "block";
  } else {
    registerSection.style.display = "none";
  }
});

// DOM elements
const loginForm = document.getElementById("loginForm");
const loginInfo = document.getElementById("loginInfo");
const addBtn = document.getElementById("addBtn");
const logoutBtn = document.getElementById("logoutBtn");
const itemInput = document.getElementById("itemInput");
const itemPrice = document.getElementById("itemPrice");
const itemQty = document.getElementById("itemQty");
const itemList = document.getElementById("itemList");
const registerSection = document.getElementById("registerSection");

// Search/filter inputs
const searchName = document.getElementById("searchName");
const searchByUser = document.getElementById("searchByUser");
const searchMinPrice = document.getElementById("searchMinPrice");
const searchMaxPrice = document.getElementById("searchMaxPrice");
const searchMinQty = document.getElementById("searchMinQty");
const searchMaxQty = document.getElementById("searchMaxQty");
const searchBtn = document.getElementById("searchBtn");
const exportBtn = document.getElementById("exportBtn");
const sortBy = document.getElementById("sortBy");
const sortOrder = document.getElementById("sortOrder");

// Register inputs
const regUsername = document.getElementById("regUsername");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regRole = document.getElementById("regRole");
const regBtn = document.getElementById("regBtn");

// Pagination
let currentPage = 1;
const limit = 5;
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

addBtn.disabled = true;
logoutBtn.style.display = "none";
registerSection.style.display = "none";

// ------------------- LOGIN -------------------

token = localStorage.getItem("token");
role = localStorage.getItem("role");

if (token) {
  loginForm.remove();

  logoutBtn.style.display = "inline";
  addBtn.disabled = false;

  loadItemsPaginated(1);
  loadStats();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const text = await res.text();
      return alert("Login failed: " + text);
    }

    const data = await res.json();
    token = data.token;
    role = data.role;

    if (role === "admin") {
      registerSection.style.display = "block";
    } else {
      registerSection.style.display = "none";
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    loginInfo.textContent = `Logged in as: ${email} (Role: ${role})`;

    loginForm.style.display = "none";
    
    logoutBtn.style.display = "inline";
    addBtn.disabled = false;

    // Show register section only for admin
    registerSection.style.display = role === "admin" ? "block" : "none";

    loadItemsPaginated(1);
    loadStats();

  } catch (err) {
    console.error(err);
  }
});

async function loadStats() {
  if (!token) return;

  try {
    const res = await fetch(`${API}/items/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    document.getElementById("totalItems").textContent = data.totalItems;
    document.getElementById("totalQty").textContent = data.totalQty;
    document.getElementById("totalValue").textContent = data.totalValue;

  } catch (err) {
    console.error("Stats error:", err);
  }
}

// ------------------- LOGOUT -------------------
logoutBtn.addEventListener("click", () => {
  token = null;
  role = null;
  email = null;
  currentEditId = null;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  location.reload();
  loginInfo.textContent = "";
  itemList.innerHTML = "";
  loginForm.style.display = "block";
  itemInput.value = "";
  itemPrice.value = "";
  itemQty.value = "";
  logoutBtn.style.display = "none";
  addBtn.disabled = true;
  registerSection.style.display = "none";
  addBtn.textContent = "Add";
  alert("Logged out successfully!");
});

// ------------------- LOAD ITEMS WITH PAGINATION -------------------
async function loadItemsPaginated(page = 1) {
  if (!token) return;
  itemList.innerHTML = "<p style='color:gray;'>Loading items...</p>";
  try {
    const params = new URLSearchParams({
      name: searchName.value.trim(),
      createdBy: searchByUser.value.trim(),
      minPrice: searchMinPrice.value,
      maxPrice: searchMaxPrice.value,
      minQty: searchMinQty.value,
      maxQty: searchMaxQty.value,
      sortBy: sortBy.value,
      order: sortOrder.value,
      page,
      limit
    });

    const res = await fetch(`${API}/items/paginated?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    renderItems(data.items);

    // Pagination
    currentPage = data.page;
    pageInfo.textContent = `Page ${data.page} of ${data.totalPages}`;
    prevPageBtn.disabled = data.page <= 1;
    nextPageBtn.disabled = data.page >= data.totalPages;

  } catch (err) {
    console.error("Load items error:", err);
  }
}

// ------------------- RENDER ITEMS -------------------
function renderItems(items) {
  itemList.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");

    li.style.border = "1px solid #ddd";
    li.style.padding = "10px";
    li.style.marginBottom = "10px";
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.justifyContent = "space-between";

    // LEFT: image + info
    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.alignItems = "center";

    // Image
    if (item.image) {
      const img = document.createElement("img");
      img.src = `http://localhost:4000${item.image}`;
      img.width = 60;
      img.style.marginRight = "10px";
      img.style.borderRadius = "6px";
      left.appendChild(img);
    }

    if (item.quantity < 5) {
      li.style.backgroundColor = "#ffe5e5";
    }

    // Info
    const info = document.createElement("div");

    info.innerHTML = `
      <strong>${item.name}</strong><br>
      💰 Price: ${item.price} |
      📦 Qty: ${item.quantity}<br>
      👤 ${item.createdBy}
    `;

    left.appendChild(info);

    // RIGHT: buttons
    const right = document.createElement("div");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => populateEditForm(item);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.style.marginLeft = "5px";
    delBtn.onclick = () => deleteItem(item._id);

    right.appendChild(editBtn);
    right.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(right);

    itemList.appendChild(li);
  });
}

// ------------------- ADD / UPDATE ITEM -------------------
addBtn.addEventListener("click", async (e) => {
  e.preventDefault();  
  if (!token) return alert("Login first!");

  const name = itemInput.value.trim();
  const price = itemPrice.value;
  const quantity = itemQty.value;
  const image = document.getElementById("itemImage").files[0];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("quantity", quantity);
  if (image) formData.append("image", image);

  try {
    let url = `${API}/items`;
    let method = "POST";

    if (currentEditId) {
      url = `${API}/items/${currentEditId}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) throw new Error(await res.text());

    // reset
    itemInput.value = "";
    itemPrice.value = "";
    itemQty.value = "";
    document.getElementById("itemImage").value = "";

    currentEditId = null;
    addBtn.textContent = "Add";

    loadItemsPaginated(1);
    loadStats();

  } catch (err) {
    console.error("Save error:", err);
  }
});

// ------------------- DELETE ITEM -------------------
async function deleteItem(id) {
  if (!token) return alert("Login first!");
  try {
    const res = await fetch(`${API}/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());
    loadItemsPaginated(currentPage);
    loadStats();
  } catch (err) {
    console.error("Delete error:", err);
  }
}

// ------------------- EDIT ITEM -------------------

function populateEditForm(item) {
  currentEditId = item._id;

  // Fill inputs
  itemInput.value = item.name;
  itemPrice.value = item.price;
  itemQty.value = item.quantity;

  // Change button text
  addBtn.textContent = "Update";
}

function startEdit(item) {
  currentEditId = item._id;

  itemInput.value = item.name;
  itemPrice.value = item.price;
  itemQty.value = item.quantity;

  addBtn.textContent = "Update";

  // ⭐ IMAGE PREVIEW
  const img = document.getElementById("editImagePreview");

  if (item.image) {
    img.src = `http://localhost:4000${item.image}`;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }
}


// ------------------- SEARCH -------------------
searchBtn.addEventListener("click", () => loadItemsPaginated(1));

// ------------------- SORT -------------------
sortBy.addEventListener("change", () => loadItemsPaginated(1));
sortOrder.addEventListener("change", () => loadItemsPaginated(1));

// ------------------- EXPORT CSV -------------------
exportBtn.addEventListener("click", async () => {
  if (!token) return alert("Login first!");

  try {
    const params = new URLSearchParams({
      name: searchName.value.trim(),
      createdBy: searchByUser.value.trim(),
      minPrice: searchMinPrice.value,
      maxPrice: searchMaxPrice.value,
      minQty: searchMinQty.value,
      maxQty: searchMaxQty.value
    });

    const res = await fetch(`${API}/items/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_items.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Export error:", err);
  }
});

// ------------------- PAGINATION -------------------
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) loadItemsPaginated(currentPage - 1);
});
nextPageBtn.addEventListener("click", () => {
  loadItemsPaginated(currentPage + 1);
});

// ------------------- REGISTER NEW USER -------------------
regBtn.addEventListener("click", async () => {
  if (!token) return alert("Login first!");
  const username = regUsername.value.trim();
  const emailInput = regEmail.value.trim();
  const password = regPassword.value;
  const userRole = regRole.value;

  if (!username || !emailInput || !password) return alert("Fill all fields");

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username, email: emailInput, password, role: userRole })
    });
    if (!res.ok) throw new Error(await res.text());

    alert("User registered successfully!");
    regUsername.value = "";
    regEmail.value = "";
    regPassword.value = "";
  } catch (err) {
    console.error("Register error:", err);
  }
});

