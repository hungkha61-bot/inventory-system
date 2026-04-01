const res = await fetch("https://inventory-system-syzl.onrender.com/api/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ items: cart })
});

const text = await res.text();
console.log("SERVER:", text);

if (!res.ok) {
  alert("Order failed: " + text);
  return;
}

alert("Order placed successfully 🎉");
localStorage.removeItem("cart");
window.location.href = "store.html";