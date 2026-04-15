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

    document.getElementById("totalProducts").textContent = data.totalItems;
    document.getElementById("totalOrders").textContent = data.totalOrders || 0;
    document.getElementById("totalRevenue").textContent = "$" + (data.totalValue || 0);
    document.getElementById("lowStock").textContent = data.lowStock || 0;

  } catch (err) {
    console.error("Stats error:", err);
  }
}

// ------------------- LOAD ITEMS -------------------
async function loadItemsPaginated(page = 1) {
  if (!token) return;

  itemList.innerHTML = "<p style='text-align:center;color:gray;'>⏳ Loading items...</p>";

  try {
    const paramsObj = {
      name: searchName.value.trim(),
      createdBy: searchByUser.value.trim(),
      sortBy: sortBy.value,
      order: sortOrder.value,
      page,
      limit
    };

    // ✅ only add valid filters
    if (searchMinPrice.value !== "") paramsObj.minPrice = searchMinPrice.value;
    if (searchMaxPrice.value !== "") paramsObj.maxPrice = searchMaxPrice.value;
    if (searchMinQty.value !== "") paramsObj.minQty = searchMinQty.value;
    if (searchMaxQty.value !== "") paramsObj.maxQty = searchMaxQty.value;

    const params = new URLSearchParams(paramsObj);

    // 🔥 DEBUG (you can remove later)
    console.log("QUERY:", params.toString());

    const res = await fetch(`${API}/items/paginated?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    console.log("DATA:", data);

    renderItems(data.items || []);

    currentPage = data.page;
    pageInfo.textContent = `Page ${data.page} of ${data.totalPages}`;
    prevPageBtn.disabled = data.page <= 1;
    nextPageBtn.disabled = data.page >= data.totalPages;

  } catch (err) {
    console.error("LOAD ERROR:", err);
  }
}
// ------------------- RENDER -------------------
function renderItems(items) {
  if (!items.length) {
    itemList.innerHTML = "<p style='text-align:center;color:gray;'>No items found 😢</p>";
    return;
  }
  itemList.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");

    // CARD
    li.className = "item-card";

    if (item.quantity < 5) {
      li.classList.add("low-stock");
    }

    // LEFT
    const left = document.createElement("div");
    left.className = "item-left";

    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image || "https://via.placeholder.com/200";
      left.appendChild(img);
    }
    
    const info = document.createElement("div");
    info.className = "item-info";

    info.innerHTML = `
      <strong>${item.name}</strong><br>
      <small>💰 ${item.price} | 📦 ${item.quantity}</small><br>
      <small>👤 ${item.createdBy}</small>
    `;

    left.appendChild(info);

    // RIGHT
    const right = document.createElement("div");
    right.className = "item-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn btn-edit";
    editBtn.onclick = () => populateEditForm(item);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn btn-delete";
    delBtn.onclick = () => deleteItem(item._id);

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

  const name = itemInput.value.trim();
  const price = itemPrice.value;
  const quantity = itemQty.value;
  const imageFile = document.getElementById("itemImage").files[0];

  if (!name) return alert("Name is required!");

  let imageUrl = null;

  try {
    // 🔥 1. Upload image to Cloudinary (if selected)
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "inventory_upload");

      const uploadRes = await fetch(
        "https://api.cloudinary.com/v1_1/dm1n8bthw/image/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.secure_url;

      console.log("Cloudinary URL:", imageUrl);
    }

    // 🔥 2. Decide create or update
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API}/items/${editingId}`
      : `${API}/items`;

    // 🔥 3. Send data to backend
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        price,
        quantity,
        image: imageUrl // ✅ send Cloudinary URL
      })
    });

    if (!res.ok) throw new Error("Failed to save item");

    const data = await res.json();

    console.log("Saved item:", data);

    // 🔥 4. Reset form
    itemInput.value = "";
    itemPrice.value = "";
    itemQty.value = "";
    document.getElementById("itemImage").value = "";
    previewImage.style.display = "none";

    editingId = null;

    // 🔥 5. Reload items list
    loadItems();

  } catch (err) {
    console.error(err);
    alert("Error saving item");
  }


      // ✅ RESET FORM (THIS IS WHAT YOU NEED)
    itemInput.value = "";
    itemPrice.value = "";
    itemQty.value = "";
    document.getElementById("itemImage").value = "";

    // hide preview if exists
    if (previewImage) {
      previewImage.style.display = "none";
      previewImage.src = "";
    }

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

let searchTimeout;

function triggerSearch() {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    loadItemsPaginated(1);
  }, 400); // delay to avoid spam API
}

// Attach to inputs
searchName.addEventListener("input", triggerSearch);
searchByUser.addEventListener("input", triggerSearch);
searchMinPrice.addEventListener("input", triggerSearch);
searchMaxPrice.addEventListener("input", triggerSearch);
searchMinQty.addEventListener("input", triggerSearch);
searchMaxQty.addEventListener("input", triggerSearch);

searchMinPrice.addEventListener("change", triggerSearch);
searchMaxPrice.addEventListener("change", triggerSearch);
searchMinQty.addEventListener("change", triggerSearch);
searchMaxQty.addEventListener("change", triggerSearch);

//Image preview
const imageInput = document.getElementById("itemImage");
const previewImage = document.getElementById("previewImage");

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (file) {
    previewImage.src = URL.createObjectURL(file);
    previewImage.style.display = "block";
  } else {
    previewImage.style.display = "none";
  }
});

// ------------------- PAGINATION -------------------
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    loadItemsPaginated(currentPage - 1);
  }
});

nextPageBtn.addEventListener("click", () => {
  loadItemsPaginated(currentPage + 1);
});