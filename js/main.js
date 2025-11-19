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

            // LUXURY ADDITION: 30% chance to show "Sold Out"
            const isSoldOut = Math.random() < 0.3;
            const badgeHTML = isSoldOut
                ? `<span style="position: absolute; top: 10px; left: 10px; background: #111; color: #fff; padding: 4px 8px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; z-index: 10;">Sold Out</span>`
                : '';
            const opacityStyle = isSoldOut ? 'opacity: 0.6;' : '';

            // FIXED LINK: Points to product.html?id=...
            productCard.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link" style="position: relative; ${opacityStyle} display: block;">
                    ${badgeHTML}
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                </a>
            `;

            if (isSoldOut) {
                productCard.querySelector('a').style.pointerEvents = 'none';
            }

            productGrid.appendChild(productCard);
        });
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
    // Scroll Reveal Observer
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, .product-card, footer').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
});