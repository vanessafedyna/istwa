import { fetchAdminQuizAttempts, fetchAdminUsers, fetchCurrentUser, fetchQuizAttempts, loginUser, logoutUser, registerUser, saveQuizAttempt } from "./core/api.js";
import { getQuizItems } from "./core/content.js";
import { setI18nState } from "./core/i18n.js";
import {
    appState,
    loadSavedPreferences,
    savePreferences,
    SECTION_NAMES,
    setAdminQuizAttempts,
    setAdminUsers,
    setCurrentUserState,
    setSelectedUserFilter,
    setQuizAttempts
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
    await initializeQuizAttempts();
    await initializeAdminUsers();
    await initializeAdminQuizAttempts();
    bindEvents();
    renderApp();
}

async function initializeCurrentUser() {
    try {
        const authState = await fetchCurrentUser();
        setCurrentUserState(authState);
    } catch (error) {
        console.error("Unable to load current user.", error);
        setCurrentUserState({
            authenticated: false,
            user: null,
            role_code: "guest"
        });
    }
}

async function initializeQuizAttempts() {
    if (appState.authenticated !== true) {
        setQuizAttempts([]);
        return;
    }

    try {
        const attempts = await fetchQuizAttempts();
        setQuizAttempts(attempts);
    } catch (error) {
        console.error("Unable to load quiz attempts.", error);
        setQuizAttempts([]);
    }
}

async function initializeAdminUsers() {
    if (!canAccessAdminDashboard()) {
        setAdminUsers([]);
        return;
    }

    try {
        const users = await fetchAdminUsers();
        setAdminUsers(users);
    } catch (error) {
        console.error("Unable to load admin users.", error);
        setAdminUsers([]);
    }
}

async function initializeAdminQuizAttempts() {
    if (!canAccessAdminDashboard()) {
        setAdminQuizAttempts([]);
        return;
    }

    try {
        const attempts = await fetchAdminQuizAttempts();
        setAdminQuizAttempts(attempts);
    } catch (error) {
        console.error("Unable to load admin quiz attempts.", error);
        setAdminQuizAttempts([]);
    }
}

function bindEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("change", handleChange);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("submit", handleSubmit);
}

function handleClick(event) {
    const trigger = event.target.closest("[data-action]");

    if (!trigger) {
        return;
    }

    const action = trigger.dataset.action;

    if (action === "change-section") {
        if (trigger.dataset.resetQuiz === "true") {
            resetQuiz(false);
        }
        setSection(trigger.dataset.section);
        return;
    }

    if (action === "filter-timeline") {
        setTimelineFilter(trigger.dataset.period || "all");
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
        void handleLogout();
        return;
    }

    if (action === "open-login") {
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
        setLanguage(event.target.value);
        return;
    }

    if (event.target.id === "admin-user-filter") {
        setSelectedUserFilter(String(event.target.value || "all"));
        renderApp();
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
    appState.selectedHeroId = null;
    resetQuiz(false);
    savePreferences();
    renderApp();
}

function ensureAccessibleSection() {
    if (appState.section === "admin" && !canAccessAdminDashboard()) {
        appState.section = "home";
        savePreferences();
    }
}

function setSection(section) {
    if (!SECTION_NAMES.includes(section)) {
        return;
    }

    if (section === "admin" && !canAccessAdminDashboard()) {
        return;
    }

    appState.section = section;

    if (section !== "heroes") {
        appState.selectedHeroId = null;
    }

    savePreferences();
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
    announceSectionChange();
    focusActiveSectionHeading();
}

function setTimelineFilter(period) {
    appState.timelineFilter = period || "all";
    renderTimeline();
}

function openHero(heroId) {
    appState.lastHeroTriggerId = heroId;
    appState.selectedHeroId = heroId;
    renderHeroes();
    announceHeroOpen();
    focusHeroDetailHeading();
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
    appState.quizAttemptSaveStarted = false;

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
    renderTimeline();
    renderHeroes();
    renderQuiz();
    renderAdmin();
    renderAuthPanel();
    updateVisibleSection();
    document.documentElement.lang = appState.language;
}

async function handleLogout() {
    try {
        await logoutUser();
        setCurrentUserState({
            authenticated: false,
            user: null,
            role_code: "guest"
        });
        setSelectedUserFilter("all");
        setAdminQuizAttempts([]);
        setAdminUsers([]);
        setQuizAttempts([]);
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
        const authState = await loginUser(identifier, password);
        setCurrentUserState(normalizeAuthenticatedState(authState));
        await initializeQuizAttempts();
        await initializeAdminUsers();
        await initializeAdminQuizAttempts();
        closeAuthPanel();
        renderApp();
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
        username: String(formData.get("username") || ""),
        display_name: String(formData.get("display_name") || ""),
        password: String(formData.get("password") || "")
    };

    setAuthPanelValues("register", payload);
    setAuthPanelError("");

    try {
        const authState = await registerUser(payload);
        setCurrentUserState(normalizeAuthenticatedState(authState));
        await initializeQuizAttempts();
        await initializeAdminUsers();
        await initializeAdminQuizAttempts();
        closeAuthPanel();
        renderApp();
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

function saveCompletedQuizAttempt(questions) {
    if (appState.quizAttemptSaveStarted) {
        return;
    }

    appState.quizAttemptSaveStarted = true;

    const payload = {
        score: appState.quizScore,
        total_questions: totalQuestionsFromQuestions(questions),
        answers_json: appState.quizAnswers,
        language: appState.language,
        completed_at: new Date().toISOString(),
        quiz_key: "main_quiz"
    };

    saveQuizAttempt(payload)
        .then(() => initializeQuizAttempts())
        .then(() => renderApp())
        .catch((error) => {
            console.error("Unable to save quiz attempt.", error);
        });
}
