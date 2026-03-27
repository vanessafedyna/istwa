import {
    fetchCurrentUser,
    fetchModuleProgress,
    loginUser,
    logoutUser,
    registerUser,
    saveQuizAttempt,
    trackUserActivity
} from "./core/api.js";
import { getQuizItems, getHeroes } from "./core/content.js";
import { setI18nState } from "./core/i18n.js";
import {
    appState,
    loadSavedPreferences,
    savePreferences,
    SECTION_NAMES,
    setCurrentUserState,
} from "./core/state.js";
import {
    announce,
    focusActiveSectionHeading,
    focusHeroDetailHeading,
    focusHeroListReturnTarget,
    focusElement,
    setUiState
} from "./core/ui.js";
import {
    closeAuthPanel,
    isAuthPanelOpen,
    openAuthPanel,
    renderAuthPanel,
    setAuthPanelError,
    setAuthPanelMode,
    setAuthPanelValues
} from "./features/auth.js";
import {
    announceSectionChange,
    renderNavigation,
    updateVisibleSection
} from "./features/navigation.js";
import { canAccessAdminDashboard, renderAdmin } from "./features/admin.js";
import { renderHome } from "./features/home.js";
import { handleOnboardingAction, renderOnboarding } from "./features/onboarding.js";
import { renderDashboard } from "./features/dashboard.js";
import { renderExperience } from "./features/experience.js";
import { renderMap } from "./features/map.js";
import { openMissionById, renderMissions } from "./features/missions.js";
import { renderProfile } from "./features/profile.js";
import {
    announceHeroListReturn,
    announceHeroOpen,
    renderHeroes
} from "./features/heroes.js";
import {
    getQuizResultAnnouncement,
    renderQuiz,
    totalQuestionsFromQuestions
} from "./features/quiz.js";
import { renderTimeline } from "./features/timeline.js";
import { renderDiaspora } from "./features/diaspora.js";
import { renderKonnenRasinOu, setModuleProgress } from "./features/konnen-rasin-ou.js";
import { generateHeroQuoteImage } from "./features/share.js";

let quizAttemptSaveStarted = false;

setI18nState(appState);
setUiState(appState);

document.addEventListener("DOMContentLoaded", () => {
    initializeApp().catch((error) => {
        console.error("Unable to initialize app.", error);
        renderApp();
    });
});

async function initializeApp() {
    loadSavedPreferences();
    await initializeCurrentUser();
    ensureAccessibleSection();
    await initializeModuleProgress();
    bindEvents();
    renderApp();
}

async function initializeCurrentUser() {
    try {
        const authState = await fetchCurrentUser();
        setCurrentUserState(authState);
    } catch (error) {
        console.error("Unable to load current user.", error);
        setGuestUserState();
    }
}

async function initializeModuleProgress() {
    if (appState.authenticated !== true) {
        setModuleProgress([]);
        return;
    }

    try {
        const progress = await fetchModuleProgress();
        setModuleProgress(progress);
    } catch (error) {
        console.error("Unable to load module progress.", error);
        setModuleProgress([]);
    }
}

function bindEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("change", handleChange);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("submit", handleSubmit);
}

function handleClick(event) {
    if (isMobileNavigationOpen()) {
        const clickedInsideMobilePanel = event.target.closest("#mobile-menu-panel");
        const clickedMobileToggle = event.target.closest("#mobile-menu-toggle");

        if (!clickedInsideMobilePanel && !clickedMobileToggle) {
            closeMobileNavigation();
        }
    }

    const trigger = event.target.closest("[data-action]");

    if (!trigger) {
        return;
    }

    const action = trigger.dataset.action;

    if (action === "toggle-mobile-nav") {
        toggleMobileNavigation();
        return;
    }

    if (action === "change-section") {
        handleSectionChangeAction(trigger);
        return;
    }

    if (action === "profile-open-mission") {
        closeExplorerNavigation();
        closeMobileNavigation();

        if (openMissionById(String(trigger.dataset.missionId || ""))) {
            setSection("missions");
        }

        return;
    }

    if (action.startsWith("onboarding-")) {
        handleOnboardingAction(action, trigger);
        return;
    }

    if (action === "filter-timeline") {
        setTimelineFilter(trigger.dataset.period || "all");
        return;
    }

    if (action === "filter-diaspora") {
        setDiasporaFilter(trigger.dataset.location || "all");
        return;
    }

    if (action === "share-hero-quote") {
        const heroId = trigger.dataset.heroId;
        const hero = getHeroes().find((h) => h.id === heroId);
        if (hero) {
            generateHeroQuoteImage(hero, appState.language);
        }
        return;
    }

    if (action === "open-hero") {
        openHero(trigger.dataset.heroId);
        return;
    }

    if (action === "close-hero") {
        closeHero();
        return;
    }

    if (action === "answer-quiz") {
        answerQuiz(Number(trigger.dataset.choiceIndex));
        return;
    }

    if (action === "logout-user") {
        closeMobileNavigation();
        void handleLogout();
        return;
    }

    if (action === "open-login") {
        closeMobileNavigation();
        openAuthPanel("login");
        renderApp();
        focusElement(document.getElementById("auth-panel-heading"));
        return;
    }

    if (action === "switch-auth-mode") {
        setAuthPanelMode(trigger.dataset.mode);
        renderApp();
        focusElement(document.getElementById("auth-panel-heading"));
        return;
    }

    if (action === "close-auth-panel") {
        closeAuthPanel();
        renderApp();
        return;
    }

    if (action === "next-question") {
        goToNextQuestion();
        return;
    }

    if (action === "restart-quiz") {
        resetQuiz();
    }
}

function handleChange(event) {
    if (event.target.id === "language-select") {
        closeMobileNavigation();
        setLanguage(event.target.value);
    }
}

function handleSubmit(event) {
    const form = event.target;

    if (!(form instanceof HTMLFormElement)) {
        return;
    }

    if (form.dataset.authForm === "login") {
        event.preventDefault();
        void submitLoginForm(form);
        return;
    }

    if (form.dataset.authForm === "register") {
        event.preventDefault();
        void submitRegisterForm(form);
    }
}

function handleKeydown(event) {
    if (event.key === "Escape" && isAuthPanelOpen()) {
        event.preventDefault();
        closeAuthPanel();
        renderApp();
        return;
    }

    if (event.key === "Escape" && isMobileNavigationOpen()) {
        event.preventDefault();
        closeMobileNavigation();
        return;
    }

    if (event.key === "Escape" && appState.section === "heroes" && appState.selectedHeroId !== null) {
        event.preventDefault();
        closeHero();
    }
}

function setLanguage(language) {
    if (!window.IstwaTranslations || !window.IstwaTranslations[language]) {
        return;
    }

    appState.language = language;
    appState.timelineFilter = "all";
    appState.diasporaFilter = "all";
    appState.selectedHeroId = null;
    resetQuiz(false);
    savePreferences();
    renderApp();
}

function ensureAccessibleSection() {
    if (!canAccessSection(appState.section)) {
        appState.section = "home";
        savePreferences();
    }
}

function setSection(section) {
    if (!canAccessSection(section)) {
        return;
    }

    appState.section = section;
    resetSectionState(section);

    savePreferences();
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
    announceSectionChange();
    focusActiveSectionHeading();
}

function handleSectionChangeAction(trigger) {
    closeExplorerNavigation();
    closeMobileNavigation();

    if (trigger.dataset.resetQuiz === "true") {
        resetQuiz(false);
    }

    setSection(trigger.dataset.section);
}

function canAccessSection(section) {
    if (!SECTION_NAMES.includes(section)) {
        return false;
    }

    if (section === "admin" && !canAccessAdminDashboard()) {
        return false;
    }

    return true;
}

function resetSectionState(section) {
    if (section !== "heroes") {
        appState.selectedHeroId = null;
    }
}

function closeExplorerNavigation() {
    const explorer = document.getElementById("nav-explorer");

    if (explorer instanceof HTMLDetailsElement) {
        explorer.open = false;
    }
}

function toggleMobileNavigation() {
    setMobileNavigationState(!isMobileNavigationOpen());
}

function closeMobileNavigation() {
    setMobileNavigationState(false);
}

function isMobileNavigationOpen() {
    return document.querySelector(".site-header")?.classList.contains("is-mobile-nav-open") === true;
}

function setMobileNavigationState(isOpen) {
    const siteHeader = document.querySelector(".site-header");
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");

    if (!siteHeader || !mobileMenuToggle) {
        return;
    }

    siteHeader.classList.toggle("is-mobile-nav-open", isOpen);
    document.body.classList.toggle("has-mobile-nav-open", isOpen);
    mobileMenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mobileMenuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
}

function setTimelineFilter(period) {
    appState.timelineFilter = period || "all";
    renderTimeline();
    void trackActivityForAuthenticatedUser("timeline_period_view", appState.timelineFilter);
}

function setDiasporaFilter(location) {
    appState.diasporaFilter = location || "all";
    renderDiaspora();
}

function openHero(heroId) {
    appState.lastHeroTriggerId = heroId;
    appState.selectedHeroId = heroId;
    renderHeroes();
    announceHeroOpen();
    focusHeroDetailHeading();
    void trackActivityForAuthenticatedUser("hero_view", String(heroId || ""));
}

function closeHero() {
    const closedHeroId = appState.selectedHeroId;
    appState.selectedHeroId = null;
    renderHeroes();
    announceHeroListReturn();
    focusHeroListReturnTarget(closedHeroId);
}

function resetQuiz(shouldRender = true) {
    appState.quizCurrentIndex = 0;
    appState.quizScore = 0;
    appState.quizSelectedAnswer = null;
    appState.quizFinished = false;
    appState.quizAnswers = [];
    quizAttemptSaveStarted = false;

    if (shouldRender) {
        renderQuiz();
    }
}

function answerQuiz(choiceIndex) {
    if (appState.quizSelectedAnswer !== null || appState.quizFinished) {
        return;
    }

    const questions = getQuizItems();
    const currentQuestion = questions[appState.quizCurrentIndex];

    if (!currentQuestion) {
        return;
    }

    appState.quizSelectedAnswer = choiceIndex;

    appState.quizAnswers[appState.quizCurrentIndex] = {
        question_index: appState.quizCurrentIndex,
        selected_answer: choiceIndex,
        correct_answer: currentQuestion.answer,
        is_correct: choiceIndex === currentQuestion.answer
    };

    if (choiceIndex === currentQuestion.answer) {
        appState.quizScore += 1;
    }

    renderQuiz();
}

function goToNextQuestion() {
    const questions = getQuizItems();

    if (appState.quizCurrentIndex >= questions.length - 1) {
        appState.quizFinished = true;
        renderQuiz();
        saveCompletedQuizAttempt(questions);
        announce(getQuizResultAnnouncement(totalQuestionsFromQuestions(questions)));
        focusActiveSectionHeading();
        return;
    }

    appState.quizCurrentIndex += 1;
    appState.quizSelectedAnswer = null;
    renderQuiz();
}

function renderApp() {
    ensureAccessibleSection();
    renderNavigation();
    renderHome();
    renderOnboarding();
    renderDashboard();
    renderExperience();
    renderMap();
    renderMissions();
    renderProfile();
    renderTimeline();
    renderHeroes();
    renderKonnenRasinOu();
    renderDiaspora();
    renderQuiz();
    renderAdmin();
    renderAuthPanel();
    updateVisibleSection();
    document.documentElement.lang = appState.language;
}

async function handleLogout() {
    try {
        await logoutUser();
        setGuestUserState();
        setModuleProgress([]);
        renderApp();
        announce("Vous etes deconnecte.");
    } catch (error) {
        console.error("Unable to logout user.", error);
        announce("La deconnexion a echoue.");
    }
}

async function submitLoginForm(form) {
    const formData = new FormData(form);
    const identifier = String(formData.get("identifier") || "");
    const password = String(formData.get("password") || "");

    setAuthPanelValues("login", { identifier });
    setAuthPanelError("");

    try {
        await applyAuthenticatedSession(loginUser(identifier, password));
        announce("Connexion reussie.");
    } catch (error) {
        setAuthPanelError(error instanceof Error ? error.message : "Connexion impossible.");
        renderApp();
        focusElement(document.getElementById("auth-panel-heading"));
    }
}

async function submitRegisterForm(form) {
    const formData = new FormData(form);
    const payload = {
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
        join_code: String(formData.get("join_code") || "")
    };

    setAuthPanelValues("register", payload);
    setAuthPanelError("");

    try {
        await applyAuthenticatedSession(registerUser(payload));
        announce("Inscription reussie.");
    } catch (error) {
        setAuthPanelError(error instanceof Error ? error.message : "Inscription impossible.");
        renderApp();
        focusElement(document.getElementById("auth-panel-heading"));
    }
}

function normalizeAuthenticatedState(authState) {
    return {
        ...authState,
        role_code: authState?.role_code || authState?.user?.role?.code || "guest"
    };
}

function setGuestUserState() {
    setCurrentUserState({
        authenticated: false,
        user: null,
        role_code: "guest"
    });
}

async function applyAuthenticatedSession(authStatePromise) {
    const authState = await authStatePromise;

    setCurrentUserState(normalizeAuthenticatedState(authState));
    await initializeModuleProgress();
    closeAuthPanel();
    renderApp();
}

function saveCompletedQuizAttempt(questions) {
    if (appState.authenticated !== true) {
        return;
    }

    if (quizAttemptSaveStarted) {
        return;
    }

    quizAttemptSaveStarted = true;

    const payload = {
        score: appState.quizScore,
        total_questions: totalQuestionsFromQuestions(questions),
        answers_json: appState.quizAnswers,
        language: appState.language,
        completed_at: new Date().toISOString(),
        quiz_key: "main_quiz"
    };

    saveQuizAttempt(payload)
        .then(() => renderApp())
        .catch((error) => {
            console.error("Unable to save quiz attempt.", error);
            quizAttemptSaveStarted = false;
        });
}

async function trackActivityForAuthenticatedUser(activityType, targetKey) {
    if (appState.authenticated !== true) {
        return;
    }

    if (typeof targetKey !== "string" || targetKey.trim() === "") {
        return;
    }

    try {
        await trackUserActivity({
            activity_type: activityType,
            target_key: targetKey.trim()
        });
    } catch (error) {
        console.warn("Unable to track user activity.", error);
    }
}
