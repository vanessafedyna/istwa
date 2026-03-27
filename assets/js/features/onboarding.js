import { escapeHtml } from "../core/ui.js";

const ONBOARDING_QUESTIONS = [
    {
        key: "home",
        title: "Ou te sens-tu chez toi ?",
        text: "Choisis ce qui ressemble le plus a ton ressenti du moment.",
        options: [
            {
                value: "haiti",
                label: "Haiti",
                caption: "Il y a quelque chose en moi qui revient naturellement vers cette terre."
            },
            {
                value: "montreal",
                label: "Montreal",
                caption: "C'est ici que mon quotidien, mes reperes et mes attaches prennent forme."
            },
            {
                value: "between",
                label: "Entre les deux",
                caption: "Je me sens entre plusieurs lieux, plusieurs rythmes, plusieurs versions de moi."
            },
            {
                value: "unknown",
                label: "Je ne sais pas encore",
                caption: "Je suis justement la pour sentir plus clairement ce qui m'habite."
            }
        ]
    },
    {
        key: "explore",
        title: "Qu'est-ce que tu veux explorer ?",
        text: "Prends le fil qui t'attire en premier, meme si ce n'est qu'une intuition.",
        options: [
            {
                value: "history",
                label: "Mon histoire",
                caption: "J'ai envie de mieux comprendre ce qui me traverse et d'ou cela vient."
            },
            {
                value: "family",
                label: "Ma famille",
                caption: "Je veux retrouver les liens, les voix et les traces qui me relient aux miens."
            },
            {
                value: "racines",
                label: "Mes racines",
                caption: "Je cherche un point d'ancrage, quelque chose de plus profond que des dates ou des mots."
            },
            {
                value: "discover",
                label: "Juste decouvrir",
                caption: "Je veux entrer doucement, sans tout definir des le depart."
            }
        ]
    },
    {
        key: "pace",
        title: "Comment tu veux avancer ?",
        text: "Choisis le rythme qui te ressemble le plus pour commencer.",
        options: [
            {
                value: "slow",
                label: "Lentement",
                caption: "Je prefere prendre mon temps et laisser les choses venir."
            },
            {
                value: "free",
                label: "Explorer librement",
                caption: "J'aime ouvrir ce qui m'appelle sur le moment, sans ordre impose."
            },
            {
                value: "guided",
                label: "Etre guide",
                caption: "J'ai envie d'un parcours simple qui me tienne doucement la main."
            }
        ]
    }
];

const ONBOARDING_FINAL_STEP = ONBOARDING_QUESTIONS.length + 1;

let onboardingStep = 0;
let onboardingAnswers = {};

export function getOnboardingProfileSnapshot() {
    const answers = ONBOARDING_QUESTIONS.map((question) => {
        const answer = question.options.find((option) => option.value === onboardingAnswers[question.key]);

        return {
            key: question.key,
            title: question.title,
            label: answer?.label || null
        };
    });

    return {
        hasStarted: onboardingStep > 0 || answers.some((answer) => answer.label !== null),
        isComplete: onboardingStep === ONBOARDING_FINAL_STEP,
        answers
    };
}

export function renderOnboarding() {
    const section = document.getElementById("onboarding-section");

    if (!section) {
        return;
    }

    if (isQuestionStep(onboardingStep)) {
        section.innerHTML = renderQuestionScreen();
        return;
    }

    if (onboardingStep === ONBOARDING_FINAL_STEP) {
        section.innerHTML = renderCompleteScreen();
        return;
    }

    section.innerHTML = renderIntroScreen();
}

export function handleOnboardingAction(action, trigger) {
    if (action === "onboarding-start") {
        onboardingStep = 1;
        renderOnboarding();
        return;
    }

    if (action === "onboarding-select") {
        const currentQuestion = getCurrentQuestion();
        const selectedValue = String(trigger.dataset.choiceValue || "");

        if (!currentQuestion || selectedValue === "") {
            return;
        }

        onboardingAnswers = {
            ...onboardingAnswers,
            [currentQuestion.key]: selectedValue
        };
        renderOnboarding();
        return;
    }

    if (action === "onboarding-next") {
        const currentQuestion = getCurrentQuestion();

        if (!currentQuestion || !hasAnsweredStep(currentQuestion.key)) {
            return;
        }

        if (onboardingStep >= ONBOARDING_QUESTIONS.length) {
            onboardingStep = ONBOARDING_FINAL_STEP;
        } else {
            onboardingStep += 1;
        }

        renderOnboarding();
        return;
    }

    if (action === "onboarding-back") {
        if (onboardingStep <= 1) {
            onboardingStep = 0;
        } else {
            onboardingStep -= 1;
        }

        renderOnboarding();
        return;
    }

    if (action === "onboarding-reset") {
        resetOnboardingState();
        renderOnboarding();
    }
}

function renderIntroScreen() {
    return `
        <div class="onboarding-flow">
            <article class="section-panel onboarding-intro">
                <span class="future-section__eyebrow">${escapeHtml("Premiers pas")}</span>
                <div class="section-heading">
                    <div>
                        <h2 id="onboarding-heading" class="section-title" tabindex="-1">${escapeHtml("Entre dans ton parcours")}</h2>
                        <p class="section-intro">${escapeHtml("Avant d'aller plus loin, prends un instant pour sentir ce qui t'appelle. Cet espace est la pour t'accueillir, pas pour t'evaluer.")}</p>
                    </div>
                </div>

                <div class="onboarding-intro__body">
                    <div class="onboarding-intro__copy">
                        <p class="onboarding-intro__lead">${escapeHtml("Quelques questions simples vont t'aider a ouvrir une experience plus proche de toi, de tes liens, de ce que tu portes deja.")}</p>
                        <div class="button-row">
                            <button class="button button-gold" type="button" data-action="onboarding-start">
                                ${escapeHtml("Commencer")}
                            </button>
                            <button class="button button-secondary" type="button" data-action="change-section" data-section="experience">
                                ${escapeHtml("Explorer d'abord")}
                            </button>
                        </div>
                    </div>

                    <div class="onboarding-intro__cards">
                        ${renderIntroCard("Un rythme doux", "Une question a la fois, sans pression ni bonne reponse a trouver.")}
                        ${renderIntroCard("Un ton personnel", "Ici, on parle de lien, de ressenti, de ce qui te ressemble vraiment.")}
                        ${renderIntroCard("Une entree simple", "En quelques instants, tu ouvres une porte vers ton espace et ton parcours.")}
                    </div>
                </div>
            </article>
        </div>
    `;
}

function renderQuestionScreen() {
    const currentQuestion = getCurrentQuestion();
    const questionIndex = onboardingStep - 1;
    const selectedValue = currentQuestion ? onboardingAnswers[currentQuestion.key] ?? null : null;
    const progressValue = currentQuestion ? (onboardingStep / ONBOARDING_QUESTIONS.length) * 100 : 0;

    if (!currentQuestion) {
        resetOnboardingState();
        return renderIntroScreen();
    }

    return `
        <div class="onboarding-flow">
            <article class="section-panel onboarding-step">
                <div class="onboarding-progress" aria-label="${escapeHtml(`Progression ${onboardingStep} sur ${ONBOARDING_QUESTIONS.length}`)}">
                    <div class="onboarding-progress__top">
                        <span>${escapeHtml(`Etape ${onboardingStep}`)}</span>
                        <span>${escapeHtml(`${onboardingStep} / ${ONBOARDING_QUESTIONS.length}`)}</span>
                    </div>
                    <div class="onboarding-progress__bar">
                        <span class="onboarding-progress__value" style="width: ${progressValue}%;"></span>
                    </div>
                </div>

                <div class="section-heading">
                    <div>
                        <h2 id="onboarding-heading" class="section-title" tabindex="-1">${escapeHtml(currentQuestion.title)}</h2>
                        <p class="section-intro">${escapeHtml(currentQuestion.text)}</p>
                    </div>
                </div>

                <div class="onboarding-choice-grid">
                    ${currentQuestion.options.map((option) => `
                        <button
                            class="onboarding-choice ${selectedValue === option.value ? "is-selected" : ""}"
                            type="button"
                            data-action="onboarding-select"
                            data-choice-value="${escapeHtml(option.value)}"
                            aria-pressed="${selectedValue === option.value ? "true" : "false"}"
                        >
                            <span class="onboarding-choice__title">${escapeHtml(option.label)}</span>
                            <span class="onboarding-choice__text">${escapeHtml(option.caption)}</span>
                        </button>
                    `).join("")}
                </div>

                <div class="button-row">
                    <button class="button button-ghost" type="button" data-action="onboarding-back">
                        ${escapeHtml("Retour")}
                    </button>
                    <button class="button button-gold" type="button" data-action="onboarding-next" ${selectedValue === null ? "disabled" : ""}>
                        ${escapeHtml(questionIndex === ONBOARDING_QUESTIONS.length - 1 ? "Terminer" : "Continuer")}
                    </button>
                </div>
            </article>
        </div>
    `;
}

function renderCompleteScreen() {
    const summaryItems = ONBOARDING_QUESTIONS.map((question) => {
        const answer = question.options.find((option) => option.value === onboardingAnswers[question.key]);

        return {
            title: question.title,
            value: answer?.label || "A definir"
        };
    });

    return `
        <div class="onboarding-flow">
            <article class="section-panel onboarding-complete">
                <span class="future-section__eyebrow">${escapeHtml("Ton point de depart")}</span>
                <div class="section-heading">
                    <div>
                        <h2 id="onboarding-heading" class="section-title" tabindex="-1">${escapeHtml("Ton parcours commence ici.")}</h2>
                        <p class="section-intro">${escapeHtml("Tu as pose quelques premiers reperes. La suite peut maintenant s'ouvrir a ton rythme, sans pression.")}</p>
                    </div>
                </div>

                <div class="onboarding-summary">
                    ${summaryItems.map((item) => `
                        <article class="card onboarding-summary__card">
                            <p class="onboarding-summary__label">${escapeHtml(item.title)}</p>
                            <p class="onboarding-summary__value">${escapeHtml(item.value)}</p>
                        </article>
                    `).join("")}
                </div>

                <div class="onboarding-complete__note">
                    <p>${escapeHtml("Garde ce premier elan. Tu peux maintenant entrer dans l'experience ou retrouver ton espace pour continuer doucement.")}</p>
                </div>

                <div class="button-row">
                    <button class="button button-secondary" type="button" data-action="change-section" data-section="experience">
                        ${escapeHtml("Entrer dans l'experience")}
                    </button>
                    <button class="button button-gold" type="button" data-action="change-section" data-section="dashboard">
                        ${escapeHtml("Voir mon espace")}
                    </button>
                    <button class="button button-ghost" type="button" data-action="onboarding-reset">
                        ${escapeHtml("Recommencer")}
                    </button>
                </div>
            </article>
        </div>
    `;
}

function renderIntroCard(title, text) {
    return `
        <article class="card onboarding-intro__card">
            <h3 class="onboarding-intro__card-title">${escapeHtml(title)}</h3>
            <p class="onboarding-intro__card-text">${escapeHtml(text)}</p>
        </article>
    `;
}

function getCurrentQuestion() {
    if (!isQuestionStep(onboardingStep)) {
        return null;
    }

    return ONBOARDING_QUESTIONS[onboardingStep - 1] || null;
}

function isQuestionStep(step) {
    return step >= 1 && step <= ONBOARDING_QUESTIONS.length;
}

function hasAnsweredStep(stepKey) {
    return typeof onboardingAnswers[stepKey] === "string" && onboardingAnswers[stepKey] !== "";
}

function resetOnboardingState() {
    onboardingStep = 0;
    onboardingAnswers = {};
}
