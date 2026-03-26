import { appState } from "../core/state.js";
import { getTimelineEvents } from "../core/content.js";
import { getLocalizedValue, t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

export function renderTimeline() {
    const timelineSection = document.getElementById("timeline-section");
    const events = getTimelineEvents();

    if (!timelineSection) {
        return;
    }

    const periods = events.reduce((list, eventItem) => {
        if (list.some((entry) => entry.id === eventItem.period)) {
            return list;
        }

        list.push({
            id: eventItem.period,
            label: getLocalizedValue(eventItem.periodLabel)
        });
        return list;
    }, []);

    const filteredEvents = appState.timelineFilter === "all"
        ? events
        : events.filter((eventItem) => eventItem.period === appState.timelineFilter);

    timelineSection.innerHTML = `
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 id="timeline-heading" class="section-title" tabindex="-1">${escapeHtml(t("timeline_title"))}</h2>
                    <p class="section-intro">${escapeHtml(t("timeline_intro"))}</p>
                </div>
            </div>

            <div class="filter-row">
                <button
                    class="filter-chip ${appState.timelineFilter === "all" ? "is-active" : ""}"
                    type="button"
                    data-action="filter-timeline"
                    data-period="all"
                    aria-pressed="${appState.timelineFilter === "all" ? "true" : "false"}"
                >
                    ${escapeHtml(t("timeline_filter_all"))}
                </button>
                ${periods.map((periodItem) => `
                    <button
                        class="filter-chip ${appState.timelineFilter === periodItem.id ? "is-active" : ""}"
                        type="button"
                        data-action="filter-timeline"
                        data-period="${escapeHtml(periodItem.id)}"
                        aria-pressed="${appState.timelineFilter === periodItem.id ? "true" : "false"}"
                    >
                        ${escapeHtml(periodItem.label)}
                    </button>
                `).join("")}
            </div>

            <div class="timeline-list">
                ${filteredEvents.length > 0 ? filteredEvents.map((eventItem) => `
                    <article class="timeline-card" style="--timeline-color: ${escapeHtml(eventItem.color)};">
                        <div class="timeline-card__meta">
                            <span class="timeline-card__year">${escapeHtml(String(eventItem.year))}</span>
                            <span class="timeline-card__period">${escapeHtml(getLocalizedValue(eventItem.periodLabel))}</span>
                        </div>
                        <h3 class="timeline-card__title">${escapeHtml(getLocalizedValue(eventItem.title))}</h3>
                        <p class="timeline-card__description">${escapeHtml(getLocalizedValue(eventItem.description))}</p>
                    </article>
                `).join("") : `
                    <div class="empty-state">${escapeHtml(t("timeline_empty"))}</div>
                `}
            </div>
        </article>
    `;
}
