const appState = {
    language: "fr",
    section: "home",
    timelineFilter: "all",
    selectedHeroId: null,
    lastHeroTriggerId: null,
    quizCurrentIndex: 0,
    quizScore: 0,
    quizSelectedAnswer: null,
    quizFinished: false
};

const SECTION_NAMES = ["home", "timeline", "heroes", "quiz"];

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
    loadSavedPreferences();
    bindEvents();
    renderApp();
}

function bindEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("change", handleChange);
    document.addEventListener("keydown", handleKeydown);
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
    }
}

function handleKeydown(event) {
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

function setSection(section) {
    if (!SECTION_NAMES.includes(section)) {
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
        announce(getQuizResultAnnouncement(totalQuestionsFromQuestions(questions)));
        focusActiveSectionHeading();
        return;
    }

    appState.quizCurrentIndex += 1;
    appState.quizSelectedAnswer = null;
    renderQuiz();
}

function loadSavedPreferences() {
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

function savePreferences() {
    try {
        window.localStorage.setItem("istwa-language", appState.language);
        window.localStorage.setItem("istwa-section", appState.section);
    } catch (error) {
        console.warn("Unable to save preferences.", error);
    }
}

function getDictionary() {
    return window.IstwaTranslations[appState.language] || window.IstwaTranslations.fr;
}

function t(key) {
    return getDictionary()[key] || key;
}

function getLocalizedValue(entry) {
    if (entry === null || entry === undefined) {
        return "";
    }

    if (typeof entry === "string" || typeof entry === "number") {
        return String(entry);
    }

    if (Array.isArray(entry)) {
        return entry;
    }

    return entry[appState.language] || entry.fr || Object.values(entry)[0] || "";
}

function getHeroes() {
    return window.IstwaHeroes || [];
}

function getTimelineEvents() {
    return window.IstwaTimeline || [];
}

function getQuizItems() {
    return window.IstwaQuiz || [];
}

function renderApp() {
    renderNavigation();
    renderHome();
    renderTimeline();
    renderHeroes();
    renderQuiz();
    updateVisibleSection();
    document.documentElement.lang = appState.language;
}

function renderNavigation() {
    const languageSelect = document.getElementById("language-select");
    const navigationMap = {
        home: t("nav_home"),
        timeline: t("nav_timeline"),
        heroes: t("nav_heroes"),
        quiz: t("nav_quiz")
    };

    document.title = t("app_title");
    document.getElementById("brand-kicker").textContent = t("app_tagline");
    document.getElementById("brand-title").textContent = t("app_title");
    document.getElementById("language-label").textContent = t("language_label");
    document.getElementById("footer-quote").textContent = t("footer_quote");

    Object.entries(navigationMap).forEach(([section, label]) => {
        const navElement = document.getElementById(`nav-${section}`);

        if (!navElement) {
            return;
        }

        navElement.textContent = label;
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

function updateVisibleSection() {
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

function renderHome() {
    const homeSection = document.getElementById("home-section");

    if (!homeSection) {
        return;
    }

    homeSection.innerHTML = `
        <article class="hero-panel">
            <div class="hero-panel__content">
                <span class="hero-panel__eyebrow">${escapeHtml(t("home_kicker"))}</span>
                <h2 id="home-heading" class="hero-panel__title" tabindex="-1">${escapeHtml(t("home_title"))}</h2>
                <p class="hero-panel__lead">${escapeHtml(t("home_intro"))}</p>

                <div class="button-row">
                    <button class="button button-primary" type="button" data-action="change-section" data-section="timeline">
                        ${escapeHtml(t("home_timeline_button"))}
                    </button>
                    <button class="button button-secondary" type="button" data-action="change-section" data-section="heroes">
                        ${escapeHtml(t("home_heroes_button"))}
                    </button>
                </div>

                <div class="stats-grid">
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(t("stat_one_value"))}</span>
                        <span class="stat-card__label">${escapeHtml(t("stat_one_label"))}</span>
                    </article>
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(t("stat_two_value"))}</span>
                        <span class="stat-card__label">${escapeHtml(t("stat_two_label"))}</span>
                    </article>
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(t("stat_three_value"))}</span>
                        <span class="stat-card__label">${escapeHtml(t("stat_three_label"))}</span>
                    </article>
                </div>
            </div>

            <aside class="hero-panel__aside">
                <div class="hero-panel__quote">${escapeHtml(t("home_quote"))}</div>
                <div class="cta-panel">
                    <h3 class="detail-block__title">${escapeHtml(t("home_focus_title"))}</h3>
                    <p class="section-intro">${escapeHtml(t("home_focus_text"))}</p>
                </div>
            </aside>
        </article>

        <article class="cta-panel">
            <div class="section-heading">
                <div>
                    <h3 class="section-title">${escapeHtml(t("home_cta_title"))}</h3>
                    <p class="section-intro">${escapeHtml(t("home_cta_text"))}</p>
                </div>
            </div>

            <div class="button-row">
                <button
                    class="button button-gold"
                    type="button"
                    data-action="change-section"
                    data-section="quiz"
                    data-reset-quiz="true"
                >
                    ${escapeHtml(t("home_quiz_button"))}
                </button>
                <button class="button button-ghost" type="button" data-action="change-section" data-section="timeline">
                    ${escapeHtml(t("home_more_button"))}
                </button>
            </div>
        </article>
    `;
}

function renderTimeline() {
    const timelineSection = document.getElementById("timeline-section");
    const events = getTimelineEvents();

    if (!timelineSection) {
        return;
    }

    const periods = events.reduce((list, eventItem) => {
        if (list.some((entry) => entry.id === eventItem.period)) {
            return list;
        }

        list.push({
            id: eventItem.period,
            label: getLocalizedValue(eventItem.periodLabel)
        });
        return list;
    }, []);

    const filteredEvents = appState.timelineFilter === "all"
        ? events
        : events.filter((eventItem) => eventItem.period === appState.timelineFilter);

    timelineSection.innerHTML = `
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 id="timeline-heading" class="section-title" tabindex="-1">${escapeHtml(t("timeline_title"))}</h2>
                    <p class="section-intro">${escapeHtml(t("timeline_intro"))}</p>
                </div>
            </div>

            <div class="filter-row">
                <button
                    class="filter-chip ${appState.timelineFilter === "all" ? "is-active" : ""}"
                    type="button"
                    data-action="filter-timeline"
                    data-period="all"
                    aria-pressed="${appState.timelineFilter === "all" ? "true" : "false"}"
                >
                    ${escapeHtml(t("timeline_filter_all"))}
                </button>
                ${periods.map((periodItem) => `
                    <button
                        class="filter-chip ${appState.timelineFilter === periodItem.id ? "is-active" : ""}"
                        type="button"
                        data-action="filter-timeline"
                        data-period="${escapeHtml(periodItem.id)}"
                        aria-pressed="${appState.timelineFilter === periodItem.id ? "true" : "false"}"
                    >
                        ${escapeHtml(periodItem.label)}
                    </button>
                `).join("")}
            </div>

            <div class="timeline-list">
                ${filteredEvents.length > 0 ? filteredEvents.map((eventItem) => `
                    <article class="timeline-card" style="--timeline-color: ${escapeHtml(eventItem.color)};">
                        <div class="timeline-card__meta">
                            <span class="timeline-card__year">${escapeHtml(String(eventItem.year))}</span>
                            <span class="timeline-card__period">${escapeHtml(getLocalizedValue(eventItem.periodLabel))}</span>
                        </div>
                        <h3 class="timeline-card__title">${escapeHtml(getLocalizedValue(eventItem.title))}</h3>
                        <p class="timeline-card__description">${escapeHtml(getLocalizedValue(eventItem.description))}</p>
                    </article>
                `).join("") : `
                    <div class="empty-state">${escapeHtml(t("timeline_empty"))}</div>
                `}
            </div>
        </article>
    `;
}

function renderHeroes() {
    const heroesSection = document.getElementById("heroes-section");
    const heroes = getHeroes();
    const selectedHero = heroes.find((hero) => hero.id === appState.selectedHeroId);

    if (!heroesSection) {
        return;
    }

    if (selectedHero) {
        heroesSection.innerHTML = `
            <article class="section-panel">
                <div class="button-row">
                    <button class="button button-ghost" type="button" data-action="close-hero">
                        ${escapeHtml(t("heroes_back_button"))}
                    </button>
                </div>

                <article class="hero-detail" style="--hero-color: ${escapeHtml(selectedHero.color)};">
                    <header class="hero-detail__header">
                        <div class="hero-detail__intro">
                            <div class="hero-detail__portrait">${escapeHtml(selectedHero.image)}</div>
                            <div>
                                <h2 id="hero-detail-heading" class="hero-detail__name" tabindex="-1">${escapeHtml(getLocalizedValue(selectedHero.name))}</h2>
                                <p class="hero-detail__subtitle">${escapeHtml(getLocalizedValue(selectedHero.role))}</p>
                                <p class="hero-detail__period">${escapeHtml(selectedHero.period)}</p>
                            </div>
                        </div>
                    </header>

                    <div class="hero-detail__body">
                        <div>
                            <blockquote class="hero-detail__quote">${escapeHtml(getLocalizedValue(selectedHero.quote))}</blockquote>
                            <h3 class="detail-block__title">${escapeHtml(t("heroes_biography_title"))}</h3>
                            <p class="hero-detail__text">${escapeHtml(getLocalizedValue(selectedHero.description))}</p>
                        </div>

                        <aside>
                            <h3 class="detail-block__title">${escapeHtml(t("heroes_legacy_title"))}</h3>
                            <ul class="detail-list">
                                ${getLocalizedValue(selectedHero.highlights).map((highlight) => `
                                    <li>${escapeHtml(highlight)}</li>
                                `).join("")}
                            </ul>
                        </aside>
                    </div>
                </article>
            </article>
        `;

        const closeHeroButton = heroesSection.querySelector('[data-action="close-hero"]');

        if (closeHeroButton) {
            closeHeroButton.setAttribute(
                "aria-label",
                `${getLocalizedValue(selectedHero.name)}: ${t("heroes_back_button")}`
            );
        }

        return;
    }

    heroesSection.innerHTML = `
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 id="heroes-heading" class="section-title" tabindex="-1">${escapeHtml(t("heroes_title"))}</h2>
                    <p class="section-intro">${escapeHtml(t("heroes_intro"))}</p>
                </div>
            </div>

            <div class="heroes-grid">
                ${heroes.map((hero) => `
                    <article class="hero-card" style="--hero-color: ${escapeHtml(hero.color)};">
                        <div class="hero-card__visual">
                            <div class="hero-card__image">${escapeHtml(hero.image)}</div>
                        </div>
                        <div class="hero-card__body">
                            <h3 class="hero-card__name">${escapeHtml(getLocalizedValue(hero.name))}</h3>
                            <p class="hero-card__role">${escapeHtml(getLocalizedValue(hero.role))}</p>
                            <p class="hero-card__period">${escapeHtml(hero.period)}</p>
                            <div class="hero-card__action">
                                <button
                                    class="button button-ghost"
                                    type="button"
                                    data-action="open-hero"
                                    data-hero-id="${escapeHtml(hero.id)}"
                                    aria-label="${escapeHtml(`${t("heroes_discover_button")} : ${getLocalizedValue(hero.name)}`)}"
                                >
                                    ${escapeHtml(t("heroes_discover_button"))}
                                </button>
                            </div>
                        </div>
                    </article>
                `).join("")}
            </div>
        </article>
    `;
}

function renderQuiz() {
    const quizSection = document.getElementById("quiz-section");
    const questions = getQuizItems();

    if (!quizSection) {
        return;
    }

    if (questions.length === 0) {
        quizSection.innerHTML = `
            <article class="section-panel">
                <div class="empty-state">${escapeHtml(t("quiz_empty"))}</div>
            </article>
        `;
        return;
    }

    if (appState.quizFinished) {
        quizSection.innerHTML = renderQuizResults(questions.length);
        return;
    }

    const currentQuestion = questions[appState.quizCurrentIndex];
    const choices = getLocalizedValue(currentQuestion.choices);
    const explanation = getLocalizedValue(currentQuestion.explanation);
    const progress = ((appState.quizCurrentIndex + 1) / questions.length) * 100;

    quizSection.innerHTML = `
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 id="quiz-heading" class="section-title" tabindex="-1">${escapeHtml(t("quiz_title"))}</h2>
                    <p class="section-intro">${escapeHtml(t("quiz_intro"))}</p>
                </div>
            </div>

            <div class="quiz-card">
                <div class="quiz-progress" role="status" aria-live="polite" aria-atomic="true">
                    <div class="quiz-progress__top">
                        <span>${escapeHtml(t("quiz_progress_label"))}</span>
                        <span>${escapeHtml(`${appState.quizCurrentIndex + 1} / ${questions.length}`)}</span>
                    </div>
                    <div class="quiz-progress__bar">
                        <span class="quiz-progress__value" style="width: ${progress}%;"></span>
                    </div>
                </div>

                <h3 class="quiz-question">${escapeHtml(getLocalizedValue(currentQuestion.question))}</h3>

                <div class="quiz-choices">
                    ${choices.map((choice, index) => {
                        const isAnswered = appState.quizSelectedAnswer !== null;
                        const isCorrect = index === currentQuestion.answer;
                        const isWrongSelection = index === appState.quizSelectedAnswer && !isCorrect;
                        const stateClass = isAnswered && isCorrect
                            ? "is-correct"
                            : isWrongSelection
                                ? "is-wrong"
                                : "";

                        return `
                            <button
                                class="quiz-choice ${stateClass}"
                                type="button"
                                data-action="answer-quiz"
                                data-choice-index="${index}"
                                aria-label="${escapeHtml(choice)}"
                                ${isAnswered ? "disabled" : ""}
                            >
                                <span class="quiz-choice__index">${String.fromCharCode(65 + index)}</span>
                                <span>${escapeHtml(choice)}</span>
                            </button>
                        `;
                    }).join("")}
                </div>

                ${appState.quizSelectedAnswer !== null ? `
                    <div class="quiz-feedback">
                        <p class="quiz-feedback__text">${escapeHtml(explanation)}</p>
                        <div class="quiz-feedback__actions">
                            <button class="button button-gold" type="button" data-action="next-question">
                                ${escapeHtml(appState.quizCurrentIndex === questions.length - 1 ? t("quiz_finish_button") : t("quiz_next_button"))}
                            </button>
                        </div>
                    </div>
                ` : ""}
            </div>
        </article>
    `;
}

function renderQuizResults(totalQuestions) {
    const scoreRatio = appState.quizScore / totalQuestions;
    let titleKey = "quiz_result_title_keep";
    let textKey = "quiz_result_text_keep";

    if (scoreRatio >= 0.75) {
        titleKey = "quiz_result_title_excellent";
        textKey = "quiz_result_text_excellent";
    } else if (scoreRatio >= 0.5) {
        titleKey = "quiz_result_title_good";
        textKey = "quiz_result_text_good";
    }

    return `
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 id="quiz-results-heading" class="section-title" tabindex="-1">${escapeHtml(t("quiz_title"))}</h2>
                    <p class="section-intro">${escapeHtml(t("quiz_result_intro"))}</p>
                </div>
            </div>

            <div class="result-card">
                <h3 class="result-card__title" tabindex="-1">${escapeHtml(t(titleKey))}</h3>
                <p class="result-card__score" aria-label="${escapeHtml(`${t("quiz_score_label")} ${appState.quizScore} / ${totalQuestions}`)}">
                    ${escapeHtml(t("quiz_score_label"))}
                    <span class="result-card__number">${escapeHtml(String(appState.quizScore))}</span>
                    / ${escapeHtml(String(totalQuestions))}
                </p>
                <p class="result-card__message">${escapeHtml(t(textKey))}</p>

                <div class="button-row">
                    <button class="button button-gold" type="button" data-action="restart-quiz" aria-label="${escapeHtml(t("quiz_restart_button"))}">
                        ${escapeHtml(t("quiz_restart_button"))}
                    </button>
                    <button class="button button-ghost" type="button" data-action="change-section" data-section="timeline" aria-label="${escapeHtml(t("quiz_timeline_button"))}">
                        ${escapeHtml(t("quiz_timeline_button"))}
                    </button>
                </div>
            </div>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function announce(message) {
    const announcer = document.getElementById("sr-announcer");

    if (!announcer || !message) {
        return;
    }

    announcer.textContent = "";

    window.setTimeout(() => {
        announcer.textContent = message;
    }, 20);
}

function focusElement(element) {
    if (!element) {
        return;
    }

    window.requestAnimationFrame(() => {
        element.focus({ preventScroll: true });
    });
}

function getActiveSectionHeading() {
    const activeSection = document.getElementById(`${appState.section}-section`);

    if (!activeSection) {
        return null;
    }

    return activeSection.querySelector("h1, h2, h3");
}

function focusActiveSectionHeading() {
    focusElement(getActiveSectionHeading());
}

function focusHeroDetailHeading() {
    focusElement(document.getElementById("hero-detail-heading"));
}

function focusHeroListReturnTarget(heroId) {
    const heroesSection = document.getElementById("heroes-section");
    const targetHeroId = heroId || appState.lastHeroTriggerId;
    const previousHeroButton = heroesSection && targetHeroId
        ? heroesSection.querySelector(`[data-action="open-hero"][data-hero-id="${cssEscape(targetHeroId)}"]`)
        : null;

    focusElement(previousHeroButton || document.getElementById("heroes-heading"));
}

function announceSectionChange() {
    const heading = getActiveSectionHeading();

    if (heading) {
        announce(heading.textContent.trim());
    }
}

function announceHeroOpen() {
    const selectedHero = getHeroes().find((hero) => hero.id === appState.selectedHeroId);

    if (selectedHero) {
        announce(getLocalizedValue(selectedHero.name));
    }
}

function announceHeroListReturn() {
    const heroesHeading = document.getElementById("heroes-heading");

    if (heroesHeading) {
        announce(heroesHeading.textContent.trim());
    }
}

function getQuizResultAnnouncement(totalQuestions) {
    const scoreRatio = appState.quizScore / totalQuestions;

    if (scoreRatio >= 0.75) {
        return `${t("quiz_result_title_excellent")} ${t("quiz_score_label")} ${appState.quizScore} / ${totalQuestions}`;
    }

    if (scoreRatio >= 0.5) {
        return `${t("quiz_result_title_good")} ${t("quiz_score_label")} ${appState.quizScore} / ${totalQuestions}`;
    }

    return `${t("quiz_result_title_keep")} ${t("quiz_score_label")} ${appState.quizScore} / ${totalQuestions}`;
}

function totalQuestionsFromQuestions(questions) {
    return Array.isArray(questions) ? questions.length : 0;
}

function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
        return window.CSS.escape(value);
    }

    return String(value).replace(/["\\]/g, "\\$&");
}
