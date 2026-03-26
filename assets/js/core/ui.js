let appStateRef = null;

export function setUiState(appState) {
    appStateRef = appState;
}

export function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function announce(message) {
    const announcer = document.getElementById("sr-announcer");

    if (!announcer || !message) {
        return;
    }

    announcer.textContent = "";

    window.setTimeout(() => {
        announcer.textContent = message;
    }, 20);
}

export function focusElement(element) {
    if (!element) {
        return;
    }

    window.requestAnimationFrame(() => {
        element.focus({ preventScroll: true });
    });
}

export function getActiveSectionHeading() {
    const activeSection = document.getElementById(`${appStateRef?.section}-section`);

    if (!activeSection) {
        return null;
    }

    return activeSection.querySelector("h1, h2, h3");
}

export function focusActiveSectionHeading() {
    focusElement(getActiveSectionHeading());
}

export function focusHeroDetailHeading() {
    focusElement(document.getElementById("hero-detail-heading"));
}

export function focusHeroListReturnTarget(heroId) {
    const heroesSection = document.getElementById("heroes-section");
    const targetHeroId = heroId || appStateRef?.lastHeroTriggerId;
    const previousHeroButton = heroesSection && targetHeroId
        ? heroesSection.querySelector(`[data-action="open-hero"][data-hero-id="${cssEscape(targetHeroId)}"]`)
        : null;

    focusElement(previousHeroButton || document.getElementById("heroes-heading"));
}

export function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
        return window.CSS.escape(value);
    }

    return String(value).replace(/["\\]/g, "\\$&");
}
