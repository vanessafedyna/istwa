import { appState } from "../core/state.js";
import { getHeroes } from "../core/content.js";
import { getLocalizedValue, t } from "../core/i18n.js";
import { announce, escapeHtml } from "../core/ui.js";

export function renderHeroes() {
    const heroesSection = document.getElementById("heroes-section");
    const heroes = getHeroes();
    const selectedHero = heroes.find((hero) => hero.id === appState.selectedHeroId);

    if (!heroesSection) {
        return;
    }

    if (selectedHero) {
        heroesSection.innerHTML = `
            <article class="section-panel">
                <div class="button-row">
                    <button class="button button-ghost" type="button" data-action="close-hero">
                        ${escapeHtml(t("heroes_back_button"))}
                    </button>
                </div>

                <article class="hero-detail" style="--hero-color: ${escapeHtml(selectedHero.color)};">
                    <header class="hero-detail__header">
                        <div class="hero-detail__intro">
                            <div class="hero-detail__portrait">${escapeHtml(selectedHero.image)}</div>
                            <div>
                                <h2 id="hero-detail-heading" class="hero-detail__name" tabindex="-1">${escapeHtml(getLocalizedValue(selectedHero.name))}</h2>
                                <p class="hero-detail__subtitle">${escapeHtml(getLocalizedValue(selectedHero.role))}</p>
                                <p class="hero-detail__period">${escapeHtml(selectedHero.period)}</p>
                            </div>
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

                        <aside>
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
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 id="heroes-heading" class="section-title" tabindex="-1">${escapeHtml(t("heroes_title"))}</h2>
                    <p class="section-intro">${escapeHtml(t("heroes_intro"))}</p>
                </div>
            </div>

            <div class="heroes-grid">
                ${heroes.map((hero) => `
                    <article class="hero-card" style="--hero-color: ${escapeHtml(hero.color)};">
                        <div class="hero-card__visual">
                            <div class="hero-card__image">${escapeHtml(hero.image)}</div>
                        </div>
                        <div class="hero-card__body">
                            <h3 class="hero-card__name">${escapeHtml(getLocalizedValue(hero.name))}</h3>
                            <p class="hero-card__role">${escapeHtml(getLocalizedValue(hero.role))}</p>
                            <p class="hero-card__period">${escapeHtml(hero.period)}</p>
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
    `;
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
