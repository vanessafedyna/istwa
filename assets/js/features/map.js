import { escapeHtml } from "../core/ui.js";

const MAP_POINTS = [
    {
        id: "haiti",
        label: "Haiti",
        kicker: "Point d'origine",
        x: 31,
        y: 58,
        description: "La ou certaines histoires commencent, meme si tu n'y as pas grandi."
    },
    {
        id: "montreal",
        label: "Montreal",
        kicker: "Point de presence",
        x: 62,
        y: 19,
        description: "Un espace ou les racines continuent de vivre autrement."
    },
    {
        id: "miami",
        label: "Miami",
        kicker: "Point de passage",
        x: 38,
        y: 49,
        description: "Un lieu de circulation, de traces, de passages qui changent la facon d'habiter le monde."
    },
    {
        id: "paris",
        label: "Paris",
        kicker: "Point d'echo",
        x: 82,
        y: 27,
        description: "Un ailleurs ou certaines voix, certains liens et certaines absences prennent une autre forme."
    }
];

let selectedPointId = "haiti";

export function renderMap() {
    const section = document.getElementById("map-section");
    const selectedPoint = getSelectedPoint();

    if (!section || !selectedPoint) {
        return;
    }

    section.onclick = handleMapClick;
    section.innerHTML = `
        <div class="map-experience">
            <article class="section-panel map-experience__hero">
                <span class="future-section__eyebrow">${escapeHtml("Carte sensible")}</span>
                <div class="section-heading">
                    <div>
                        <h2 id="map-heading" class="section-title" tabindex="-1">${escapeHtml("Les chemins qui te relient")}</h2>
                        <p class="section-intro">${escapeHtml("Cette carte ne cherche pas a tout montrer. Elle fait apparaitre quelques points de lien, comme des presences qui se repondent a travers les distances.")}</p>
                    </div>
                </div>
            </article>

            <div class="map-experience__layout">
                <article class="section-panel map-scene-card">
                    <div class="map-scene" role="group" aria-label="${escapeHtml("Carte symbolique de la diaspora")}">
                        <svg class="map-scene__lines" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
                            <path d="M 31 58 C 34 52, 36 50, 38 49" />
                            <path d="M 31 58 C 39 44, 50 29, 62 19" />
                            <path d="M 31 58 C 46 47, 63 34, 82 27" />
                            <path d="M 31 58 C 44 57, 57 55, 82 27" />
                            <path d="M 38 49 C 48 39, 56 26, 62 19" />
                            <path d="M 62 19 C 70 18, 76 21, 82 27" />
                        </svg>

                        ${MAP_POINTS.map((point) => `
                            <button
                                class="map-point ${point.id === selectedPointId ? "is-selected" : ""}"
                                type="button"
                                data-action="map-select"
                                data-point-id="${escapeHtml(point.id)}"
                                style="left: ${point.x}%; top: ${point.y}%;"
                                aria-pressed="${point.id === selectedPointId ? "true" : "false"}"
                                aria-label="${escapeHtml(point.label)}"
                            >
                                <span class="map-point__pulse" aria-hidden="true"></span>
                                <span class="map-point__dot" aria-hidden="true"></span>
                                <span class="map-point__label">${escapeHtml(point.label)}</span>
                            </button>
                        `).join("")}
                    </div>

                    <p class="map-scene-card__hint">${escapeHtml("Clique sur un point pour faire apparaitre ce qu'il evoque.")}</p>
                </article>

                <article class="section-panel map-detail-card">
                    <span class="map-detail-card__kicker">${escapeHtml(selectedPoint.kicker)}</span>
                    <h3 class="map-detail-card__title">${escapeHtml(selectedPoint.label)}</h3>
                    <p class="map-detail-card__text">${escapeHtml(selectedPoint.description)}</p>
                    <div class="map-detail-card__chips">
                        ${MAP_POINTS.map((point) => `
                            <button
                                class="map-chip ${point.id === selectedPointId ? "is-selected" : ""}"
                                type="button"
                                data-action="map-select"
                                data-point-id="${escapeHtml(point.id)}"
                                aria-pressed="${point.id === selectedPointId ? "true" : "false"}"
                            >
                                ${escapeHtml(point.label)}
                            </button>
                        `).join("")}
                    </div>
                </article>
            </div>
        </div>
    `;
}

function handleMapClick(event) {
    const trigger = event.target.closest('[data-action="map-select"]');

    if (!trigger) {
        return;
    }

    const pointId = String(trigger.dataset.pointId || "");

    if (!pointId || !MAP_POINTS.some((point) => point.id === pointId)) {
        return;
    }

    selectedPointId = pointId;
    renderMap();
}

function getSelectedPoint() {
    return MAP_POINTS.find((point) => point.id === selectedPointId) || MAP_POINTS[0] || null;
}
