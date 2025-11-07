// js/session.js

document.addEventListener("DOMContentLoaded", () => {
    // Find the login and cart buttons
    const loginButton = document.getElementById("login-button");
    const cartButton = document.getElementById("cart-button");

    // Check for the auth token in localStorage
    const token = localStorage.getItem('authToken');

    if (token) {
        // --- User is LOGGED IN ---

        // 1. Create an "Account" link
        const accountLink = document.createElement("li");
        accountLink.innerHTML = `<a href="account.html">My Account</a>`;

        // 2. Create a "Logout" button
        const logoutLink = document.createElement("li");
        const logoutButton = document.createElement("a");
        logoutButton.href = "#";
        logoutButton.textContent = "Logout";
        logoutButton.id = "logout-button";

        logoutButton.addEventListener("click", (e) => {
            e.preventDefault();
            // Clear the token and redirect to home
            localStorage.removeItem('authToken');
            window.location.href = "/";
        });

        logoutLink.appendChild(logoutButton);

        // 3. Replace the "Login" button with "Account" and "Logout"
        // We find the 'nav ul' and insert these before the cart
        const navUl = loginButton.closest("nav ul");
        navUl.insertBefore(accountLink, cartButton.parentElement);
        navUl.insertBefore(logoutLink, cartButton.parentElement);

        // 4. Remove the original "Login" button
        loginButton.parentElement.remove();

    } else {
        // --- User is LOGGED OUT ---
        // The page is already correct, but we'll
        // set the login button's href just in case.
        loginButton.href = "login.html";
    }
});