import { appState } from "../core/state.js";
import { getDiasporaEvents } from "../core/content.js";
import { getLocalizedValue, t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

export function renderDiaspora() {
    const diasporaSection = document.getElementById("diaspora-section");
    const events = getDiasporaEvents();

    if (!diasporaSection) {
        return;
    }

    const locations = events.reduce((list, eventItem) => {
        if (list.some((entry) => entry.id === eventItem.location)) {
            return list;
        }

        list.push({
            id: eventItem.location,
            label: getLocalizedValue(eventItem.locationLabel)
        });
        return list;
    }, []);

    const filteredEvents = appState.diasporaFilter === "all"
        ? events
        : events.filter((eventItem) => eventItem.location === appState.diasporaFilter);

    diasporaSection.innerHTML = `
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 id="diaspora-heading" class="section-title" tabindex="-1">${escapeHtml(t("diaspora_title"))}</h2>
                    <p class="section-intro">${escapeHtml(t("diaspora_intro"))}</p>
                </div>
            </div>

            <div class="filter-row">
                <button
                    class="filter-chip ${appState.diasporaFilter === "all" ? "is-active" : ""}"
                    type="button"
                    data-action="filter-diaspora"
                    data-location="all"
                    aria-pressed="${appState.diasporaFilter === "all" ? "true" : "false"}"
                >
                    ${escapeHtml(t("diaspora_filter_all"))}
                </button>
                ${locations.map((locationItem) => `
                    <button
                        class="filter-chip ${appState.diasporaFilter === locationItem.id ? "is-active" : ""}"
                        type="button"
                        data-action="filter-diaspora"
                        data-location="${escapeHtml(locationItem.id)}"
                        aria-pressed="${appState.diasporaFilter === locationItem.id ? "true" : "false"}"
                    >
                        ${escapeHtml(locationItem.label)}
                    </button>
                `).join("")}
            </div>

            <div class="timeline-list">
                ${filteredEvents.length > 0 ? filteredEvents.map((eventItem) => `
                    <article class="timeline-card" style="--timeline-color: ${escapeHtml(eventItem.color)};">
                        <div class="timeline-card__meta">
                            <span class="timeline-card__year">${escapeHtml(String(eventItem.year))}</span>
                            <span class="timeline-card__period">${escapeHtml(getLocalizedValue(eventItem.locationLabel))}</span>
                        </div>
                        <h3 class="timeline-card__title">${escapeHtml(getLocalizedValue(eventItem.title))}</h3>
                        <p class="timeline-card__description">${escapeHtml(getLocalizedValue(eventItem.description))}</p>
                    </article>
                `).join("") : `
                    <div class="empty-state">${escapeHtml(t("diaspora_empty"))}</div>
                `}
            </div>
        </article>
    `;
}
