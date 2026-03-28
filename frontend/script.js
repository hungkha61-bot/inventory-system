// ------------------- CONFIG -------------------
const BASE_URL = "https://inventory-system-syzl.onrender.com";
const API = `${BASE_URL}/api`;

let token = localStorage.getItem("token");
let role = localStorage.getItem("role");
let email = null;
let currentEditId = null;

// ------------------- DOM READY -------------------
document.addEventListener("DOMContentLoaded", () => {

  const registerSection = document.getElementById("registerSection");

  // 🔥 Control register visibility on load
  registerSection.style.display = role === "admin" ? "block" : "none";

  if (token) {
    loginForm.style.display = "none";
    logoutBtn.style.display = "inline";
    addBtn.disabled = false;

    loadItemsPaginated(1);
    loadStats();
  }
});

// ------------------- DOM ELEMENTS -------------------
const loginForm = document.getElementById("loginForm");
const loginInfo = document.getElementById("loginInfo");
const addBtn = document.getElementById("addBtn");
const logoutBtn = document.getElementById("logoutBtn");
const itemInput = document.getElementById("itemInput");
const itemPrice = document.getElementById("itemPrice");
const itemQty = document.getElementById("itemQty");
const itemList = document.getElementById("itemList");
const registerSection = document.getElementById("registerSection");

// Search/filter
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

// Register
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

// Initial UI
addBtn.disabled = true;
logoutBtn.style.display = "none";
registerSection.style.display = "none";

// ------------------- LOGIN -------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const text = await res.text();
      return alert("Login failed: " + text);
    }

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data);

    token = data.token;
    role = data.role;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    // 🔥 Role-based UI
    registerSection.style.display = role === "admin" ? "block" : "none";

    loginInfo.textContent = `Logged in as: ${email} (Role: ${role})`;

    loginForm.style.display = "none";
    logoutBtn.style.display = "inline";
    addBtn.disabled = false;

    loadItemsPaginated(1);
    loadStats();

  } catch (err) {
    console.error(err);
  }
});

// ------------------- LOGOUT -------------------
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  token = null;
  role = null;

  location.reload();
});

// ------------------- STATS -------------------
async function loadStats() {
  if (!token) return;

  try {
    const res = await fetch(`${API}/items/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    document.getElementById("totalItems").textContent = data.totalItems;
    document.getElementById("totalQty").textContent = data.totalQty;
    document.getElementById("totalValue").textContent = data.totalValue;

  } catch (err) {
    console.error("Stats error:", err);
  }
}

// ------------------- LOAD ITEMS -------------------
async function loadItemsPaginated(page = 1) {
  if (!token) return;

  itemList.innerHTML = "<p>Loading...</p>";

  try {
    const params = new URLSearchParams({
      name: searchName.value,
      page,
      limit
    });

    const res = await fetch(`${API}/items/paginated?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    renderItems(data.items);

    currentPage = data.page;
    pageInfo.textContent = `Page ${data.page} of ${data.totalPages}`;

  } catch (err) {
    console.error(err);
  }
}

// ------------------- RENDER -------------------
function renderItems(items) {
  itemList.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");

    const left = document.createElement("div");

    if (item.image) {
      const img = document.createElement("img");
      img.src = `${BASE_URL}${item.image}`;
      img.style.width = "60px";
      img.style.height = "60px";
      img.style.marginRight = "10px";
      left.appendChild(img);
    }

    left.innerHTML += `${item.name} - ${item.price} - ${item.quantity}`;

    const right = document.createElement("div");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => populateEditForm(item);
    editBtn.style.cursor = "pointer";

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteItem(item._id);
    delBtn.style.cursor = "pointer";

    right.appendChild(editBtn);
    right.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(right);

    itemList.appendChild(li);
  });
}

// ------------------- ADD / UPDATE -------------------
addBtn.addEventListener("click", async () => {
  if (!token) return alert("Login first!");

  const formData = new FormData();
  formData.append("name", itemInput.value);
  formData.append("price", itemPrice.value);
  formData.append("quantity", itemQty.value);

  const image = document.getElementById("itemImage").files[0];
  if (image) formData.append("image", image);

  let url = `${API}/items`;
  let method = "POST";

  if (currentEditId) {
    url = `${API}/items/${currentEditId}`;
    method = "PUT";
  }

  await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  currentEditId = null;
  addBtn.textContent = "Add";

  loadItemsPaginated(1);
  loadStats();
});

// ------------------- DELETE -------------------
async function deleteItem(id) {
  await fetch(`${API}/items/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadItemsPaginated(currentPage);
  loadStats();
}

// ------------------- EDIT -------------------
function populateEditForm(item) {
  currentEditId = item._id;

  itemInput.value = item.name;
  itemPrice.value = item.price;
  itemQty.value = item.quantity;

  addBtn.textContent = "Update";
}

// ------------------- REGISTER -------------------
regBtn.addEventListener("click", async () => {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      username: regUsername.value,
      email: regEmail.value,
      password: regPassword.value,
      role: regRole.value
    })
  });

  if (res.ok) alert("User created!");
});