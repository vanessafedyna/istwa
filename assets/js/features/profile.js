import { escapeHtml } from "../core/ui.js";
import { getOnboardingProfileSnapshot } from "./onboarding.js";
import { getMissionsProfileSnapshot } from "./missions.js";

export function renderProfile() {
    const section = document.getElementById("profile-section");

    if (!section) {
        return;
    }

    const onboardingSnapshot = getOnboardingProfileSnapshot();
    const missionsSnapshot = getMissionsProfileSnapshot();
    const hasTraces = missionsSnapshot.traces.length > 0;

    section.innerHTML = `
        <div class="profile-space">
            <article class="section-panel profile-space__hero">
                <span class="future-section__eyebrow">${escapeHtml("Profil")}</span>
                <div class="section-heading">
                    <div>
                        <h2 id="profile-heading" class="section-title" tabindex="-1">${escapeHtml("Ton parcours continue")}</h2>
                        <p class="section-intro">${escapeHtml("Ici, tu retrouves ce qui a deja bouge en toi : les premiers reperes, les gestes que tu peux reprendre, et les phrases que tu veux garder pres de toi.")}</p>
                    </div>
                </div>
                <p class="profile-space__bridge">${escapeHtml("Rien n'a besoin d'etre complet pour avoir deja une place ici. Ton profil rassemble simplement ce qui commence a te ressembler.")}</p>
            </article>

            <div class="profile-space__grid">
                <div class="profile-space__column profile-space__column--story">
                    <article class="section-panel profile-story">
                        <span class="profile-section__eyebrow">${escapeHtml("Identite")}</span>
                        <h3 class="profile-section__title">${escapeHtml("Les reperes que tu as poses")}</h3>
                        <div class="profile-story__lines">
                            ${renderOnboardingNarrative(onboardingSnapshot)}
                        </div>
                    </article>

                    <article class="section-panel profile-traces ${hasTraces ? "profile-traces--filled" : "profile-traces--empty"}">
                        <span class="profile-section__eyebrow">${escapeHtml("Traces")}</span>
                        <h3 class="profile-section__title">${escapeHtml("Ce que tu as deja laisse ici")}</h3>
                        <p class="profile-traces__intro">${escapeHtml(hasTraces
                            ? "Quelques mots ont deja pris place ici. Ils ne disent pas tout, mais ils gardent quelque chose de toi."
                            : "Les mots que tu laisseras ici n'ont pas besoin d'etre nombreux. Une phrase peut deja devenir un repere.")}</p>
                        <div class="profile-traces__grid">
                            ${renderTraceCards(missionsSnapshot.traces)}
                        </div>
                    </article>
                </div>

                <div class="profile-space__column profile-space__column--memory">
                    <article class="section-panel profile-missions">
                        <span class="profile-section__eyebrow">${escapeHtml("Missions")}</span>
                        <h3 class="profile-section__title">${escapeHtml("Les gestes que tu peux reprendre")}</h3>
                        <p class="profile-missions__intro">${escapeHtml("Ce ne sont pas des taches a cocher, juste des ouvertures que tu peux retrouver quand quelque chose t'appelle encore.")}</p>
                        <div class="profile-missions__list">
                            ${missionsSnapshot.missions.map((mission, index) => `
                                <article class="card profile-mission-card ${getMissionCardClassName(mission.status, index)}">
                                    <div class="profile-mission-card__top">
                                        <div>
                                            <h4 class="profile-mission-card__title">${escapeHtml(mission.title)}</h4>
                                            <p class="profile-mission-card__text">${escapeHtml(mission.text)}</p>
                                        </div>
                                        <span class="profile-status-pill ${getMissionStatusClassName(mission.status)}">${escapeHtml(getMissionStatusLabel(mission.status))}</span>
                                    </div>
                                    <p class="profile-mission-card__note">${escapeHtml(getMissionStatusText(mission.status, mission.note))}</p>
                                    <button
                                        class="button ${getMissionButtonClassName(mission.status)}"
                                        type="button"
                                        data-action="profile-open-mission"
                                        data-mission-id="${escapeHtml(mission.id)}"
                                    >
                                        ${escapeHtml(getMissionActionLabel(mission.status))}
                                    </button>
                                </article>
                            `).join("")}
                        </div>
                    </article>

                    <article class="section-panel profile-future">
                        <span class="profile-section__eyebrow">${escapeHtml("A venir")}</span>
                        <h3 class="profile-section__title">${escapeHtml("D'autres choses prendront forme ici")}</h3>
                        <p class="profile-future__text">${escapeHtml("Ton espace personnel pourra accueillir plus tard d'autres traces, d'autres fragments, et des liens qui se dessineront a mesure que tu avanceras.")}</p>
                    </article>
                </div>
            </div>
        </div>
    `;
}

function renderOnboardingNarrative(snapshot) {
    if (!snapshot.hasStarted) {
        return `
            <article class="card profile-story__line">
                <p>${escapeHtml("Il reste encore un premier repere a poser. Pas pour te definir, mais pour sentir d'ou tu veux partir et ce qui te parle deja.")}</p>
                <div class="button-row">
                    <button class="button button-gold" type="button" data-action="change-section" data-section="onboarding">
                        ${escapeHtml("Commencer l'onboarding")}
                    </button>
                </div>
            </article>
        `;
    }

    const homeAnswer = getOnboardingAnswerLabel(snapshot, "home");
    const exploreAnswer = getOnboardingAnswerLabel(snapshot, "explore");
    const paceAnswer = getOnboardingAnswerLabel(snapshot, "pace");
    const lines = [];

    if (homeAnswer) {
        lines.push(`Aujourd'hui, tu te reconnais surtout dans ${homeAnswer.toLowerCase()}.`);
    }

    if (exploreAnswer) {
        lines.push(`Ce qui t'attire le plus pour l'instant, c'est ${exploreAnswer.toLowerCase()}.`);
    }

    if (paceAnswer) {
        lines.push(`Tu avances plutot en choisissant ${paceAnswer.toLowerCase()}.`);
    }

    lines.push(snapshot.isComplete
        ? "Tu as deja pose un premier cadre sensible. La suite peut maintenant s'ouvrir plus librement."
        : "Ton point de depart est encore en train de se dessiner, et c'est deja une facon d'entrer dans le parcours.");

    return `
        ${lines.map((line) => `
            <article class="card profile-story__line">
                <p>${escapeHtml(line)}</p>
            </article>
        `).join("")}
        <div class="button-row">
            <button class="button button-secondary" type="button" data-action="change-section" data-section="onboarding">
                ${escapeHtml(snapshot.isComplete ? "Revenir a mes reperes" : "Continuer l'onboarding")}
            </button>
        </div>
    `;
}

function renderTraceCards(traces) {
    if (traces.length === 0) {
        return `
            <article class="card profile-trace-card profile-trace-card--empty">
                <p class="profile-trace-card__text">${escapeHtml("Tes premieres phrases apparaitront ici. Une mission, un mot garde, une note pour toi.")}</p>
            </article>
        `;
    }

    return traces.map((trace, index) => `
        <article class="card profile-trace-card ${index === 0 ? "profile-trace-card--featured" : ""}">
            <p class="profile-trace-card__mission">${escapeHtml(trace.title)}</p>
            <p class="profile-trace-card__text">${escapeHtml(`"${trace.excerpt}"`)}</p>
        </article>
    `).join("");
}

function getOnboardingAnswerLabel(snapshot, key) {
    return snapshot.answers.find((answer) => answer.key === key)?.label || null;
}

function getMissionStatusLabel(status) {
    if (status === "completed") {
        return "Deja la";
    }

    if (status === "in_progress") {
        return "En cours";
    }

    return "A ouvrir";
}

function getMissionStatusClassName(status) {
    if (status === "completed") {
        return "is-completed";
    }

    if (status === "in_progress") {
        return "is-progress";
    }

    return "is-available";
}

function getMissionActionLabel(status) {
    if (status === "completed") {
        return "Retrouver ce geste";
    }

    if (status === "in_progress") {
        return "Revenir la ou j'en suis";
    }

    return "Ouvrir ce geste";
}

function getMissionStatusText(status, note) {
    if (status === "completed" && note) {
        return "Une trace est deja la. Tu peux revenir a cet elan quand tu veux.";
    }

    if (status === "in_progress") {
        return "Quelque chose est deja ouvert ici. Tu peux le reprendre sans repartir de zero.";
    }

    return "Cette mission reste disponible comme une invitation simple, a ton rythme.";
}

function getMissionButtonClassName(status) {
    if (status === "completed") {
        return "button-ghost";
    }

    if (status === "in_progress") {
        return "button-secondary";
    }

    return "button-gold";
}

function getMissionCardClassName(status, index) {
    if (status === "completed") {
        return "is-completed";
    }

    if (status === "in_progress") {
        return "is-progress";
    }

    return index % 2 === 0 ? "is-soft" : "is-warm";
}
