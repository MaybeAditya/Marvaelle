// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {

    // --- Select DOM Elements ---
    const cartButton = document.getElementById("cart-button");
    const cartModal = document.getElementById("cart-modal");
    const closeButton = document.querySelector(".close-button");
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const cartCountElement = document.getElementById("cart-count");

    // --- Application State ---
    let cart = []; // This will store our cart items

    // --- Event Listeners ---

    // Show/Hide Cart Modal
    cartButton.addEventListener("click", toggleModal);
    closeButton.addEventListener("click", toggleModal);
    window.addEventListener("click", (event) => {
        if (event.target === cartModal) {
            toggleModal();
        }
    });

    // Add to Cart
    addToCartButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            // Get product info from data attributes
            const id = event.target.dataset.id;
            const name = event.target.dataset.name;
            const price = parseFloat(event.target.dataset.price);

            addItemToCart(id, name, price);
        });
    });

    // --- Functions ---

    function toggleModal() {
        cartModal.style.display = (cartModal.style.display === "block") ? "none" : "block";
    }

    function addItemToCart(id, name, price) {
        // Check if item is already in cart
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            // If it exists, just increase quantity
            existingItem.quantity++;
        } else {
            // If it's new, add it to the cart
            cart.push({ id, name, price, quantity: 1 });
        }

        // Update the UI
        updateCartDisplay();
    }

    function updateCartDisplay() {
        // Clear previous cart items
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

                // Create a new element for the cart item
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

        // Update total price and cart count
        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
        cartCountElement.textContent = totalItemCount;
    }

});