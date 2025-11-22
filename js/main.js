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
document.addEventListener('DOMContentLoaded', () => {
    // 1. Get user from LocalStorage (Assuming auth.js saves it there)
    // Note: Adjust 'user_session' to whatever key you actually use in auth.js
    const userSession = localStorage.getItem('user_session') || localStorage.getItem('user');

    if (userSession) {
        try {
            const user = JSON.parse(userSession);

            // 2. Check if they have a member ID
            // If the database sends 'member_id' or 'id', we use that
            const memberId = user.member_id || user.id || user.memberId;

            if (memberId) {
                const container = document.getElementById('member-id-container');
                const numberSpan = document.getElementById('member-number');

                // 3. Format it (e.g., turns 42 into "0042")
                const formattedId = memberId.toString().padStart(4, '0');

                // 4. Show it & Enable Hacker Effect
                numberSpan.innerText = formattedId;
                numberSpan.dataset.value = formattedId; // Required for the effect

                // Call the function (defined at bottom of file)
                enableHackerEffect(numberSpan);

                container.style.display = 'inline-block';
            }
        } catch (e) {
            console.error("Error parsing user data", e);
        }
    }
});
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows instantly
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with a slight delay (handled by CSS transition)
    // We use animate to make it smoother than direct style updates
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Add hover effect for links
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});
const magnets = document.querySelectorAll('.btn');

magnets.forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
        const position = magnet.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;

        // Move the button slightly towards the mouse (Power: 0.3)
        magnet.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        // Add a luxury transition
        magnet.style.transition = "transform 0s";
    });

    magnet.addEventListener('mouseleave', () => {
        // Snap back to center
        magnet.style.transform = "translate(0px, 0px)";
        magnet.style.transition = "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
    });
});
/* --- HACKER TEXT EFFECT --- */
const letters = "0123456789";

function enableHackerEffect(element) {
    element.addEventListener("mouseover", event => {
        let iteration = 0;

        clearInterval(event.target.interval);

        event.target.interval = setInterval(() => {
            event.target.innerText = event.target.innerText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return event.target.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 10)];
                })
                .join("");

            if (iteration >= event.target.dataset.value.length) {
                clearInterval(event.target.interval);
            }

            iteration += 1 / 3; // Controls the speed (higher = faster)
        }, 30);
    });
}