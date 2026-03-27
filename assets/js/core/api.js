export async function saveQuizAttempt(payload) {
    const response = await fetch("./api/quiz-attempts-create.php", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Quiz attempt save failed with status ${response.status}.`);
    }

    return response.json();
}

export async function fetchCurrentUser() {
    const response = await fetch("./api/me.php", {
        credentials: "same-origin"
    });

    if (!response.ok) {
        throw new Error(`Current user fetch failed with status ${response.status}.`);
    }

    const result = await response.json();

    if (!result || typeof result !== "object" || !result.data || typeof result.data !== "object") {
        throw new Error("Current user response is invalid.");
    }

    return result.data;
}

export async function loginUser(identifier, password) {
    const response = await fetch("./api/auth-login.php", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            identifier,
            password
        })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.message || `Login failed with status ${response.status}.`);
    }

    return result.data;
}

export async function registerUser(payload) {
    const response = await fetch("./api/auth-register.php", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.message || `Register failed with status ${response.status}.`);
    }

    return result.data;
}

export async function trackUserActivity(payload) {
    const response = await fetch("./api/activity-track.php", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Activity tracking failed with status ${response.status}.`);
    }

    return response.json();
}

export async function logoutUser() {
    const response = await fetch("./api/auth-logout.php", {
        method: "POST",
        credentials: "same-origin"
    });

    if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}.`);
    }

    return response.json();
}
