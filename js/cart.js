document.addEventListener("DOMContentLoaded", () => {
    const cartButton = document.getElementById("cart-button");
    const cartModal = document.getElementById("cart-modal");
    const closeButton = document.querySelector(".close-button");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const cartCountElement = document.getElementById("cart-count");

    // Load cart from localStorage or initialize an empty array
    let cart = JSON.parse(localStorage.getItem('styleSphereCart')) || [];

    // --- Event Listeners (WITH CHECKS) ---
    if (cartButton) {
        cartButton.addEventListener("click", toggleModal);
    }
    
    if (closeButton) {
        closeButton.addEventListener("click", toggleModal);
    }
    
    if (cartModal) {
        window.addEventListener("click", (event) => {
            if (event.target === cartModal) {
                toggleModal();
            }
        });
    }

    // ... (rest of the file stays the same) ...

    // Function to handle "Add to Cart" clicks
    // This needs to be 'globally' available for main.js to attach it
    window.addItemToCart = (id) => {
        // Find the product in our database
        const product = products.find(p => p.id === id);
        if (!product) return; // Safety check

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
        }
        
        saveCart();
        updateCartDisplay();
    };

    function toggleModal() {
        cartModal.style.display = (cartModal.style.display === "block") ? "none" : "block";
    }

    function saveCart() {
        // Save the cart array to localStorage
        localStorage.setItem('styleSphereCart', JSON.stringify(cart));
    }

    function updateCartDisplay() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
        let totalItemCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                totalItemCount += item.quantity;

                const cartItemElement = document.createElement("div");
                cartItemElement.classList.add("cart-item");
                cartItemElement.innerHTML = `
                    <div class="cart-item-info">
                        <span>${item.name} (x${item.quantity})</span>
                    </div>
                    <div class="cart-item-price">
                        <span>$${itemTotal.toFixed(2)}</span>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }

        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
        cartCountElement.textContent = totalItemCount;
    }

    // Initial display update on page load
    updateCartDisplay();
});