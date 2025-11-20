document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const cartButton = document.getElementById("cart-button");
    const cartModal = document.getElementById("cart-modal");
    const closeButton = document.querySelector(".close-button"); // Note: Might be null on some pages if modal isn't loaded
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const cartCountElement = document.getElementById("cart-count");

    // --- State ---
    let cart = JSON.parse(localStorage.getItem('styleSphereCart')) || [];

    // --- Initialization ---
    updateCartDisplay();

    // --- GLOBAL FUNCTION: Add Item ---
    // We attach this to 'window' so main.js can find it
    window.addItemToCart = (id) => {
        // We need to find the product details. 
        // Since products are in products-db.js, we assume 'products' variable is global
        if (typeof products === 'undefined') {
            console.error("Products database not loaded");
            return;
        }

        const product = products.find(p => p.id === id);
        if (!product) return;

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }

        saveCart();
        updateCartDisplay();
        showToast(`Added ${product.name} to cart`);

        // Open modal automatically (Optional luxury touch)
        if (cartModal) cartModal.style.display = "block";
    };

    // --- Helper Functions ---

    function saveCart() {
        localStorage.setItem('styleSphereCart', JSON.stringify(cart));
    }

    function updateCartDisplay() {
        if (!cartItemsContainer) return; // Guard clause

        cartItemsContainer.innerHTML = "";
        let total = 0;
        let totalItemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p style='text-align:center; color:#999;'>Your cart is empty.</p>";
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                totalItemCount += item.quantity;

                const cartItemElement = document.createElement("div");
                cartItemElement.classList.add("cart-item");
                // Add a remove button for better UX
                cartItemElement.innerHTML = `
                    <div style="display:flex; gap:10px; align-items:center;">
                        <img src="${item.image}" style="width:50px; height:60px; object-fit:cover;">
                        <div class="cart-item-info">
                            <div style="font-size:0.9rem;">${item.name}</div>
                            <div style="font-size:0.8rem; color:#666;">x${item.quantity}</div>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        <div>$${itemTotal.toFixed(2)}</div>
                        <button onclick="removeItem(${index})" style="border:none; background:none; color:red; font-size:0.8rem; cursor:pointer; text-decoration:underline;">Remove</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }

        if (cartTotalElement) cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
        if (cartCountElement) cartCountElement.textContent = totalItemCount;
    }

    // Expose remove function globally
    window.removeItem = (index) => {
        cart.splice(index, 1);
        saveCart();
        updateCartDisplay();
    };

    function toggleModal() {
        if (cartModal) {
            cartModal.style.display = (cartModal.style.display === "block") ? "none" : "block";
        }
    }

    function showToast(message) {
        const container = document.getElementById("toast-container");
        if (container) {
            const toast = document.createElement("div");
            toast.className = "toast show";
            toast.textContent = message;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } else {
            // Fallback if toast container missing
            console.log(message);
        }
    }

    // --- Event Listeners ---
    if (cartButton) cartButton.addEventListener("click", toggleModal);
    if (closeButton) closeButton.addEventListener("click", toggleModal);
    window.addEventListener("click", (event) => {
        if (event.target === cartModal) toggleModal();
    });
});

// --- RAZORPAY CHECKOUT LOGIC (Run outside DOMContentLoaded to ensure script loads) ---

// 1. Load Razorpay Script dynamically
const rzpScript = document.createElement('script');
rzpScript.src = "https://checkout.razorpay.com/v1/checkout.js";
document.head.appendChild(rzpScript);

// 2. Checkout Button Listener
document.addEventListener("click", async (e) => {
    // We use event delegation because the button might be inside the modal
    if (e.target && e.target.matches('#cart-modal .btn-primary')) {

        const checkoutBtn = e.target;
        const cart = JSON.parse(localStorage.getItem('styleSphereCart')) || [];

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const originalText = checkoutBtn.textContent;

        checkoutBtn.textContent = "Processing...";
        checkoutBtn.disabled = true;

        try {
            // Call Backend
            const response = await fetch("/.netlify/functions/create-order", {
                method: "POST",
                body: JSON.stringify({ amount: totalAmount })
            });

            const orderData = await response.json();
            if (!response.ok) throw new Error(orderData.error);

            // Open Razorpay
            const options = {
                "key": "rzp_test_RhbHNyejePQu6T", // <--- REPLACE THIS WITH YOUR rzp_test_ KEY
                "amount": orderData.amount,
                "currency": "INR",
                "name": "Édition de Marvaelle",
                "description": "Luxury Checkout",
                "order_id": orderData.id,
                "handler": function (response) {
                    alert("Payment Successful! ID: " + response.razorpay_payment_id);
                    localStorage.removeItem('styleSphereCart');
                    window.location.reload();
                },
                "theme": { "color": "#111111" }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error(error);
            alert("Checkout failed. Please try again.");
        } finally {
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }
    }
});