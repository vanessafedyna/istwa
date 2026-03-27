import { escapeHtml } from "../core/ui.js";

const DASHBOARD_CARDS = [
    {
        title: "Retrouve tes repères",
        text: "Un espace calme pour voir ce qui t'appelle aujourd'hui et reprendre là où tu en es."
    },
    {
        title: "Garde le fil",
        text: "Tes élans, tes découvertes et tes étapes futures pourront se rassembler ici."
    },
    {
        title: "Reste proche de toi",
        text: "Ce tableau de bord deviendra peu à peu un miroir simple de ton cheminement."
    }
];

export function renderDashboard() {
    const section = document.getElementById("dashboard-section");

    if (!section) {
        return;
    }

    section.innerHTML = `
        <div class="future-section">
            <article class="section-panel future-section__hero">
                <span class="future-section__eyebrow">${escapeHtml("Mon espace")}</span>
                <div class="section-heading">
                    <div>
                        <h2 id="dashboard-heading" class="section-title" tabindex="-1">${escapeHtml("Un espace qui t'appartient")}</h2>
                        <p class="section-intro">${escapeHtml("Ici, ton parcours prendra forme : ce que tu explores, ce que tu ressens, ce que tu choisis d'approfondir.")}</p>
                    </div>
                </div>
                <div class="button-row">
                    <button class="button button-gold" type="button" data-action="change-section" data-section="experience">
                        ${escapeHtml("Entrer dans l'expérience")}
                    </button>
                </div>
            </article>

            <div class="future-section__grid">
                ${DASHBOARD_CARDS.map((card) => `
                    <article class="card future-section__card">
                        <h3 class="future-section__card-title">${escapeHtml(card.title)}</h3>
                        <p class="future-section__card-text">${escapeHtml(card.text)}</p>
                    </article>
                `).join("")}
            </div>
        </div>
    `;
}
