import { appState } from "../core/state.js";
import { getLocalizedValue, t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

const moduleDetailState = {
    slug: null,
    questionIndex: 0,
    selectedAnswer: null,
    score: 0,
    finished: false,
    answers: [],
    saveStarted: false
};

export function renderKonnenRasinOu() {
    const section = document.getElementById("konnen-rasin-ou-section");
    const modules = getModules();
    const ui = getModuleUiCopy();

    resetModuleDetailState();

    if (!section) {
        return;
    }

    if (modules.length === 0) {
        section.innerHTML = `
            <article class="section-panel">
                <div class="empty-state">${escapeHtml(ui.emptyLabel)}</div>
            </article>
        `;
        section.onclick = null;
        return;
    }

    section.innerHTML = `
        <div class="heroes-journey">
            <article class="section-panel heroes-journey__hero">
                <div class="section-heading">
                    <div>
                        <h2 id="konnen-rasin-ou-heading" class="section-title" tabindex="-1">${escapeHtml(ui.sectionTitle)}</h2>
                        <p class="section-intro">${escapeHtml(ui.sectionIntro)}</p>
                    </div>
                </div>
            </article>

            <article class="section-panel heroes-journey__grid-shell">
                <div class="heroes-grid heroes-grid--narrative">
                    ${modules.map((module) => renderModuleCard(module, ui)).join("")}
                </div>
            </article>
        </div>
    `;

    section.onclick = (event) => {
        const trigger = event.target.closest("[data-module-action]");

        if (!trigger) {
            return;
        }

        if (trigger.dataset.moduleAction === "open") {
            openModuleDetail(String(trigger.dataset.moduleSlug || ""));
        }
    };
}

export function openModuleDetail(slug) {
    const section = document.getElementById("konnen-rasin-ou-section");
    const module = getModuleBySlug(slug);

    if (!section) {
        return;
    }

    if (!module) {
        renderKonnenRasinOu();
        return;
    }

    if (moduleDetailState.slug !== module.slug) {
        startModuleDetailSession(module.slug);
    }

    const ui = getModuleUiCopy();
    const paragraphs = Array.isArray(module.paragraphs)
        ? module.paragraphs.map((paragraph) => normalizeTextValue(getLocalizedValue(paragraph))).filter(Boolean)
        : [];
    const highlights = normalizeArrayValue(getLocalizedValue(module.highlights));

    section.innerHTML = `
        <article class="section-panel heroes-journey heroes-journey--detail">
            <div class="button-row">
                <button class="button button-ghost" type="button" data-module-action="back">
                    ${escapeHtml(ui.backButtonLabel)}
                </button>
            </div>

            <article class="hero-detail heroes-detail-shell" style="--hero-color: ${escapeHtml(String(module.color || "#103a5d"))};">
                <header class="hero-detail__header">
                    <div class="hero-detail__intro">
                        <div>
                            <p class="hero-detail__subtitle">${escapeHtml(normalizeTextValue(getLocalizedValue(module.kicker)))}</p>
                            <h2 id="konnen-rasin-ou-detail-heading" class="hero-detail__name" tabindex="-1">${escapeHtml(normalizeTextValue(getLocalizedValue(module.question)))}</h2>
                            <p class="hero-detail__text">${escapeHtml(normalizeTextValue(getLocalizedValue(module.intro)))}</p>
                        </div>
                    </div>
                    <div class="heroes-detail__badges">
                        <span class="heroes-detail__badge">${escapeHtml(ui.moduleBadgeLabel)}</span>
                        ${renderModuleCompletionBadge(module, ui, true)}
                    </div>
                </header>

                <div class="hero-detail__body">
                    <div>
                        ${paragraphs.map((paragraph) => `
                            <p class="hero-detail__text">${escapeHtml(paragraph)}</p>
                        `).join("")}
                    </div>

                    <aside class="heroes-detail__aside">
                        <h3 class="detail-block__title">${escapeHtml(ui.highlightsTitle)}</h3>
                        <ul class="detail-list">
                            ${highlights.map((highlight) => `
                                <li>${escapeHtml(highlight)}</li>
                            `).join("")}
                        </ul>
                    </aside>
                </div>
            </article>

            <article class="section-panel">
                ${renderModuleQuiz(module, ui)}
            </article>
        </article>
    `;

    section.onclick = (event) => {
        const trigger = event.target.closest("[data-module-action]");

        if (!trigger) {
            return;
        }

        if (trigger.dataset.moduleAction === "back") {
            renderKonnenRasinOu();
            return;
        }

        if (trigger.dataset.moduleAction === "answer") {
            const choiceIndex = Number(trigger.dataset.choiceIndex);

            if (!Number.isNaN(choiceIndex)) {
                answerModuleQuestion(choiceIndex);
            }
            return;
        }

        if (trigger.dataset.moduleAction === "next") {
            goToNextModuleQuestion();
        }
    };
}

export function setModuleProgress(progress) {
    appState.moduleProgress = Array.isArray(progress) ? progress : [];
}

function renderModuleCard(module, ui) {
    const progressEntry = getModuleProgressEntry(module.slug);
    const questionCount = getModuleQuestionCount(module);

    return `
        <article class="hero-card hero-card--narrative" style="--hero-color: ${escapeHtml(String(module.color || "#103a5d"))};">
            <div class="hero-card__body">
                <p class="hero-card__period-tag">${escapeHtml(ui.moduleCardLabel)}</p>
                <h3 class="hero-card__name">${escapeHtml(normalizeTextValue(getLocalizedValue(module.question)))}</h3>
                <p class="hero-card__role">${escapeHtml(normalizeTextValue(getLocalizedValue(module.kicker)))}</p>
                ${progressEntry ? `
                    <div class="heroes-impact">
                        <p class="heroes-impact__label" style="color: #2f8f46;">${escapeHtml(ui.completedLabel)}</p>
                        <p class="heroes-impact__text" style="color: #2f8f46;">&#10003; ${escapeHtml(formatModuleScore(progressEntry.score, questionCount))}</p>
                    </div>
                ` : ""}
                <div class="hero-card__action">
                    <button
                        class="button button-ghost"
                        type="button"
                        data-module-action="open"
                        data-module-slug="${escapeHtml(module.slug)}"
                        aria-label="${escapeHtml(`${ui.exploreButtonLabel} : ${normalizeTextValue(getLocalizedValue(module.question))}`)}"
                    >
                        ${escapeHtml(ui.exploreButtonLabel)}
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderModuleCompletionBadge(module, ui, includeCurrentSession) {
    const questionCount = getModuleQuestionCount(module);
    const progressEntry = includeCurrentSession && moduleDetailState.slug === module.slug && moduleDetailState.finished
        ? { score: moduleDetailState.score }
        : getModuleProgressEntry(module.slug);

    if (!progressEntry) {
        return "";
    }

    return `
        <span class="heroes-detail__badge" style="color: #2f8f46;">
            &#10003; ${escapeHtml(`${ui.scoreShortLabel} ${formatModuleScore(progressEntry.score, questionCount)}`)}
        </span>
    `;
}

function renderModuleQuiz(module, ui) {
    const questions = Array.isArray(module.quiz) ? module.quiz : [];

    if (questions.length === 0) {
        return `<div class="empty-state">${escapeHtml(ui.quizEmptyLabel)}</div>`;
    }

    if (moduleDetailState.finished) {
        return renderModuleQuizResult(module, questions.length, ui);
    }

    const currentQuestion = questions[moduleDetailState.questionIndex];

    if (!currentQuestion) {
        return `<div class="empty-state">${escapeHtml(ui.quizEmptyLabel)}</div>`;
    }

    const choices = normalizeArrayValue(getLocalizedValue(currentQuestion.choices));
    const explanation = normalizeTextValue(getLocalizedValue(currentQuestion.explanation));
    const isAnswered = moduleDetailState.selectedAnswer !== null;
    const progress = ((moduleDetailState.questionIndex + 1) / questions.length) * 100;
    const isCorrectAnswer = isAnswered && moduleDetailState.selectedAnswer === Number(currentQuestion.answer);

    return `
        <div id="module-quiz-card" class="quiz-card quiz-card--journey">
            <div class="section-heading">
                <div>
                    <h3 class="section-title">${escapeHtml(ui.quizTitle)}</h3>
                    <p class="section-intro">${escapeHtml(ui.quizIntro)}</p>
                </div>
            </div>

            <div class="quiz-progress" role="status" aria-live="polite" aria-atomic="true">
                <div class="quiz-progress__top">
                    <span>${escapeHtml(t("quiz_progress_label"))}</span>
                    <span>${escapeHtml(`${moduleDetailState.questionIndex + 1} / ${questions.length}`)}</span>
                </div>
                <div class="quiz-progress__bar">
                    <span class="quiz-progress__value" style="width: ${escapeHtml(String(progress))}%;"></span>
                </div>
            </div>

            <p class="quiz-question__kicker">${escapeHtml(`${ui.questionLabel} ${String(moduleDetailState.questionIndex + 1).padStart(2, "0")}`)}</p>
            <h3 class="quiz-question">${escapeHtml(normalizeTextValue(getLocalizedValue(currentQuestion.question)))}</h3>

            <div class="quiz-choices">
                ${choices.map((choice, index) => renderQuizChoice(choice, index, Number(currentQuestion.answer), isAnswered)).join("")}
            </div>

            ${isAnswered ? `
                <div class="quiz-feedback ${isCorrectAnswer ? "is-success" : "is-danger"}">
                    <p class="quiz-feedback__title">${escapeHtml(isCorrectAnswer ? ui.correctTitle : ui.wrongTitle)}</p>
                    ${isCorrectAnswer ? "" : `
                        <p class="quiz-feedback__text">
                            ${escapeHtml(`${ui.correctAnswerLabel} ${choices[Number(currentQuestion.answer)] || ""}`)}
                        </p>
                    `}
                    <p class="quiz-feedback__text">${escapeHtml(explanation)}</p>
                    <div class="quiz-feedback__actions">
                        <button class="button button-gold" type="button" data-module-action="next">
                            ${escapeHtml(moduleDetailState.questionIndex === questions.length - 1 ? t("quiz_finish_button") : t("quiz_next_button"))}
                        </button>
                    </div>
                </div>
            ` : ""}
        </div>
    `;
}

function renderQuizChoice(choice, index, answerIndex, isAnswered) {
    const isCorrect = index === answerIndex;
    const isWrongSelection = index === moduleDetailState.selectedAnswer && !isCorrect;
    const isSelected = index === moduleDetailState.selectedAnswer;
    const stateClass = isAnswered && isCorrect
        ? "is-correct"
        : isWrongSelection
            ? "is-wrong"
            : isSelected
                ? "is-selected"
                : "";

    return `
        <button
            class="quiz-choice ${stateClass}"
            type="button"
            data-module-action="answer"
            data-choice-index="${escapeHtml(String(index))}"
            aria-label="${escapeHtml(choice)}"
            ${isAnswered ? "disabled" : ""}
        >
            <span class="quiz-choice__index">${escapeHtml(String.fromCharCode(65 + index))}</span>
            <span>${escapeHtml(choice)}</span>
        </button>
    `;
}

function renderModuleQuizResult(module, totalQuestions, ui) {
    const scoreRatio = totalQuestions > 0 ? moduleDetailState.score / totalQuestions : 0;
    let title = ui.resultTitleKeep;
    let text = ui.resultTextKeep;

    if (scoreRatio >= 0.75) {
        title = ui.resultTitleExcellent;
        text = ui.resultTextExcellent;
    } else if (scoreRatio >= 0.5) {
        title = ui.resultTitleGood;
        text = ui.resultTextGood;
    }

    return `
        <div class="result-card quiz-results-card" style="--hero-color: ${escapeHtml(String(module.color || "#103a5d"))};">
            <p class="quiz-results-card__kicker">${escapeHtml(ui.resultKicker)}</p>
            <h3 class="result-card__title">${escapeHtml(title)}</h3>
            <p class="result-card__score" aria-label="${escapeHtml(`${t("quiz_score_label")} ${moduleDetailState.score} / ${totalQuestions}`)}">
                ${escapeHtml(t("quiz_score_label"))}
                <span class="result-card__number">${escapeHtml(String(moduleDetailState.score))}</span>
                / ${escapeHtml(String(totalQuestions))}
            </p>
            <p class="result-card__message">${escapeHtml(text)}</p>
            ${renderSaveStatus(ui)}
            <div class="button-row">
                <button class="button button-ghost" type="button" data-module-action="back">
                    ${escapeHtml(ui.backButtonLabel)}
                </button>
            </div>
        </div>
    `;
}

function renderSaveStatus(ui) {
    if (appState.authenticated !== true) {
        return "";
    }

    const progressEntry = getModuleProgressEntry(moduleDetailState.slug);
    const savedScore = progressEntry ? Number(progressEntry.score ?? 0) : null;

    if (savedScore === moduleDetailState.score) {
        return `<p class="quiz-feedback__text" style="color: #2f8f46;">${escapeHtml(ui.savedLabel)}</p>`;
    }

    if (moduleDetailState.saveStarted) {
        return `<p class="quiz-feedback__text">${escapeHtml(ui.savingLabel)}</p>`;
    }

    return "";
}

function answerModuleQuestion(choiceIndex) {
    const module = getModuleBySlug(moduleDetailState.slug);
    const questions = Array.isArray(module?.quiz) ? module.quiz : [];
    const currentQuestion = questions[moduleDetailState.questionIndex];

    if (!currentQuestion || moduleDetailState.selectedAnswer !== null || moduleDetailState.finished) {
        return;
    }

    const answerIndex = Number(currentQuestion.answer);

    moduleDetailState.selectedAnswer = choiceIndex;
    moduleDetailState.answers[moduleDetailState.questionIndex] = {
        question_index: moduleDetailState.questionIndex,
        selected_answer: choiceIndex,
        correct_answer: answerIndex,
        is_correct: choiceIndex === answerIndex
    };

    if (choiceIndex === answerIndex) {
        moduleDetailState.score += 1;
    }

    openModuleDetail(module.slug);
}

function goToNextModuleQuestion() {
    const module = getModuleBySlug(moduleDetailState.slug);
    const questions = Array.isArray(module?.quiz) ? module.quiz : [];

    if (!module || questions.length === 0) {
        renderKonnenRasinOu();
        return;
    }

    if (moduleDetailState.questionIndex >= questions.length - 1) {
        moduleDetailState.finished = true;
        moduleDetailState.selectedAnswer = null;
        openModuleDetail(module.slug);
        void persistModuleProgress(module.slug);
        return;
    }

    moduleDetailState.questionIndex += 1;
    moduleDetailState.selectedAnswer = null;
    openModuleDetail(module.slug);
}

function startModuleDetailSession(slug) {
    resetModuleDetailState();
    moduleDetailState.slug = slug;
}

function resetModuleDetailState() {
    moduleDetailState.slug = null;
    moduleDetailState.questionIndex = 0;
    moduleDetailState.selectedAnswer = null;
    moduleDetailState.score = 0;
    moduleDetailState.finished = false;
    moduleDetailState.answers = [];
    moduleDetailState.saveStarted = false;
}

function getModules() {
    const modules = Array.isArray(window.IstwaModules) ? window.IstwaModules.slice() : [];

    return modules
        .filter((module) => module && typeof module === "object" && typeof module.slug === "string" && module.slug.trim() !== "")
        .sort((firstModule, secondModule) => Number(firstModule.position ?? 0) - Number(secondModule.position ?? 0));
}

function getModuleBySlug(slug) {
    return getModules().find((module) => module.slug === slug) || null;
}

function getModuleProgressEntry(slug) {
    if (appState.authenticated !== true) {
        return null;
    }

    const progressList = Array.isArray(appState.moduleProgress) ? appState.moduleProgress : [];

    return progressList.find((entry) => entry && entry.module_slug === slug) || null;
}

function getModuleQuestionCount(module) {
    return Array.isArray(module?.quiz) ? module.quiz.length : 0;
}

function formatModuleScore(score, totalQuestions) {
    const normalizedScore = Number(score ?? 0);
    const normalizedTotal = Number(totalQuestions ?? 0);

    return `${normalizedScore}/${normalizedTotal}`;
}

function normalizeTextValue(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item ?? "").trim()).filter(Boolean).join(" ");
    }

    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function normalizeArrayValue(value) {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeTextValue(item)).filter(Boolean);
    }

    const normalizedValue = normalizeTextValue(value);

    return normalizedValue === "" ? [] : [normalizedValue];
}

function updateSavedModuleProgress(slug, score) {
    const progressList = Array.isArray(appState.moduleProgress) ? appState.moduleProgress.slice() : [];
    const nextEntry = {
        module_slug: slug,
        score
    };
    const existingIndex = progressList.findIndex((entry) => entry && entry.module_slug === slug);

    if (existingIndex >= 0) {
        progressList[existingIndex] = {
            ...progressList[existingIndex],
            ...nextEntry
        };
    } else {
        progressList.unshift(nextEntry);
    }

    setModuleProgress(progressList);
}

async function persistModuleProgress(slug) {
    if (appState.authenticated !== true || moduleDetailState.saveStarted || moduleDetailState.finished !== true) {
        return;
    }

    moduleDetailState.saveStarted = true;

    try {
        await saveModuleProgress({
            module_slug: slug,
            score: moduleDetailState.score,
            completed_at: new Date().toISOString()
        });
        updateSavedModuleProgress(slug, moduleDetailState.score);
        openModuleDetail(slug);
    } catch (error) {
        console.error("Unable to save module progress.", error);
        moduleDetailState.saveStarted = false;
    }
}

async function saveModuleProgress(payload) {
    const response = await fetch("./api/module-progress-save.php", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.message || `Module progress save failed with status ${response.status}.`);
    }

    return result;
}

function getModuleUiCopy() {
    const dictionary = {
        fr: {
            sectionTitle: "Konnen Rasin Ou",
            sectionIntro: "Explorez des modules courts, ouvrez le detail, puis terminez un mini-quiz pour valider vos reperes.",
            emptyLabel: "Aucun module disponible.",
            moduleCardLabel: "Module",
            moduleBadgeLabel: "Mini-quiz",
            exploreButtonLabel: "Explorer",
            backButtonLabel: "Retour",
            highlightsTitle: "Points cles",
            completedLabel: "Complete",
            scoreShortLabel: "Score",
            quizTitle: "Mini-quiz",
            quizIntro: "Repondez une question a la fois. La correction apparait juste apres votre choix.",
            quizEmptyLabel: "Ce module ne contient pas encore de quiz.",
            questionLabel: "Question",
            correctTitle: "Bonne reponse",
            wrongTitle: "Reponse a revoir",
            correctAnswerLabel: "Bonne reponse :",
            resultKicker: "Bilan du module",
            resultTitleExcellent: "Excellent travail",
            resultTextExcellent: "Vous maitrisez deja tres bien ce module.",
            resultTitleGood: "Bonne progression",
            resultTextGood: "Encore un effort et ce module sera completement acquis.",
            resultTitleKeep: "Continuez a explorer",
            resultTextKeep: "Relisez les points cles et reprenez le module pour renforcer vos reperes.",
            savingLabel: "Sauvegarde en cours...",
            savedLabel: "Progression enregistree."
        },
        ht: {
            sectionTitle: "Konnen Rasin Ou",
            sectionIntro: "Eksplore ti modil yo, louvri detay yo, epi fini yon mini-quiz pou valide repere ou yo.",
            emptyLabel: "Pa gen modil disponib.",
            moduleCardLabel: "Modil",
            moduleBadgeLabel: "Mini-quiz",
            exploreButtonLabel: "Eksplore",
            backButtonLabel: "Retounen",
            highlightsTitle: "Pwen kle",
            completedLabel: "Fini",
            scoreShortLabel: "Not",
            quizTitle: "Mini-quiz",
            quizIntro: "Reponn yon kestyon alafwa. Koreksyon an paret touswit apre chwa ou.",
            quizEmptyLabel: "Modil sa a poko gen quiz.",
            questionLabel: "Kestyon",
            correctTitle: "Bon repons",
            wrongTitle: "Repons pou korije",
            correctAnswerLabel: "Bon repons :",
            resultKicker: "Rezime modil la",
            resultTitleExcellent: "Ekselan travay",
            resultTextExcellent: "Ou byen metrize modil sa a deja.",
            resultTitleGood: "Bon pwogres",
            resultTextGood: "Ankò yon ti efò epi modil sa a ap byen ankre.",
            resultTitleKeep: "Kontinye eksplore",
            resultTextKeep: "Reli pwen kle yo epi reprann modil la pou ranfose repere ou yo.",
            savingLabel: "Anrejistreman an ap fet...",
            savedLabel: "Pwogres la anrejistre."
        },
        en: {
            sectionTitle: "Konnen Rasin Ou",
            sectionIntro: "Explore short modules, open the detail view, then complete a mini quiz to confirm key historical markers.",
            emptyLabel: "No modules available.",
            moduleCardLabel: "Module",
            moduleBadgeLabel: "Mini quiz",
            exploreButtonLabel: "Explore",
            backButtonLabel: "Back",
            highlightsTitle: "Key points",
            completedLabel: "Completed",
            scoreShortLabel: "Score",
            quizTitle: "Mini quiz",
            quizIntro: "Answer one question at a time. Feedback appears right after your choice.",
            quizEmptyLabel: "This module does not contain a quiz yet.",
            questionLabel: "Question",
            correctTitle: "Correct answer",
            wrongTitle: "Needs review",
            correctAnswerLabel: "Correct answer:",
            resultKicker: "Module summary",
            resultTitleExcellent: "Excellent work",
            resultTextExcellent: "You already have a strong grasp of this module.",
            resultTitleGood: "Good progress",
            resultTextGood: "One more pass and this module will be firmly anchored.",
            resultTitleKeep: "Keep exploring",
            resultTextKeep: "Review the key points and try the module again to strengthen your markers.",
            savingLabel: "Saving progress...",
            savedLabel: "Progress saved."
        }
    };

    return dictionary[appState.language] || dictionary.fr;
}
