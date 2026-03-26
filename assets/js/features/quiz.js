import { appState } from "../core/state.js";
import { getQuizItems } from "../core/content.js";
import { getLocalizedValue, t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

const QUIZ_SESSION_SIZE = 10;

let quizQuestionPool = null;
let shouldPrepareNextQuizSession = true;

export function renderQuiz() {
    const quizSection = document.getElementById("quiz-section");

    if (!quizSection) {
        return;
    }

    if (appState.authenticated !== true) {
        quizSection.innerHTML = `
            <article class="section-panel">
                <div class="section-heading">
                    <div>
                        <h2 id="quiz-heading" class="section-title" tabindex="-1">${escapeHtml(t("quiz_title"))}</h2>
                        <p class="section-intro">${escapeHtml(t("quiz_auth_required"))}</p>
                    </div>
                </div>

                <div class="button-row">
                    <button class="button button-primary" type="button" data-action="open-login">
                        ${escapeHtml(t("quiz_auth_login_button"))}
                    </button>
                </div>
            </article>
        `;
        return;
    }

    ensureQuizSessionQuestions();

    const questions = getQuizItems();

    if (questions.length === 0) {
        quizSection.innerHTML = `
            <article class="section-panel">
                <div class="empty-state">${escapeHtml(t("quiz_empty"))}</div>
            </article>
        `;
        return;
    }

    if (appState.quizFinished) {
        shouldPrepareNextQuizSession = true;
        quizSection.innerHTML = renderQuizResults(questions.length) + renderQuizAttempts();
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
    const level = getQuizLevel(appState.quizScore, totalQuestions);

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
                <p class="result-card__message">${escapeHtml(`${t("quiz_level_label")} ${level}`)}</p>
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

function renderQuizAttempts() {
    if (!Array.isArray(appState.quizAttempts) || appState.quizAttempts.length === 0) {
        return `
            <article class="section-panel">
                <div class="section-heading">
                    <div>
                        <h2 class="section-title">${escapeHtml(t("quiz_attempts_title"))}</h2>
                        <p class="section-intro">${escapeHtml(t("quiz_attempts_empty"))}</p>
                    </div>
                </div>
            </article>
        `;
    }

    return `
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 class="section-title">${escapeHtml(t("quiz_attempts_title"))}</h2>
                </div>
            </div>

            ${renderQuizAttemptsSummary()}

            <ul class="quiz-feedback">
                ${appState.quizAttempts.slice(0, 10).map((attempt) => `
                    <li class="quiz-feedback__text">
                        ${escapeHtml(formatQuizAttempt(attempt))}
                    </li>
                `).join("")}
            </ul>
        </article>
    `;
}

function formatQuizAttempt(attempt) {
    const completedAt = attempt?.completed_at ? new Date(attempt.completed_at) : null;
    const formattedDate = completedAt instanceof Date && !Number.isNaN(completedAt.getTime())
        ? completedAt.toLocaleString(appState.language || undefined)
        : String(attempt?.completed_at || "");
    const score = Number(attempt?.score ?? 0);
    const totalQuestions = Number(attempt?.total_questions ?? 0);
    const level = getQuizLevel(score, totalQuestions);

    return `${formattedDate} - ${score}/${totalQuestions} - ${t("quiz_level_label")} ${level}`;
}

function renderQuizAttemptsSummary() {
    const stats = getQuizAttemptsStats();
    const averagePercent = Math.round(stats.averageScoreRatio * 100);
    const globalLevel = getQuizLevel(stats.bestScore, stats.bestTotalQuestions);

    return `
        <div class="quiz-feedback">
            <p class="quiz-feedback__text">
                ${escapeHtml(`${t("quiz_summary_total_attempts")} ${stats.totalAttempts}`)}
            </p>
            <p class="quiz-feedback__text">
                ${escapeHtml(`${t("quiz_summary_best_score")} ${stats.bestScore}/${stats.bestTotalQuestions}`)}
            </p>
            <p class="quiz-feedback__text">
                ${escapeHtml(`${t("quiz_summary_average")} ${averagePercent} %`)}
            </p>
            <p class="quiz-feedback__text">
                ${escapeHtml(`${t("quiz_summary_level")} ${globalLevel}`)}
            </p>
        </div>
    `;
}

function getQuizAttemptsStats() {
    const attempts = Array.isArray(appState.quizAttempts) ? appState.quizAttempts : [];
    let bestScore = 0;
    let bestTotalQuestions = 0;
    let totalScoreRatio = 0;

    attempts.forEach((attempt) => {
        const score = Number(attempt?.score ?? 0);
        const totalQuestions = Number(attempt?.total_questions ?? 0);
        const scoreRatio = totalQuestions > 0 ? score / totalQuestions : 0;
        const bestScoreRatio = bestTotalQuestions > 0 ? bestScore / bestTotalQuestions : 0;

        totalScoreRatio += scoreRatio;

        if (scoreRatio > bestScoreRatio) {
            bestScore = score;
            bestTotalQuestions = totalQuestions;
        }
    });

    return {
        totalAttempts: attempts.length,
        bestScore,
        bestTotalQuestions,
        averageScoreRatio: attempts.length > 0 ? totalScoreRatio / attempts.length : 0,
        latestAttempt: attempts[0] || null
    };
}

export function getQuizLevel(score, totalQuestions) {
    const normalizedTotal = Number(totalQuestions);
    const normalizedScore = Number(score);
    const scoreRatio = normalizedTotal > 0 ? normalizedScore / normalizedTotal : 0;

    if (scoreRatio >= 0.75) {
        return t("quiz_level_expert");
    }

    if (scoreRatio >= 0.5) {
        return t("quiz_level_intermediate");
    }

    return t("quiz_level_beginner");
}

export function getQuizResultAnnouncement(totalQuestions) {
    const scoreRatio = appState.quizScore / totalQuestions;

    if (scoreRatio >= 0.75) {
        return `${t("quiz_result_title_excellent")} ${t("quiz_score_label")} ${appState.quizScore} / ${totalQuestions}`;
    }

    if (scoreRatio >= 0.5) {
        return `${t("quiz_result_title_good")} ${t("quiz_score_label")} ${appState.quizScore} / ${totalQuestions}`;
    }

    return `${t("quiz_result_title_keep")} ${t("quiz_score_label")} ${appState.quizScore} / ${totalQuestions}`;
}

export function totalQuestionsFromQuestions(questions) {
    return Array.isArray(questions) ? questions.length : 0;
}

function ensureQuizSessionQuestions() {
    if (!Array.isArray(quizQuestionPool)) {
        quizQuestionPool = Array.isArray(getQuizItems()) ? getQuizItems().slice() : [];
    }

    if (!shouldPrepareNextQuizSession) {
        return;
    }

    window.IstwaQuiz = createQuizSessionQuestions(quizQuestionPool);
    shouldPrepareNextQuizSession = false;
}

function createQuizSessionQuestions(questions) {
    const shuffledQuestions = shuffleQuestions(questions);

    if (shuffledQuestions.length <= QUIZ_SESSION_SIZE) {
        return shuffledQuestions;
    }

    return shuffledQuestions.slice(0, QUIZ_SESSION_SIZE);
}

function shuffleQuestions(questions) {
    const shuffledQuestions = Array.isArray(questions) ? questions.slice() : [];

    for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const currentQuestion = shuffledQuestions[index];

        shuffledQuestions[index] = shuffledQuestions[randomIndex];
        shuffledQuestions[randomIndex] = currentQuestion;
    }

    return shuffledQuestions;
}
