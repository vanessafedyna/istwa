import { escapeHtml } from "../core/ui.js";
import { appState } from "../core/state.js";

const MISSIONS = [
    {
        id: "proche",
        title: "Parle a un proche",
        text: "Parfois, un lien se revele dans une conversation simple, presque ordinaire.",
        actionLabel: "Ouvrir la mission",
        instruction: "Demande a quelqu'un de ta famille quel souvenir il ou elle garde d'un lieu, d'un depart ou d'un mot.",
        prompts: [
            "Quel lieu t'a le plus marque ?",
            "Quel mot te ramene quelque part ?",
            "Qu'est-ce que tu voudrais me transmettre ?"
        ],
        notePlaceholder: "Note ici le lieu, le mot ou la phrase que tu veux garder."
    },
    {
        id: "mot",
        title: "Retrouve un mot important",
        text: "Un seul mot peut parfois ouvrir une porte la ou tout semblait encore flou.",
        actionLabel: "Choisir cette mission",
        instruction: "Choisis un mot qui te relie a ton histoire, meme si tu ne sais pas encore pourquoi.",
        prompts: [
            "un mot entendu souvent",
            "un mot oublie",
            "un mot qui te suit"
        ],
        notePlaceholder: "Ecris le mot ici, meme si tu ne sais pas encore ce qu'il ouvre."
    },
    {
        id: "ressens",
        title: "Note ce que tu ressens",
        text: "Ce que tu ressens compte aussi. Le parcours avance parfois par une phrase tres simple.",
        actionLabel: "Entrer dans la mission",
        instruction: "Ecris une phrase sur ce que cette exploration remue ou eclaire en toi.",
        prompts: [
            "ce que tu decouvres",
            "ce qui te manque",
            "ce qui t'appelle"
        ],
        notePlaceholder: "Une phrase suffit. Meme breve, meme inachevee."
    }
];

let activeMissionId = null;

export function getMissionsProfileSnapshot() {
    const missions = MISSIONS.map((mission) => {
        const note = getMeaningfulMissionNote(getMissionNoteValue(mission.id), mission.notePlaceholder);
        const status = note !== ""
            ? "completed"
            : activeMissionId === mission.id
                ? "in_progress"
                : "available";

        return {
            id: mission.id,
            title: mission.title,
            text: mission.text,
            status,
            note
        };
    });

    return {
        activeMissionId,
        missions,
        traces: missions
            .filter((mission) => mission.note !== "")
            .map((mission) => ({
                missionId: mission.id,
                title: mission.title,
                note: mission.note
            }))
    };
}

export function openMissionById(missionId) {
    if (!MISSIONS.some((mission) => mission.id === missionId)) {
        return false;
    }

    activeMissionId = missionId;
    return true;
}

export function renderMissions() {
    const section = document.getElementById("missions-section");
    const activeMission = getActiveMission();

    if (!section) {
        return;
    }

    section.onclick = handleMissionClick;
    section.oninput = handleMissionInput;
    section.innerHTML = `
        <div class="missions-space ${activeMission ? "has-active-mission" : ""}">
            <article class="section-panel missions-space__hero">
                <span class="future-section__eyebrow">${escapeHtml("Missions")}</span>
                <div class="section-heading">
                    <div>
                        <h2 id="missions-heading" class="section-title" tabindex="-1">${escapeHtml("Les petits gestes comptent aussi")}</h2>
                        <p class="section-intro">${escapeHtml("Certaines decouvertes ne passent pas par de grandes reponses. Elles commencent parfois par une question, un mot ou une note que tu t'accordes enfin.")}</p>
                    </div>
                </div>
            </article>

            <div class="missions-grid">
                ${MISSIONS.map((mission) => `
                    <article class="card missions-card ${mission.id === activeMissionId ? "is-active" : ""}">
                        <span class="missions-card__kicker">${escapeHtml("Mission")}</span>
                        <h3 class="missions-card__title">${escapeHtml(mission.title)}</h3>
                        <p class="missions-card__text">${escapeHtml(mission.text)}</p>
                        ${mission.id === activeMissionId
                            ? `<p class="missions-card__status">${escapeHtml("En cours")}</p>`
                            : `
                                <button
                                    class="button button-gold"
                                    type="button"
                                    data-action="mission-open"
                                    data-mission-id="${escapeHtml(mission.id)}"
                                >
                                    ${escapeHtml(mission.actionLabel)}
                                </button>
                            `
                        }
                    </article>
                `).join("")}
            </div>

            ${activeMission ? renderMissionDetail(activeMission) : ""}
        </div>
    `;
}

function handleMissionClick(event) {
    const trigger = event.target.closest("[data-action]");

    if (!trigger) {
        return;
    }

    const action = trigger.dataset.action;

    if (action === "mission-open") {
        const missionId = String(trigger.dataset.missionId || "");

        if (!MISSIONS.some((mission) => mission.id === missionId)) {
            return;
        }

        activeMissionId = missionId;
        renderMissions();
        return;
    }

    if (action === "mission-close") {
        activeMissionId = null;
        renderMissions();
    }
}

function handleMissionInput(event) {
    const target = event.target;

    if (!(target instanceof HTMLTextAreaElement) || target.name !== "mission-note") {
        return;
    }

    const missionId = String(target.dataset.missionId || "");

    if (!MISSIONS.some((mission) => mission.id === missionId)) {
        return;
    }

    appState.missionNotes = {
        ...(appState.missionNotes || {}),
        [missionId]: target.value
    };

    const status = target.closest(".missions-detail__reflection")?.querySelector("[data-mission-note-status]");

    if (status) {
        status.textContent = getMissionNoteStatus(target.value);
    }
}

function renderMissionDetail(mission) {
    const noteValue = getMissionNoteValue(mission.id);

    return `
        <article class="section-panel missions-detail">
            <div class="missions-detail__frame">
                <div class="missions-detail__content">
                    <span class="missions-detail__kicker">${escapeHtml("Mission active")}</span>
                    <div class="section-heading">
                        <div>
                            <h3 class="section-title missions-detail__title">${escapeHtml(mission.title)}</h3>
                            <p class="section-intro">${escapeHtml(mission.instruction)}</p>
                        </div>
                    </div>

                    <div class="missions-detail__body">
                        ${mission.prompts.map((prompt, index) => `
                            <article class="card missions-detail__prompt">
                                <span class="missions-detail__prompt-index">${escapeHtml(`Piste ${index + 1}`)}</span>
                                <p>${escapeHtml(prompt)}</p>
                            </article>
                        `).join("")}
                    </div>
                </div>

                <aside class="card missions-detail__reflection">
                    <p class="missions-detail__reflection-kicker">${escapeHtml("Ta trace du moment")}</p>
                    <p class="missions-detail__reflection-text">${escapeHtml("Laisse ici un mot, une image ou une phrase. Rien a remplir parfaitement, juste quelque chose a garder pres de toi.")}</p>
                    <label class="missions-detail__label" for="${escapeHtml(`mission-note-${mission.id}`)}">${escapeHtml("Ta note")}</label>
                    <textarea
                        id="${escapeHtml(`mission-note-${mission.id}`)}"
                        name="mission-note"
                        data-mission-id="${escapeHtml(mission.id)}"
                        placeholder="${escapeHtml(mission.notePlaceholder)}"
                    >${escapeHtml(noteValue)}</textarea>
                    <p class="missions-detail__status" data-mission-note-status>${escapeHtml(getMissionNoteStatus(noteValue))}</p>
                </aside>
            </div>

            <div class="button-row">
                <button class="button button-ghost" type="button" data-action="mission-close">
                    ${escapeHtml("Retour aux missions")}
                </button>
            </div>
        </article>
    `;
}

function getActiveMission() {
    return MISSIONS.find((mission) => mission.id === activeMissionId) || null;
}

function getMissionNoteValue(missionId) {
    const missionNotes = appState.missionNotes || {};
    return typeof missionNotes[missionId] === "string" ? missionNotes[missionId] : "";
}

function getMissionNoteStatus(value) {
    const trimmedValue = String(value || "").trim();

    if (trimmedValue === "") {
        return "Laisse une phrase, meme breve. Elle peut rester ouverte.";
    }

    const characterCount = trimmedValue.length;
    const suffix = characterCount > 1 ? "s" : "";

    return `${characterCount} caractere${suffix} garde${suffix} pour toi.`;
}

function getMeaningfulMissionNote(value, placeholder) {
    const normalizedValue = normalizeMissionNote(value);
    const normalizedPlaceholder = normalizeMissionNote(placeholder);

    if (normalizedValue === "") {
        return "";
    }

    if (normalizedPlaceholder !== "" && normalizedValue.toLowerCase() === normalizedPlaceholder.toLowerCase()) {
        return "";
    }

    return normalizedValue;
}

function normalizeMissionNote(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

