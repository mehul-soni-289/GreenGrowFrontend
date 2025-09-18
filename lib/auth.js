// Converted from TypeScript: interfaces removed

const API_BASE_URL = "http://localhost:8000/api";

// Check if user is authenticated
export async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in request
    });

    const data = await response.json();



    if (data.is_authenticated) {
      return { isAuthenticated: true, user: data.user };
    } else {
  
      return { isAuthenticated: false };
    }
  } catch (error) {
    console.error("Auth status check failed:", error);
    return { isAuthenticated: false };
  }
}

// Login user
export async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in request
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data.user };
    } else {
      console.log("Login failed:", data.message || "Login failed");
      return { success: false, message: data.message || "Login failed" };
    }
  } catch (error) {
    console.error("Login failed:", error);
    console.log("Network error occurred during login:", error);

    return { success: false, message: "Network error occurred" };
  }
}

// Register user
export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies in request
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message || "Registration failed" };
    }
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, message: "Network error occurred" };
  }
}

// Logout user
export async function logoutUser() {
  try {
    // Call logout API to clear server-side session
    await fetch(`${API_BASE_URL}/logout/`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    // Clear all cookies by setting them to expire in the past
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to home page to ensure clean state
    window.location.replace("/");
  }
}
