import { appState } from "../core/state.js";
import { getHeroes } from "../core/content.js";
import { getLocalizedValue, t } from "../core/i18n.js";
import { announce, escapeHtml } from "../core/ui.js";

export function renderHeroes() {
    const heroesSection = document.getElementById("heroes-section");
    const heroes = getHeroes();
    const selectedHero = heroes.find((hero) => hero.id === appState.selectedHeroId);
    const ui = getHeroesUiCopy();

    if (!heroesSection) {
        return;
    }

    if (selectedHero) {
        heroesSection.innerHTML = `
            <article class="section-panel heroes-journey heroes-journey--detail">
                <div class="button-row">
                    <button class="button button-ghost" type="button" data-action="close-hero">
                        ${escapeHtml(t("heroes_back_button"))}
                    </button>
                </div>

                <article class="hero-detail heroes-detail-shell" style="--hero-color: ${escapeHtml(selectedHero.color)};">
                    <header class="hero-detail__header">
                        <div class="hero-detail__intro">
                            <div class="hero-detail__portrait">${escapeHtml(selectedHero.image)}</div>
                            <div>
                                <h2 id="hero-detail-heading" class="hero-detail__name" tabindex="-1">${escapeHtml(getLocalizedValue(selectedHero.name))}</h2>
                                <p class="hero-detail__subtitle">${escapeHtml(getLocalizedValue(selectedHero.role))}</p>
                                <p class="hero-detail__period">${escapeHtml(selectedHero.period)}</p>
                            </div>
                        </div>
                        <div class="heroes-detail__badges">
                            <span class="heroes-detail__badge">${escapeHtml(ui.figureLabel)}</span>
                            <span class="heroes-detail__badge">${escapeHtml(selectedHero.period)}</span>
                        </div>
                    </header>

                    <div class="hero-detail__body">
                        <div>
                            <blockquote class="hero-detail__quote">${escapeHtml(getLocalizedValue(selectedHero.quote))}</blockquote>
                            <div class="button-row">
                                <button
                                    class="button button-gold"
                                    type="button"
                                    data-action="share-hero-quote"
                                    data-hero-id="${escapeHtml(selectedHero.id)}"
                                >
                                    ${escapeHtml(t("share_quote_button"))}
                                </button>
                            </div>
                            <h3 class="detail-block__title">${escapeHtml(t("heroes_biography_title"))}</h3>
                            <p class="hero-detail__text">${escapeHtml(getLocalizedValue(selectedHero.description))}</p>
                        </div>

                        <aside class="heroes-detail__aside">
                            <div class="heroes-impact heroes-impact--detail">
                                <p class="heroes-impact__label">${escapeHtml(ui.impactLabel)}</p>
                                <p class="heroes-impact__text">${escapeHtml(getImpactText(selectedHero))}</p>
                            </div>
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
        <div class="heroes-journey">
            <article class="section-panel heroes-journey__hero">
                <div class="section-heading">
                    <div>
                        <h2 id="heroes-heading" class="section-title" tabindex="-1">${escapeHtml(t("heroes_title"))}</h2>
                        <p class="section-intro">${escapeHtml(t("heroes_intro"))}</p>
                    </div>
                </div>

                <div class="heroes-journey__meta">
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(String(heroes.length))}</span>
                        <span class="stat-card__label">${escapeHtml(ui.figuresLabel)}</span>
                    </article>
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(String(getPeriodsCount(heroes)))}</span>
                        <span class="stat-card__label">${escapeHtml(ui.periodsLabel)}</span>
                    </article>
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(ui.memoryLabel)}</span>
                        <span class="stat-card__label">${escapeHtml(ui.approachLabel)}</span>
                    </article>
                </div>
            </article>

            <article class="section-panel heroes-journey__grid-shell">
                <div class="heroes-grid heroes-grid--narrative">
                    ${heroes.map((hero) => `
                        <article class="hero-card hero-card--narrative" style="--hero-color: ${escapeHtml(hero.color)};">
                            <div class="hero-card__visual">
                                <div class="hero-card__image">${escapeHtml(hero.image)}</div>
                            </div>
                            <div class="hero-card__body">
                                <p class="hero-card__period-tag">${escapeHtml(hero.period)}</p>
                                <h3 class="hero-card__name">${escapeHtml(getLocalizedValue(hero.name))}</h3>
                                <p class="hero-card__role">${escapeHtml(getLocalizedValue(hero.role))}</p>
                                <div class="heroes-impact">
                                    <p class="heroes-impact__label">${escapeHtml(ui.impactLabel)}</p>
                                    <p class="heroes-impact__text">${escapeHtml(getImpactText(hero))}</p>
                                </div>
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
        </div>
    `;
}

function getPeriodsCount(heroes) {
    return new Set(heroes.map((hero) => hero.period)).size;
}

function getImpactText(hero) {
    const highlights = getLocalizedValue(hero.highlights);

    if (Array.isArray(highlights) && highlights.length > 0) {
        return highlights[0];
    }

    const description = String(getLocalizedValue(hero.description) || "");
    const cutIndex = description.indexOf(". ");

    if (cutIndex > 0) {
        return `${description.slice(0, cutIndex + 1)}`;
    }

    return description;
}

function getHeroesUiCopy() {
    const dictionary = {
        fr: {
            figuresLabel: "Figures majeures",
            periodsLabel: "Periodes representees",
            memoryLabel: "Memoire active",
            approachLabel: "Approche",
            impactLabel: "Impact historique",
            figureLabel: "Figure majeure"
        },
        ht: {
            figuresLabel: "Gran figi",
            periodsLabel: "Peryod yo",
            memoryLabel: "Memwa vivan",
            approachLabel: "Apwoch",
            impactLabel: "Enpak istorik",
            figureLabel: "Gran figi"
        },
        en: {
            figuresLabel: "Major figures",
            periodsLabel: "Periods covered",
            memoryLabel: "Living memory",
            approachLabel: "Approach",
            impactLabel: "Historical impact",
            figureLabel: "Major figure"
        }
    };

    return dictionary[appState.language] || dictionary.fr;
}

export function announceHeroOpen() {
    const selectedHero = getHeroes().find((hero) => hero.id === appState.selectedHeroId);

    if (selectedHero) {
        announce(getLocalizedValue(selectedHero.name));
    }
}

export function announceHeroListReturn() {
    const heroesHeading = document.getElementById("heroes-heading");

    if (heroesHeading) {
        announce(heroesHeading.textContent.trim());
    }
}
