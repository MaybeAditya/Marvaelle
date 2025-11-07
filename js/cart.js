document.addEventListener("DOMContentLoaded", () => {

    // --- Global Elements (in the header) ---
    const cartCountElement = document.getElementById("cart-count");

    // --- Page-Specific Elements (only on cart.html) ---
    const cartItemsPageContainer = document.getElementById("cart-items-page");
    const cartTotalPageElement = document.getElementById("cart-total-page");

    // Load cart from localStorage or initialize an empty array
    let cart = JSON.parse(localStorage.getItem('styleSphereCart')) || [];


    window.addItemToCart = (id) => {
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
                image: product.image,
                quantity: 1
            });
        }

        saveCart();
        updateCartCount();
        showCartToast(product.name); // <-- ADDED THIS

        if (cartItemsPageContainer) {
            renderCartPage();
        }
    };

    // --- Toast Notification Function ---
    let toastTimer; // Timer to clear the toast
    function showCartToast(productName) {
        const toastElement = document.getElementById("cart-toast-notification");
        if (!toastElement) return; // Do nothing if toast isn't on the page

        // Set the message
        toastElement.textContent = `Added "${productName}" to cart!`;

        // Show the toast
        toastElement.classList.add("show");

        // Clear any existing timer
        clearTimeout(toastTimer);

        // Hide the toast after 3 seconds
        toastTimer = setTimeout(() => {
            toastElement.classList.remove("show");
        }, 3000);
    }

    // --- Cart Management Functions ---

    function saveCart() {
        localStorage.setItem('styleSphereCart', JSON.stringify(cart));
    }

    function updateCartCount() {
        if (!cartCountElement) return;
        const totalItemCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItemCount;
    }

    function changeItemQuantity(id, newQuantity) {
        const item = cart.find(item => item.id === id);
        if (!item) return;

        if (newQuantity <= 0) {
            removeItem(id);
        } else {
            item.quantity = newQuantity;
        }

        saveCart();
        updateCartCount();
        renderCartPage(); // Re-render the whole page
    }

    function removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartCount();
        renderCartPage(); // Re-render the whole page
    }

    // --- Page Rendering Function (for cart.html) ---

    function renderCartPage() {
        // This function only runs if we are on cart.html
        if (!cartItemsPageContainer) return;

        cartItemsPageContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItemsPageContainer.innerHTML = "<p>Your cart is empty.</p>";
            cartTotalPageElement.textContent = "Total: $0.00";
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItemElement = document.createElement("div");
            cartItemElement.classList.add("cart-item-page");
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-page-info">
                    <h3>${item.name}</h3>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-page-controls">
                    <label>Qty:</label>
                    <input type="number" class="item-qty-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                </div>
                <div class="cart-item-page-price">
                    $${itemTotal.toFixed(2)}
                </div>
            `;
            cartItemsPageContainer.appendChild(cartItemElement);
        });

        // Update total price
        cartTotalPageElement.textContent = `Total: $${total.toFixed(2)}`;

        // Add event listeners for new buttons/inputs
        addPageEventListeners();
    }

    function addPageEventListeners() {
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                removeItem(e.target.dataset.id);
            });
        });

        document.querySelectorAll('.item-qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const newQty = parseInt(e.target.value, 10);
                changeItemQuantity(e.target.dataset.id, newQty);
            });
        });
    }

    // --- Initial Load ---
    updateCartCount(); // Update header count on ALL pages
    renderCartPage(); // Build the cart content ONLY if on cart.html
});