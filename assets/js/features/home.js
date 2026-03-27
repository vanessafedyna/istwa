import { escapeHtml } from "../core/ui.js";

const PROMISE_ITEMS = [
    {
        title: "Découvre ton parcours",
        text: "Entre dans une expérience pensée pour t'aider à relier ce que tu ressens, ce que tu cherches et ce que tu veux comprendre."
    },
    {
        title: "Reconnecte-toi à tes racines",
        text: "Retrouve des points d'ancrage, des échos et des repères qui parlent à ton histoire intime avant de parler au monde."
    },
    {
        title: "Explore à ton rythme",
        text: "Ici, tu n'as rien à prouver. Tu avances doucement, à ton rythme, avec curiosité, émotion et liberté."
    }
];

const EXPLORE_ITEMS = [
    {
        section: "onboarding",
        kicker: "Premiers pas",
        title: "Commence ton voyage",
        text: "Une entrée douce pour te sentir accueilli, guidé et prêt à ouvrir ce qui t'appelle."
    },
    {
        section: "experience",
        kicker: "Expérience",
        title: "Explore ce qui te façonne",
        text: "Une traversée plus personnelle, centrée sur la mémoire, le lien et ce qui résonne en toi."
    },
    {
        section: "map",
        kicker: "Carte",
        title: "Retrouve tes points d'ancrage",
        text: "Une autre manière de te repérer, entre lieux, traces et sensations."
    },
    {
        section: "missions",
        kicker: "Missions",
        title: "Transforme l'élan en mouvement",
        text: "Des invitations simples pour prolonger le voyage dans le réel, sans pression."
    }
];

export function renderHome() {
    const homeSection = document.getElementById("home-section");

    if (!homeSection) {
        return;
    }

    homeSection.innerHTML = `
        <div class="home-landing">
            <article class="home-hero hero-panel">
                <div class="hero-panel__content">
                    <span class="hero-panel__eyebrow">${escapeHtml("ISTWA")}</span>
                    <h2 id="home-heading" class="hero-panel__title" tabindex="-1">${escapeHtml("Retrouve les fils de ton histoire.")}</h2>
                    <p class="hero-panel__lead home-hero__lead">${escapeHtml("ISTWA t'invite dans un voyage intime pour te reconnecter à tes racines, comprendre ce qui t'habite, et sentir que ton histoire te parle aussi personnellement.")}</p>

                    <div class="button-row">
                        <button class="button button-gold" type="button" data-action="change-section" data-section="onboarding">
                            ${escapeHtml("Commencer le parcours")}
                        </button>
                        <button class="button button-secondary" type="button" data-action="change-section" data-section="experience">
                            ${escapeHtml("Entrer dans l'expérience")}
                        </button>
                    </div>
                </div>

                <aside class="hero-panel__aside home-hero__aside">
                    <div class="home-hero__quote hero-panel__quote">
                        ${escapeHtml("Ton histoire ne commence pas ici. Elle t'habite déjà, parfois en silence, parfois comme un appel.")}
                    </div>

                    <div class="home-hero__signals">
                        <article class="stat-card">
                            <span class="stat-card__value">${escapeHtml("Intime")}</span>
                            <span class="stat-card__label">${escapeHtml("Une expérience pensée pour te parler de toi.")}</span>
                        </article>
                        <article class="stat-card">
                            <span class="stat-card__value">${escapeHtml("Vivante")}</span>
                            <span class="stat-card__label">${escapeHtml("Un chemin fait d'exploration, de lien et de présence.")}</span>
                        </article>
                    </div>
                </aside>
            </article>

            <article class="section-panel home-section home-promise">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml("Ce que tu vas vivre ici")}</h3>
                        <p class="section-intro">${escapeHtml("Une expérience plus sensible que scolaire, plus proche de l'écoute de soi que d'un simple parcours à consommer.")}</p>
                    </div>
                </div>

                <div class="home-promise__grid">
                    ${PROMISE_ITEMS.map((item) => `
                        <article class="card home-promise__card">
                            <h4 class="home-promise__title">${escapeHtml(item.title)}</h4>
                            <p class="home-promise__text">${escapeHtml(item.text)}</p>
                        </article>
                    `).join("")}
                </div>
            </article>

            <article class="section-panel home-section home-explore">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml("Explore ton parcours")}</h3>
                        <p class="section-intro">${escapeHtml("Découvre les grandes portes d'entrée de l'expérience et laisse-toi guider vers ce qui résonne le plus en toi aujourd'hui.")}</p>
                    </div>
                </div>

                <div class="home-explore__grid">
                    ${EXPLORE_ITEMS.map((item) => `
                        <article class="card home-explore__card">
                            <p class="home-explore__kicker">${escapeHtml(item.kicker)}</p>
                            <h4 class="home-explore__title">${escapeHtml(item.title)}</h4>
                            <p class="home-explore__text">${escapeHtml(item.text)}</p>
                            <button class="button button-ghost" type="button" data-action="change-section" data-section="${escapeHtml(item.section)}">
                                ${escapeHtml("Ouvrir")}
                            </button>
                        </article>
                    `).join("")}
                </div>
            </article>

            <article class="section-panel home-section home-reflection">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml("Parce que cela parle de toi")}</h3>
                        <p class="section-intro">${escapeHtml("ISTWA n'est pas pensé comme un sujet à apprendre de loin, mais comme un espace pour sentir, reconnaître et habiter ce qui te relie à tes racines.")}</p>
                    </div>
                </div>

                <blockquote class="home-reflection__quote">${escapeHtml("Il y a parfois, au fond de soi, une mémoire sans mots. Cette expérience est là pour l'approcher avec douceur.")}</blockquote>
            </article>

            <article class="section-panel home-section home-final-cta">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml("Commence un voyage vers tes racines")}</h3>
                        <p class="section-intro">${escapeHtml("Fais le premier pas. Le reste viendra ensuite, à ton rythme, dans une expérience plus personnelle, plus vivante et plus ancrée.")}</p>
                    </div>
                </div>

                <div class="button-row">
                    <button class="button button-gold" type="button" data-action="change-section" data-section="onboarding">
                        ${escapeHtml("Commencer maintenant")}
                    </button>
                    <button class="button button-ghost" type="button" data-action="change-section" data-section="map">
                        ${escapeHtml("Voir la carte")}
                    </button>
                </div>
            </article>
        </div>
    `;
}
