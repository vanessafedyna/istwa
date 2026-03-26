import { SECTION_NAMES, appState } from "../core/state.js";
import { t } from "../core/i18n.js";
import { announce, getActiveSectionHeading } from "../core/ui.js";
import { canAccessAdminDashboard } from "./admin.js";

export function renderNavigation() {
    const languageSelect = document.getElementById("language-select");
    const navigationMap = {
        home: t("nav_home"),
        timeline: t("nav_timeline"),
        heroes: t("nav_heroes"),
        quiz: t("nav_quiz"),
        admin: t("nav_admin")
    };

    document.title = t("app_title");
    document.getElementById("brand-kicker").textContent = t("app_tagline");
    document.getElementById("brand-title").textContent = t("app_title");
    document.getElementById("language-label").textContent = t("language_label");
    document.getElementById("footer-quote").textContent = t("footer_quote");
    renderAuthControls();

    Object.entries(navigationMap).forEach(([section, label]) => {
        const navElement = document.getElementById(`nav-${section}`);

        if (!navElement) {
            return;
        }

        navElement.textContent = label;
        navElement.hidden = section === "admin" && !canAccessAdminDashboard();
        navElement.classList.toggle("is-active", appState.section === section);

        if (appState.section === section) {
            navElement.setAttribute("aria-current", "page");
        } else {
            navElement.removeAttribute("aria-current");
        }
    });

    if (languageSelect) {
        languageSelect.value = appState.language;
    }
}

function renderAuthControls() {
    const authControls = ensureAuthControls();

    if (!authControls) {
        return;
    }

    authControls.replaceChildren();

    if (appState.authenticated && appState.currentUser) {
        const userName = appState.currentUser.display_name || appState.currentUser.username || t("auth_account");
        const userLabel = document.createElement("span");
        const logoutButton = document.createElement("button");

        userLabel.className = "language-label";
        userLabel.textContent = userName;

        logoutButton.type = "button";
        logoutButton.className = "nav-link";
        logoutButton.dataset.action = "logout-user";
        logoutButton.textContent = t("auth_logout");

        authControls.append(userLabel, logoutButton);
        return;
    }

    const loginButton = document.createElement("button");

    loginButton.type = "button";
    loginButton.className = "nav-link";
    loginButton.dataset.action = "open-login";
    loginButton.textContent = t("auth_login");

    authControls.append(loginButton);
}

function ensureAuthControls() {
    const headerControls = document.querySelector(".header-controls");

    if (!headerControls) {
        return null;
    }

    let authControls = document.getElementById("auth-controls");

    if (authControls) {
        return authControls;
    }

    authControls = document.createElement("div");
    authControls.id = "auth-controls";
    authControls.className = "language-switcher";

    const languageSwitcher = headerControls.querySelector(".language-switcher");

    if (languageSwitcher) {
        headerControls.insertBefore(authControls, languageSwitcher);
    } else {
        headerControls.append(authControls);
    }

    return authControls;
}

export function updateVisibleSection() {
    SECTION_NAMES.forEach((sectionName) => {
        const sectionElement = document.getElementById(`${sectionName}-section`);

        if (!sectionElement) {
            return;
        }

        sectionElement.classList.toggle("is-active", appState.section === sectionName);

        if (appState.section === sectionName) {
            sectionElement.removeAttribute("hidden");
        } else {
            sectionElement.setAttribute("hidden", "");
        }
    });
}

export function announceSectionChange() {
    const heading = getActiveSectionHeading();

    if (heading) {
        announce(heading.textContent.trim());
    }
}
