let appStateRef = null;

export function setI18nState(appState) {
    appStateRef = appState;
}

export function getDictionary() {
    const currentLanguage = appStateRef?.language || "fr";
    return window.IstwaTranslations[currentLanguage] || window.IstwaTranslations.fr;
}

export function t(key) {
    return getDictionary()[key] || key;
}

export function getLocalizedValue(entry) {
    if (entry === null || entry === undefined) {
        return "";
    }

    if (typeof entry === "string" || typeof entry === "number") {
        return String(entry);
    }

    if (Array.isArray(entry)) {
        return entry;
    }

    return entry[appStateRef?.language] || entry.fr || Object.values(entry)[0] || "";
}
