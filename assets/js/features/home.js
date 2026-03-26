import { t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

export function renderHome() {
    const homeSection = document.getElementById("home-section");

    if (!homeSection) {
        return;
    }

    homeSection.innerHTML = `
        <article class="hero-panel">
            <div class="hero-panel__content">
                <span class="hero-panel__eyebrow">${escapeHtml(t("home_kicker"))}</span>
                <h2 id="home-heading" class="hero-panel__title" tabindex="-1">${escapeHtml(t("home_title"))}</h2>
                <p class="hero-panel__lead">${escapeHtml(t("home_intro"))}</p>

                <div class="button-row">
                    <button class="button button-primary" type="button" data-action="change-section" data-section="timeline">
                        ${escapeHtml(t("home_timeline_button"))}
                    </button>
                    <button class="button button-secondary" type="button" data-action="change-section" data-section="heroes">
                        ${escapeHtml(t("home_heroes_button"))}
                    </button>
                </div>

                <div class="stats-grid">
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(t("stat_one_value"))}</span>
                        <span class="stat-card__label">${escapeHtml(t("stat_one_label"))}</span>
                    </article>
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(t("stat_two_value"))}</span>
                        <span class="stat-card__label">${escapeHtml(t("stat_two_label"))}</span>
                    </article>
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(t("stat_three_value"))}</span>
                        <span class="stat-card__label">${escapeHtml(t("stat_three_label"))}</span>
                    </article>
                </div>
            </div>

            <aside class="hero-panel__aside">
                <div class="hero-panel__quote">${escapeHtml(t("home_quote"))}</div>
                <div class="cta-panel">
                    <h3 class="detail-block__title">${escapeHtml(t("home_focus_title"))}</h3>
                    <p class="section-intro">${escapeHtml(t("home_focus_text"))}</p>
                </div>
            </aside>
        </article>

        <article class="cta-panel">
            <div class="section-heading">
                <div>
                    <h3 class="section-title">${escapeHtml(t("home_cta_title"))}</h3>
                    <p class="section-intro">${escapeHtml(t("home_cta_text"))}</p>
                </div>
            </div>

            <div class="button-row">
                <button
                    class="button button-gold"
                    type="button"
                    data-action="change-section"
                    data-section="quiz"
                    data-reset-quiz="true"
                >
                    ${escapeHtml(t("home_quiz_button"))}
                </button>
                <button class="button button-ghost" type="button" data-action="change-section" data-section="timeline">
                    ${escapeHtml(t("home_more_button"))}
                </button>
            </div>
        </article>
    `;
}
