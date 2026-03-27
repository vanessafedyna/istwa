import { escapeHtml } from "../core/ui.js";

const EXPERIENCE_QUESTIONS = [
    {
        key: "thread",
        progress: "1 / 2",
        title: "Quel fil veux-tu suivre ?",
        text: "Choisis ce qui te parle le plus maintenant. Rien n'est fige, c'est juste une premiere porte.",
        options: [
            {
                value: "memoire",
                label: "Memoire",
                caption: "Ce qui reste, ce qui revient, ce qui traverse le temps en silence."
            },
            {
                value: "famille",
                label: "Famille",
                caption: "Les voix, les gestes, les liens et tout ce qui continue de vivre en toi."
            },
            {
                value: "langues",
                label: "Langues",
                caption: "Les mots que tu portes, ceux que tu comprends, et ceux qui te manquent parfois."
            },
            {
                value: "heritage",
                label: "Heritage",
                caption: "Ce que tu recois sans toujours le nommer, mais qui t'accompagne deja."
            }
        ]
    },
    {
        key: "call",
        progress: "2 / 2",
        title: "Qu'est-ce qui t'appelle le plus aujourd'hui ?",
        text: "Suis l'elan le plus present, meme s'il est flou. L'experience commence souvent comme ca.",
        options: [
            {
                value: "voix",
                label: "Une voix",
                caption: "Quelque chose a entendre, a retrouver, a laisser monter doucement."
            },
            {
                value: "lieu",
                label: "Un lieu",
                caption: "Un espace reel ou interieur qui attire ton regard et ton attention."
            },
            {
                value: "souvenir",
                label: "Un souvenir",
                caption: "Une trace vive, precise ou lointaine, qui merite d'etre suivie."
            },
            {
                value: "chemin",
                label: "Un chemin",
                caption: "Une direction encore ouverte, plus ressentie que definie."
            }
        ]
    }
];

const EXPERIENCE_LABELS = {
    thread: "Fil choisi",
    call: "Ce qui t'appelle"
};

let experienceState = 0;
let experienceAnswers = {};

export function renderExperience() {
    const section = document.getElementById("experience-section");

    if (!section) {
        return;
    }

    section.onclick = handleExperienceClick;

    if (experienceState === 1 || experienceState === 2) {
        section.innerHTML = renderQuestionState();
        return;
    }

    if (experienceState === 3) {
        section.innerHTML = renderCompleteState();
        return;
    }

    section.innerHTML = renderIntroState();
}

function handleExperienceClick(event) {
    const trigger = event.target.closest("[data-action]");

    if (!trigger) {
        return;
    }

    const action = trigger.dataset.action;

    if (!action || !action.startsWith("experience-")) {
        return;
    }

    if (action === "experience-start") {
        experienceState = 1;
        renderExperience();
        return;
    }

    if (action === "experience-select") {
        const currentQuestion = getCurrentQuestion();
        const selectedValue = String(trigger.dataset.choiceValue || "");

        if (!currentQuestion || selectedValue === "") {
            return;
        }

        experienceAnswers = {
            ...experienceAnswers,
            [currentQuestion.key]: selectedValue
        };
        renderExperience();
        return;
    }

    if (action === "experience-next") {
        const currentQuestion = getCurrentQuestion();

        if (!currentQuestion || !hasAnswer(currentQuestion.key)) {
            return;
        }

        if (experienceState >= EXPERIENCE_QUESTIONS.length) {
            experienceState = 3;
        } else {
            experienceState += 1;
        }

        renderExperience();
        return;
    }

    if (action === "experience-back") {
        if (experienceState <= 1) {
            experienceState = 0;
        } else {
            experienceState -= 1;
        }

        renderExperience();
        return;
    }

    if (action === "experience-reset") {
        resetExperienceState();
        renderExperience();
    }
}

function renderIntroState() {
    return `
        <div class="onboarding-flow">
            <article class="section-panel onboarding-intro">
                <span class="future-section__eyebrow">${escapeHtml("Experience")}</span>
                <div class="section-heading">
                    <div>
                        <h2 id="experience-heading" class="section-title" tabindex="-1">${escapeHtml("Entre dans ce qui te relie")}</h2>
                        <p class="section-intro">${escapeHtml("Ici, tu ne lis pas une page. Tu suis une sensation, un fil, une presence. Laisse l'experience venir a toi par petites touches.")}</p>
                    </div>
                </div>

                <div class="onboarding-intro__body">
                    <div class="onboarding-intro__copy">
                        <p class="onboarding-intro__lead">${escapeHtml("En deux choix simples, tu vas ouvrir une premiere direction. Pas pour tout definir. Juste pour sentir ce qui appelle ton regard aujourd'hui.")}</p>
                        <div class="button-row">
                            <button class="button button-gold" type="button" data-action="experience-start">
                                ${escapeHtml("Commencer")}
                            </button>
                        </div>
                    </div>

                    <div class="onboarding-intro__cards">
                        ${renderIntroCard("Une entree sensible", "Tu avances par intuition, sans mode d'emploi a suivre.")}
                        ${renderIntroCard("Deux choix, une direction", "L'experience se revele a travers ce qui te touche en premier.")}
                        ${renderIntroCard("Un espace ouvert", "Tu n'arrives pas a une conclusion. Tu ouvres un passage.")}
                    </div>
                </div>
            </article>
        </div>
    `;
}

function renderQuestionState() {
    const currentQuestion = getCurrentQuestion();
    const selectedValue = currentQuestion ? experienceAnswers[currentQuestion.key] ?? null : null;
    const progressValue = experienceState === 1 ? 50 : 100;

    if (!currentQuestion) {
        resetExperienceState();
        return renderIntroState();
    }

    return `
        <div class="onboarding-flow">
            <article class="section-panel onboarding-step">
                <div class="onboarding-progress" aria-label="${escapeHtml(`Progression ${currentQuestion.progress}`)}">
                    <div class="onboarding-progress__top">
                        <span>${escapeHtml("Parcours")}</span>
                        <span>${escapeHtml(currentQuestion.progress)}</span>
                    </div>
                    <div class="onboarding-progress__bar">
                        <span class="onboarding-progress__value" style="width: ${progressValue}%;"></span>
                    </div>
                </div>

                <div class="section-heading">
                    <div>
                        <h2 id="experience-heading" class="section-title" tabindex="-1">${escapeHtml(currentQuestion.title)}</h2>
                        <p class="section-intro">${escapeHtml(currentQuestion.text)}</p>
                    </div>
                </div>

                <div class="onboarding-choice-grid">
                    ${currentQuestion.options.map((option) => `
                        <button
                            class="onboarding-choice ${selectedValue === option.value ? "is-selected" : ""}"
                            type="button"
                            data-action="experience-select"
                            data-choice-value="${escapeHtml(option.value)}"
                            aria-pressed="${selectedValue === option.value ? "true" : "false"}"
                        >
                            <span class="onboarding-choice__title">${escapeHtml(option.label)}</span>
                            <span class="onboarding-choice__text">${escapeHtml(option.caption)}</span>
                        </button>
                    `).join("")}
                </div>

                <div class="button-row">
                    <button class="button button-ghost" type="button" data-action="experience-back">
                        ${escapeHtml("Retour")}
                    </button>
                    <button class="button button-gold" type="button" data-action="experience-next" ${selectedValue === null ? "disabled" : ""}>
                        ${escapeHtml(experienceState === 2 ? "Continuer" : "Continuer")}
                    </button>
                </div>
            </article>
        </div>
    `;
}

function renderCompleteState() {
    const summaryItems = EXPERIENCE_QUESTIONS.map((question) => {
        const selectedOption = question.options.find((option) => option.value === experienceAnswers[question.key]);

        return {
            title: EXPERIENCE_LABELS[question.key] || question.title,
            value: selectedOption?.label || "A definir"
        };
    });

    return `
        <div class="onboarding-flow">
            <article class="section-panel onboarding-complete">
                <span class="future-section__eyebrow">${escapeHtml("Ouverture")}</span>
                <div class="section-heading">
                    <div>
                        <h2 id="experience-heading" class="section-title" tabindex="-1">${escapeHtml("Tu as ouvert une premiere direction")}</h2>
                        <p class="section-intro">${escapeHtml("Tu peux commencer quelque part. Le reste viendra.")}</p>
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
                    <p>${escapeHtml("Ce n'est pas une fin. C'est juste une facon d'entrer plus doucement dans ce qui t'attire aujourd'hui.")}</p>
                </div>

                <div class="button-row">
                    <button class="button button-gold" type="button" data-action="change-section" data-section="map">
                        ${escapeHtml("Aller vers la carte")}
                    </button>
                    <button class="button button-secondary" type="button" data-action="change-section" data-section="missions">
                        ${escapeHtml("Ouvrir les missions")}
                    </button>
                    <button class="button button-ghost" type="button" data-action="experience-reset">
                        ${escapeHtml("Recommencer l'experience")}
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
    if (experienceState !== 1 && experienceState !== 2) {
        return null;
    }

    return EXPERIENCE_QUESTIONS[experienceState - 1] || null;
}

function hasAnswer(questionKey) {
    return typeof experienceAnswers[questionKey] === "string" && experienceAnswers[questionKey] !== "";
}

function resetExperienceState() {
    experienceState = 0;
    experienceAnswers = {};
}
