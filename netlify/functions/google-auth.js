document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-button");
    const loginModal = document.getElementById("login-modal");
    const closeButton = document.getElementById("login-close-button");
    const googleContainer = document.getElementById("google_btn_container");

    let isGoogleLoaded = false;

    // --- 1. CHECK CURRENT LOGIN STATUS ---
    checkLoginState();

    function checkLoginState() {
        const token = localStorage.getItem('authToken');
        const userName = localStorage.getItem('userName'); // Optional: Store name

        if (token && loginButton) {
            loginButton.textContent = "Account"; // Or `Hi, ${userName}`
            loginButton.href = "#"; // Prevent navigation if logged in
        } else if (loginButton) {
            loginButton.textContent = "Login";
        }
    }

    // --- 2. INITIALIZE GOOGLE (Run this immediately) ---
    function initGoogleAuth() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: "284150378430-gr7ap6qofsmqk1jr9nak3vbea7ts5g68.apps.googleusercontent.com",
                callback: handleGoogleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true
            });
            isGoogleLoaded = true;
            console.log("Google Auth Initialized");
        } else {
            // Retry once after 1 second if script loaded slowly
            setTimeout(initGoogleAuth, 1000);
        }
    }

    // Call init immediately
    initGoogleAuth();

    // --- 3. HANDLE LOGIN CLICK ---
    if (loginButton) {
        loginButton.addEventListener("click", (e) => {
            e.preventDefault();
            const token = localStorage.getItem('authToken');

            if (token) {
                // User is logged in -> Logout Logic
                const shouldLogout = confirm("Are you sure you want to log out?");
                if (shouldLogout) {
                    logoutUser();
                }
            } else {
                // User is logged out -> Open Modal
                openModal();
            }
        });
    }

    // --- 4. OPEN MODAL & RENDER BUTTON ---
    function openModal() {
        if (!loginModal) return;

        // 1. Show the modal first (CSS)
        loginModal.style.display = "block";

        // 2. Render the Google Button ONLY if Google is ready
        if (isGoogleLoaded && googleContainer) {
            // Check if button is already there to avoid duplicates
            if (googleContainer.innerHTML.trim() === "") {
                try {
                    google.accounts.id.renderButton(
                        googleContainer,
                        {
                            theme: "outline",
                            size: "large",
                            width: "300", // Matches your CSS max-width roughly
                            text: "continue_with"
                        }
                    );
                } catch (err) {
                    console.error("Google Button Render Error:", err);
                    googleContainer.innerHTML = "<p style='color:red'>Error loading Google Sign-In</p>";
                }
            }
        } else {
            googleContainer.innerHTML = "<p>Loading login options...</p>";
            // Retry init if it wasn't ready
            initGoogleAuth();
        }
    }

    // --- 5. HANDLE BACKEND RESPONSE ---
    async function handleGoogleCredentialResponse(response) {
        console.log("Token received, sending to backend...");

        try {
            const res = await fetch("/.netlify/functions/google-auth", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Login failed");

            // Success
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userName', data.name);

            loginModal.style.display = "none";
            checkLoginState();
            showToast(`Welcome back, ${data.name}`);

        } catch (error) {
            console.error("Backend Auth Error:", error);
            alert("Authentication failed. Please try again.");
        }
    }

    // --- 6. UTILS (Logout, Close Modal, Toast) ---
    function logoutUser() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        checkLoginState();
        showToast("Logged out successfully");
    }

    // Close Modal Logic
    if (closeButton) {
        closeButton.onclick = () => loginModal.style.display = "none";
    }

    window.onclick = (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    };

    function showToast(message) {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "toast show";
        toast.textContent = message;
        // Basic styling for toast in JS if CSS is missing
        toast.style.cssText = "background:#333; color:#fff; padding:12px 24px; border-radius:4px; margin-top:10px; animation: fadein 0.5s;";

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});