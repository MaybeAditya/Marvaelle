document.addEventListener("DOMContentLoaded", () => {
    const productDetailContainer = document.getElementById("product-detail-container");

    // 1. Get the product ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // 2. Find the product in our "database"
    // Note: products array is available globally from 'js/products-db.js'
    const product = products.find(p => p.id === productId);

    // 3. Render the product (or an error)
    if (product) {
        renderProductDetails(product);
    } else {
        renderError();
    }

    function renderProductDetails(product) {
        // Set the page title
        document.title = `StyleSphere - ${product.name}`;

        // Generate reviews HTML
        let reviewsHtml = '<h3>Reviews</h3>';
        if (product.reviews.length > 0) {
            reviewsHtml += '<ul class="review-list">';
            product.reviews.forEach(review => {
                reviewsHtml += `
                    <li class="review-item">
                        <strong>${review.user}</strong> (${review.rating}/5 stars)
                        <p>${review.comment}</p>
                    </li>
                `;
            });
            reviewsHtml += '</ul>';
        } else {
            reviewsHtml += '<p>No reviews yet.</p>';
        }

        // Generate the full product detail HTML
        productDetailContainer.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-detail-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-detail-info">
                    <h1>${product.name}</h1>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="description">${product.description}</p>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
            <div class="product-reviews">
                ${reviewsHtml}
            </div>
        `;
        
        // Add event listener to the *one* Add to Cart button on this page
        document.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
            window.addItemToCart(e.target.dataset.id); // Use global cart function
        });
    }

    function renderError() {
        productDetailContainer.innerHTML = `
            <h1>Product Not Found</h1>
            <p>Sorry, we couldn't find the product you're looking for.</p>
            <a href="index.html" class="btn">Back to Home</a>
        `;
    }
});