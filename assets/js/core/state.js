export const appState = {
    language: "fr",
    section: "home",
    authenticated: false,
    currentUser: null,
    roleCode: "guest",
    timelineFilter: "all",
    diasporaFilter: "all",
    selectedHeroId: null,
    lastHeroTriggerId: null,
    quizCurrentIndex: 0,
    quizScore: 0,
    quizSelectedAnswer: null,
    quizFinished: false,
    quizAnswers: [],
    missionNotes: {},
    moduleProgress: [],
    organismeDashboard: null
};

export const SECTION_NAMES = [
    "home",
    "onboarding",
    "dashboard",
    "experience",
    "map",
    "missions",
    "profile",
    "timeline",
    "heroes",
    "quiz",
    "konnen-rasin-ou",
    "diaspora",
    "admin"
];

export function loadSavedPreferences() {
    try {
        const savedLanguage = window.localStorage.getItem("istwa-language");
        const savedSection = window.localStorage.getItem("istwa-section");

        if (savedLanguage && window.IstwaTranslations[savedLanguage]) {
            appState.language = savedLanguage;
        }

        if (savedSection && SECTION_NAMES.includes(savedSection)) {
            appState.section = savedSection;
        }
    } catch (error) {
        console.warn("Unable to access localStorage.", error);
    }
}

export function savePreferences() {
    try {
        window.localStorage.setItem("istwa-language", appState.language);
        window.localStorage.setItem("istwa-section", appState.section);
    } catch (error) {
        console.warn("Unable to save preferences.", error);
    }
}

export function setCurrentUserState(authState) {
    appState.authenticated = authState?.authenticated === true;
    appState.currentUser = appState.authenticated ? authState.user ?? null : null;
    appState.roleCode = typeof authState?.role_code === "string" && authState.role_code !== ""
        ? authState.role_code
        : "guest";
}
