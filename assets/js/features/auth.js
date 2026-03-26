import { t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

const authPanelState = {
    isOpen: false,
    mode: "login",
    errorMessage: "",
    loginIdentifier: "",
    registerEmail: "",
    registerUsername: "",
    registerDisplayName: ""
};

export function openAuthPanel(mode = "login") {
    authPanelState.isOpen = true;
    authPanelState.mode = normalizeMode(mode);
    authPanelState.errorMessage = "";
}

export function closeAuthPanel() {
    authPanelState.isOpen = false;
    authPanelState.errorMessage = "";
}

export function isAuthPanelOpen() {
    return authPanelState.isOpen;
}

export function setAuthPanelMode(mode) {
    authPanelState.mode = normalizeMode(mode);
    authPanelState.errorMessage = "";
}

export function setAuthPanelError(message) {
    authPanelState.errorMessage = message ? String(message) : "";
}

export function setAuthPanelValues(mode, values) {
    if (normalizeMode(mode) === "login") {
        authPanelState.loginIdentifier = String(values.identifier || "");
        return;
    }

    authPanelState.registerEmail = String(values.email || "");
    authPanelState.registerUsername = String(values.username || "");
    authPanelState.registerDisplayName = String(values.display_name || "");
}

export function renderAuthPanel() {
    const appMain = document.getElementById("app-main");

    if (!appMain) {
        return;
    }

    const existingPanel = document.getElementById("auth-panel");

    if (!authPanelState.isOpen) {
        if (existingPanel) {
            existingPanel.remove();
        }

        return;
    }

    const authPanel = existingPanel || document.createElement("section");

    authPanel.id = "auth-panel";
    authPanel.className = "section-panel";
    authPanel.setAttribute("aria-live", "polite");
    authPanel.innerHTML = renderPanelContent();

    if (!existingPanel) {
        appMain.prepend(authPanel);
    }
}

function renderPanelContent() {
    const isLoginMode = authPanelState.mode === "login";
    const title = isLoginMode ? t("auth_login") : t("auth_register");
    const errorBlock = authPanelState.errorMessage === ""
        ? ""
        : `<p class="section-intro" role="alert">${escapeHtml(authPanelState.errorMessage)}</p>`;

    return `
        <div class="section-heading">
            <div>
                <h2 id="auth-panel-heading" class="section-title" tabindex="-1">${escapeHtml(title)}</h2>
            </div>
            <button class="button button-ghost" type="button" data-action="close-auth-panel">
                ${escapeHtml(t("auth_close"))}
            </button>
        </div>

        <div class="button-row">
            <button
                class="button ${isLoginMode ? "button-primary" : "button-ghost"}"
                type="button"
                data-action="switch-auth-mode"
                data-mode="login"
            >
                ${escapeHtml(t("auth_login"))}
            </button>
            <button
                class="button ${isLoginMode ? "button-ghost" : "button-primary"}"
                type="button"
                data-action="switch-auth-mode"
                data-mode="register"
            >
                ${escapeHtml(t("auth_register"))}
            </button>
        </div>

        ${errorBlock}

        ${isLoginMode ? renderLoginForm() : renderRegisterForm()}
    `;
}

function renderLoginForm() {
    return `
        <form data-auth-form="login">
            <p>
                <label>
                    ${escapeHtml(t("auth_identifier_label"))}<br>
                    <input
                        type="text"
                        name="identifier"
                        value="${escapeHtml(authPanelState.loginIdentifier)}"
                        autocomplete="username"
                        required
                    >
                </label>
            </p>
            <p>
                <label>
                    ${escapeHtml(t("auth_password_label"))}<br>
                    <input
                        type="password"
                        name="password"
                        autocomplete="current-password"
                        required
                    >
                </label>
            </p>
            <div class="button-row">
                <button class="button button-primary" type="submit">
                    ${escapeHtml(t("auth_login"))}
                </button>
            </div>
        </form>
    `;
}

function renderRegisterForm() {
    return `
        <form data-auth-form="register">
            <p>
                <label>
                    ${escapeHtml(t("auth_email_label"))}<br>
                    <input
                        type="email"
                        name="email"
                        value="${escapeHtml(authPanelState.registerEmail)}"
                        autocomplete="email"
                        required
                    >
                </label>
            </p>
            <p>
                <label>
                    ${escapeHtml(t("auth_username_label"))}<br>
                    <input
                        type="text"
                        name="username"
                        value="${escapeHtml(authPanelState.registerUsername)}"
                        autocomplete="username"
                        required
                    >
                </label>
            </p>
            <p>
                <label>
                    ${escapeHtml(t("auth_display_name_label"))}<br>
                    <input
                        type="text"
                        name="display_name"
                        value="${escapeHtml(authPanelState.registerDisplayName)}"
                        autocomplete="name"
                        required
                    >
                </label>
            </p>
            <p>
                <label>
                    ${escapeHtml(t("auth_password_label"))}<br>
                    <input
                        type="password"
                        name="password"
                        autocomplete="new-password"
                        required
                    >
                </label>
            </p>
            <div class="button-row">
                <button class="button button-primary" type="submit">
                    ${escapeHtml(t("auth_register"))}
                </button>
            </div>
        </form>
    `;
}

function normalizeMode(mode) {
    return mode === "register" ? "register" : "login";
}
