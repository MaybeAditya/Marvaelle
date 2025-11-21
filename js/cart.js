document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const cartButton = document.getElementById("cart-button");
    const cartModal = document.getElementById("cart-modal");
    const closeButton = document.querySelector(".close-button");

    // FIX 1: Look for EITHER the modal container OR the full page container
    const cartItemsContainer = document.getElementById("cart-items") || document.getElementById("cart-items-page");
    const cartTotalElement = document.getElementById("cart-total") || document.getElementById("cart-total-page");
    const cartCountElement = document.getElementById("cart-count");

    // --- State ---
    let cart = JSON.parse(localStorage.getItem('styleSphereCart')) || [];

    // --- Initialization ---
    updateCartDisplay();
    refreshAllButtonStates(); // <--- NEW: Check buttons on page load

    // --- GLOBAL FUNCTION: Add Item ---
    window.addItemToCart = (id) => {
        if (typeof products === 'undefined') {
            console.error("Products database not loaded");
            return;
        }

        const product = products.find(p => p.id === id);
        if (!product) return;

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
            showToast(`Updated quantity for ${product.name}`);
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
            showToast(`Added ${product.name} to cart`);
        }

        saveCart();
        updateCartDisplay();

        // FIX 2: Update the button text immediately
        updateButtonState(id);

        // Open modal ONLY if it exists on the page
        if (cartModal) cartModal.style.display = "block";
    };

    // --- Helper Functions ---

    function saveCart() {
        localStorage.setItem('styleSphereCart', JSON.stringify(cart));
    }

    // NEW: Function to update button text to "In Cart"
    function updateButtonState(id) {
        // Find any button on the page with this data-id
        const buttons = document.querySelectorAll(`button[data-id="${id}"]`);

        buttons.forEach(btn => {
            btn.textContent = "In Cart";
            btn.disabled = true; // Optional: prevent double adding
            btn.style.backgroundColor = "#444"; // Visual feedback
            btn.style.cursor = "default";
        });
    }

    // NEW: Run this on load to update buttons for items ALREADY in storage
    function refreshAllButtonStates() {
        cart.forEach(item => {
            updateButtonState(item.id);
        });
    }

    function updateCartDisplay() {
        // Update the number in the header (Nav bar)
        let totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) cartCountElement.textContent = totalItemCount;

        // If we are not on a page with a cart list (like index.html), stop here
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p style='text-align:center; color:#999; padding: 20px;'>Your cart is empty.</p>";
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const cartItemElement = document.createElement("div");
                cartItemElement.classList.add("cart-item");

                // Note: Added simple styling directly to ensure it looks okay immediately
                cartItemElement.innerHTML = `
                    <div style="display:flex; gap:15px; align-items:center; margin-bottom: 15px; border-bottom:1px solid #eee; padding-bottom:15px;">
                        <img src="${item.image}" style="width:60px; height:70px; object-fit:cover; border-radius:4px;">
                        <div class="cart-item-info" style="flex-grow:1;">
                            <div style="font-weight:600;">${item.name}</div>
                            <div style="font-size:0.9rem; color:#666;">$${item.price} x ${item.quantity}</div>
                        </div>
                        <div class="cart-item-price" style="text-align:right;">
                            <div style="font-weight:bold;">$${itemTotal.toFixed(2)}</div>
                            <button onclick="removeItem(${index})" style="border:none; background:none; color:#cc0000; font-size:0.8rem; cursor:pointer; margin-top:5px;">Remove</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }

        if (cartTotalElement) cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Expose remove function globally
    window.removeItem = (index) => {
        // If we remove an item, we need to re-enable the "Add" button
        const itemToRemove = cart[index];

        cart.splice(index, 1);
        saveCart();
        updateCartDisplay();

        // Reset the button for this item if it exists on the current page
        if (itemToRemove) {
            const buttons = document.querySelectorAll(`button[data-id="${itemToRemove.id}"]`);
            buttons.forEach(btn => {
                btn.textContent = "Add to Cart";
                btn.disabled = false;
                btn.style.backgroundColor = ""; // Reset color
                btn.style.cursor = "pointer";
            });
        }
    };

    function toggleModal() {
        if (cartModal) {
            cartModal.style.display = (cartModal.style.display === "block") ? "none" : "block";
        } else {
            // If no modal exists (like on index.html), go to cart page
            window.location.href = "cart.html";
        }
    }

    function showToast(message) {
        const container = document.getElementById("toast-container");
        if (container) {
            const toast = document.createElement("div");
            toast.className = "toast show";
            // Ensure you have CSS for .toast.show
            toast.style.backgroundColor = "#333";
            toast.style.color = "#fff";
            toast.style.padding = "10px 20px";
            toast.style.borderRadius = "4px";
            toast.style.marginTop = "10px";

            toast.textContent = message;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        } else {
            console.log(message);
        }
    }

    // --- Event Listeners ---
    if (cartButton) cartButton.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent link navigation if we are opening a modal
        toggleModal();
    });

    if (closeButton) closeButton.addEventListener("click", toggleModal);

    window.addEventListener("click", (event) => {
        if (event.target === cartModal) toggleModal();
    });
});
// ... (This goes after the final }); in your file)

// --- RAZORPAY CHECKOUT LOGIC ---

// 1. Load Razorpay Script dynamically (Safe check to avoid errors)
if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
    const rzpScript = document.createElement('script');
    rzpScript.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.head.appendChild(rzpScript);
}

// 2. Checkout Button Listener
document.addEventListener("click", async (e) => {
    // Check if clicked element is a Checkout button (in Modal OR on Cart Page)
    if (e.target && (e.target.matches('#cart-modal .btn-primary') || e.target.matches('#cart-summary-page .btn-dark'))) {

        const checkoutBtn = e.target;

        // Security check: ensure it's actually a checkout button
        const btnText = checkoutBtn.textContent.toLowerCase();
        if (!btnText.includes("checkout") && !btnText.includes("proceed")) return;

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
            // Call Backend to create order
            const response = await fetch("/.netlify/functions/create-order", {
                method: "POST",
                body: JSON.stringify({ amount: totalAmount })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${errorText}`);
            }

            const orderData = await response.json();

            // Open Razorpay Payment Window
            const options = {
                "key": "rzp_test_RhbHNyejePQu6T", // Replace with your actual Key ID
                "amount": orderData.amount,
                "currency": "INR",
                "name": "Édition de Marvaelle",
                "description": "Luxury Checkout",
                "order_id": orderData.id,
                "handler": function (response) {
                    // On Success:
                    alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);

                    // Clear Cart
                    localStorage.removeItem('styleSphereCart');

                    // Redirect or Reload
                    window.location.href = "index.html";
                },
                "theme": { "color": "#111111" }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error(error);
            alert("Checkout initialization failed. Please try again.");
        } finally {
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }
    }
});