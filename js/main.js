document.addEventListener("DOMContentLoaded", () => {
    const productGrid = document.getElementById("product-grid");
    const pageCategory = document.body.dataset.category;

    // Filter products based on the page's data-category attribute
    let filteredProducts = products;
    if (pageCategory === "men") {
        filteredProducts = products.filter(p => p.category === "men" || p.category === "unisex");
    } else if (pageCategory === "women") {
        filteredProducts = products.filter(p => p.category === "women" || p.category === "unisex");
    }
    // On index.html, pageCategory will be undefined, so all products are shown

    // Render the product cards
    renderProducts(filteredProducts);

    function renderProducts(productsToRender) {
        if (!productGrid) return; // Exit if no product grid on this page
        productGrid.innerHTML = ""; // Clear existing

        if (productsToRender.length === 0) {
            productGrid.innerHTML = "<p>No products found in this category.</p>";
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");

            // UPDATED: No more button. The entire card links to the product page.
            productCard.innerHTML = `
                <a href="/products/${product.id}" class="product-link">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                </a>
            `;

            productGrid.appendChild(productCard);
        });

        // We no longer need to attach listeners here
        // attachAddToCartListeners(); // <-- DELETE OR COMMENT OUT THIS LINE
    }

    function attachAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
        addToCartButtons.forEach(button => {
            // We use a flag to avoid adding the listener more than once
            if (!button.dataset.listenerAttached) {
                button.addEventListener("click", (event) => {
                    const id = event.target.dataset.id;
                    window.addItemToCart(id); // Call the global function from cart.js
                });
                button.dataset.listenerAttached = "true";
            }
        });
    }
});