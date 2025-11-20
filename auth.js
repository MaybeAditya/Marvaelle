document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-button");
    const loginModal = document.getElementById("login-modal");
    const closeButton = document.getElementById("login-close-button");

    let googleButtonRendered = false;
    let googleInitialized = false;

    // --- 1. CHECK LOGIN STATE ---
    checkLoginState();

    function checkLoginState() {
        const token = localStorage.getItem('authToken');
        if (token && loginButton) {
            loginButton.textContent = "Account";
        } else if (loginButton) {
            loginButton.textContent = "Login";
        }
    }

    // --- 2. INITIALIZE GOOGLE ---
    function initializeGoogleAuth() {
        if (typeof google === 'undefined') {
            console.log('Google library not loaded yet');
            return false;
        }

        try {
            google.accounts.id.initialize({
                client_id: "284150378430-gr7ap6qofsmqk1jr9nak3vbea7ts5g68.apps.googleusercontent.com",
                callback: handleGoogleCredentialResponse,
                auto_select: false
            });
            googleInitialized = true;
            console.log('Google Auth initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Google Auth:', error);
            return false;
        }
    }

    // Wait for Google library to load
    window.handleGoogleLoad = function () {
        console.log('Google library loaded');
        initializeGoogleAuth();
    };

    // Fallback: check every 500ms for Google library
    const googleCheckInterval = setInterval(() => {
        if (typeof google !== 'undefined') {
            clearInterval(googleCheckInterval);
            initializeGoogleAuth();
        }
    }, 500);

    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(googleCheckInterval);
        if (!googleInitialized) {
            console.warn('Google library failed to load within 5 seconds');
        }
    }, 5000);

    // --- 3. HANDLE LOGIN ---
    async function handleGoogleCredentialResponse(response) {
        console.log('Google credential received');
        try {
            const res = await fetch("/.netlify/functions/google-auth", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            localStorage.setItem('authToken', data.token);
            loginModal.style.display = "none";
            checkLoginState();

            // Show Toast
            const toast = document.createElement("div");
            toast.className = "toast show";
            toast.textContent = `Welcome back, ${data.name}`;
            document.getElementById("toast-container").appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

        } catch (error) {
            console.error('Login error:', error);
            alert("Login failed. Please try again.");
        }
    }

    // --- 4. RENDER GOOGLE BUTTON ---
    function renderGoogleButton() {
        if (!googleInitialized) {
            console.log('Google not initialized, cannot render button');
            // Try to initialize now if Google library is available
            if (typeof google !== 'undefined') {
                if (initializeGoogleAuth()) {
                    return actuallyRenderButton();
                }
            }

            // Show loading state
            const container = document.getElementById("google_btn_container");
            if (container) {
                container.innerHTML = '<div style="padding: 12px; background: #f5f5f5; border-radius: 4px;">Loading Google Sign-In...</div>';
            }
            return false;
        }
        return actuallyRenderButton();
    }

    function actuallyRenderButton() {
        try {
            const container = document.getElementById("google_btn_container");
            if (!container) {
                console.error('Google button container not found');
                return false;
            }

            // Clear container first
            container.innerHTML = '';

            google.accounts.id.renderButton(
                container,
                {
                    theme: "filled_black",
                    size: "large",
                    shape: "rectangular",
                    width: "300",
                    text: "signin_with",
                    logo_alignment: "center"
                }
            );

            googleButtonRendered = true;
            console.log('Google button rendered successfully');
            return true;
        } catch (error) {
            console.error('Failed to render Google button:', error);
            return false;
        }
    }

    // --- 5. MODAL HANDLING ---
    if (loginButton) {
        loginButton.addEventListener("click", (e) => {
            e.preventDefault();
            const token = localStorage.getItem('authToken');

            if (token) {
                if (confirm("Log out?")) {
                    localStorage.removeItem('authToken');
                    checkLoginState();
                }
            } else {
                // Open the modal
                console.log('Opening login modal');
                loginModal.style.display = "block";

                // Try to render Google button
                if (!googleButtonRendered) {
                    const success = renderGoogleButton();
                    if (!success) {
                        // Set up a retry mechanism
                        const retryInterval = setInterval(() => {
                            if (googleInitialized && !googleButtonRendered) {
                                clearInterval(retryInterval);
                                renderGoogleButton();
                            }
                        }, 200);

                        // Clear after 3 seconds
                        setTimeout(() => clearInterval(retryInterval), 3000);
                    }
                }
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    });
});