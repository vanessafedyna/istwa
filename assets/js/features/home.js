import { getHeroes, getQuizItems, getTimelineEvents } from "../core/content.js";
import { getLocalizedValue, t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

export function renderHome() {
    const homeSection = document.getElementById("home-section");
    const timelineChapters = buildTimelineChapters();
    const featuredHeroes = getHeroes().slice(0, 3);
    const quizCount = getQuizItems().length;

    if (!homeSection) {
        return;
    }

    homeSection.innerHTML = `
        <div class="home-landing">
            <article class="home-hero hero-panel">
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
                </div>

                <aside class="hero-panel__aside">
                    <div class="home-hero__quote hero-panel__quote">${escapeHtml(t("home_quote"))}</div>
                    <div class="home-metrics stats-grid">
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
                </aside>
            </article>

            <article class="section-panel home-section">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml(t("timeline_title"))}</h3>
                        <p class="section-intro">${escapeHtml(t("timeline_intro"))}</p>
                    </div>
                </div>

                <div class="home-chapters">
                    ${timelineChapters.map((chapter) => `
                        <article class="home-chapter card">
                            <p class="home-chapter__meta">${escapeHtml(chapter.period)}</p>
                            <h4 class="home-chapter__title">${escapeHtml(chapter.title)}</h4>
                            <p class="home-chapter__text">${escapeHtml(chapter.description)}</p>
                        </article>
                    `).join("")}
                </div>

                <div class="button-row">
                    <button class="button button-ghost" type="button" data-action="change-section" data-section="timeline">
                        ${escapeHtml(t("home_more_button"))}
                    </button>
                </div>
            </article>

            <article class="section-panel home-section">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml(t("heroes_title"))}</h3>
                        <p class="section-intro">${escapeHtml(t("heroes_intro"))}</p>
                    </div>
                </div>

                <div class="home-heroes">
                    ${featuredHeroes.map((hero) => `
                        <article class="home-hero-card card" style="--hero-color: ${escapeHtml(hero.color)};">
                            <div class="home-hero-card__badge">${escapeHtml(hero.image)}</div>
                            <h4 class="home-hero-card__name">${escapeHtml(getLocalizedValue(hero.name))}</h4>
                            <p class="home-hero-card__role">${escapeHtml(getLocalizedValue(hero.role))}</p>
                            <button
                                class="button button-ghost"
                                type="button"
                                data-action="open-hero"
                                data-hero-id="${escapeHtml(hero.id)}"
                            >
                                ${escapeHtml(t("heroes_discover_button"))}
                            </button>
                        </article>
                    `).join("")}
                </div>
            </article>

            <article class="section-panel home-section home-quiz-callout">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml(t("home_cta_title"))}</h3>
                        <p class="section-intro">${escapeHtml(t("home_cta_text"))}</p>
                    </div>
                </div>

                <div class="home-quiz-callout__content">
                    <p class="home-quiz-callout__meta">
                        ${escapeHtml(`${t("quiz_title")} - ${t("quiz_progress_label")}: ${quizCount}`)}
                    </p>
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
                </div>
            </article>

            <article class="section-panel home-section home-mission">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml(t("home_focus_title"))}</h3>
                        <p class="section-intro">${escapeHtml(t("home_focus_text"))}</p>
                    </div>
                </div>

                <blockquote class="home-mission__quote">${escapeHtml(t("home_quote"))}</blockquote>
            </article>
        </div>
    `;
}

function buildTimelineChapters() {
    const chapterMap = new Map();
    const fallbackChapters = [
        {
            period: t("timeline_filter_all"),
            title: t("timeline_title"),
            description: t("timeline_intro")
        }
    ];

    getTimelineEvents().forEach((eventItem) => {
        if (chapterMap.has(eventItem.period)) {
            return;
        }

        chapterMap.set(eventItem.period, {
            period: getLocalizedValue(eventItem.periodLabel),
            title: getLocalizedValue(eventItem.title),
            description: getLocalizedValue(eventItem.description)
        });
    });

    const chapters = Array.from(chapterMap.values()).slice(0, 3);

    return chapters.length > 0 ? chapters : fallbackChapters;
}
