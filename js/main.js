document.addEventListener("DOMContentLoaded", () => {
    const productGrid = document.getElementById("product-grid");
    const pageCategory = document.body.dataset.category;

    // Filter products
    let filteredProducts = products;
    if (pageCategory === "men") {
        filteredProducts = products.filter(p => p.category === "men" || p.category === "unisex");
    } else if (pageCategory === "women") {
        filteredProducts = products.filter(p => p.category === "women" || p.category === "unisex");
    }

    renderProducts(filteredProducts);

    function renderProducts(productsToRender) {
        if (!productGrid) return;
        productGrid.innerHTML = "";

        if (productsToRender.length === 0) {
            productGrid.innerHTML = "<p>No products found.</p>";
            return;
        }

        // LIST OF SOLD OUT ITEMS (Hardcoded so it doesn't flicker on refresh)
        // Change these IDs to whatever you want to be out of stock
        const soldOutIds = ["2", "5"];

        productsToRender.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.classList.add("reveal"); // For animation

            // Check if this specific product is in our sold out list
            const isSoldOut = soldOutIds.includes(product.id);

            const badgeHTML = isSoldOut
                ? `<span style="position: absolute; top: 10px; left: 10px; background: #111; color: #fff; padding: 4px 8px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; z-index: 10;">Sold Out</span>`
                : '';

            const opacityStyle = isSoldOut ? 'opacity: 0.6;' : '';
            const pointerEvent = isSoldOut ? 'pointer-events: none;' : '';

            productCard.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link" style="position: relative; ${opacityStyle} ${pointerEvent} display: block;">
                    ${badgeHTML}
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                </a>
            `;

            productGrid.appendChild(productCard);
        });

        // Start the animations
        observeElements();
    }

    function observeElements() {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
});