import { appState } from "../core/state.js";
import { getTimelineEvents } from "../core/content.js";
import { getLocalizedValue, t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

export function renderTimeline() {
    const timelineSection = document.getElementById("timeline-section");
    const events = getTimelineEvents();
    const ui = getTimelineUiCopy();

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
    const chapterGroups = groupEventsByPeriod(filteredEvents);
    const totalSteps = filteredEvents.length;
    const stepOrderById = new Map(filteredEvents.map((eventItem, index) => [eventItem.id, index + 1]));

    timelineSection.innerHTML = `
        <div class="timeline-journey">
            <article class="section-panel timeline-journey__hero">
                <div class="section-heading">
                    <div>
                        <h2 id="timeline-heading" class="section-title" tabindex="-1">${escapeHtml(t("timeline_title"))}</h2>
                        <p class="section-intro">${escapeHtml(t("timeline_intro"))}</p>
                    </div>
                </div>

                <div class="timeline-journey__meta">
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(String(chapterGroups.length))}</span>
                        <span class="stat-card__label">${escapeHtml(ui.chaptersLabel)}</span>
                    </article>
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(String(totalSteps))}</span>
                        <span class="stat-card__label">${escapeHtml(ui.eventsLabel)}</span>
                    </article>
                    <article class="stat-card">
                        <span class="stat-card__value">${escapeHtml(appState.timelineFilter === "all" ? ui.fullPathLabel : ui.focusLabel)}</span>
                        <span class="stat-card__label">${escapeHtml(ui.pathModeLabel)}</span>
                    </article>
                </div>
            </article>

            <article class="section-panel timeline-journey__filters">
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
            </article>

            ${filteredEvents.length > 0 ? `
                <div class="timeline-journey__chapters">
                    ${chapterGroups.map((chapter, chapterIndex) => `
                        <article class="timeline-chapter card">
                            <header class="timeline-chapter__header">
                                <p class="timeline-chapter__kicker">
                                    ${escapeHtml(`${ui.chapterLabel} ${String(chapterIndex + 1).padStart(2, "0")}`)}
                                </p>
                                <h3 class="timeline-chapter__title">${escapeHtml(chapter.label)}</h3>
                                <p class="timeline-chapter__summary">${escapeHtml(`${chapter.events.length} ${chapter.events.length > 1 ? ui.eventsPlural : ui.eventSingular}`)}</p>
                            </header>

                            <div class="timeline-chapter__events">
                                ${chapter.events.map((eventItem) => `
                                    <article class="timeline-event" style="--timeline-color: ${escapeHtml(eventItem.color)};">
                                        <div class="timeline-event__top">
                                            <span class="timeline-event__step">${escapeHtml(`${ui.stepLabel} ${String(stepOrderById.get(eventItem.id) || 1).padStart(2, "0")}`)}</span>
                                            <span class="timeline-card__year">${escapeHtml(String(eventItem.year))}</span>
                                        </div>

                                        <h4 class="timeline-card__title">${escapeHtml(getLocalizedValue(eventItem.title))}</h4>
                                        <p class="timeline-card__description">${escapeHtml(getLocalizedValue(eventItem.description))}</p>

                                        <div class="timeline-event__insight">
                                            <p class="timeline-event__insight-label">${escapeHtml(ui.whyImportantLabel)}</p>
                                            <p class="timeline-event__insight-text">${escapeHtml(getImportanceText(eventItem.period))}</p>
                                        </div>
                                    </article>
                                `).join("")}
                            </div>
                        </article>
                    `).join("")}
                </div>
            ` : `
                <article class="section-panel">
                    <div class="empty-state">${escapeHtml(t("timeline_empty"))}</div>
                </article>
            `}
        </div>
    `;
}

function groupEventsByPeriod(events) {
    const chapterMap = new Map();

    events.forEach((eventItem) => {
        if (!chapterMap.has(eventItem.period)) {
            chapterMap.set(eventItem.period, {
                id: eventItem.period,
                label: getLocalizedValue(eventItem.periodLabel),
                events: []
            });
        }

        chapterMap.get(eventItem.period).events.push(eventItem);
    });

    return Array.from(chapterMap.values());
}

function getTimelineUiCopy() {
    const dictionary = {
        fr: {
            chaptersLabel: "Chapitres",
            eventsLabel: "Reperes",
            pathModeLabel: "Mode de parcours",
            fullPathLabel: "Complet",
            focusLabel: "Focalise",
            chapterLabel: "Chapitre",
            stepLabel: "Etape",
            eventSingular: "evenement",
            eventsPlural: "evenements",
            whyImportantLabel: "Pourquoi c'est important"
        },
        ht: {
            chaptersLabel: "Chapit",
            eventsLabel: "Repere",
            pathModeLabel: "Tip parcours",
            fullPathLabel: "Konple",
            focusLabel: "Vize",
            chapterLabel: "Chapit",
            stepLabel: "Etap",
            eventSingular: "evenman",
            eventsPlural: "evenman",
            whyImportantLabel: "Poukisa sa enpotan"
        },
        en: {
            chaptersLabel: "Chapters",
            eventsLabel: "Milestones",
            pathModeLabel: "Path mode",
            fullPathLabel: "Complete",
            focusLabel: "Focused",
            chapterLabel: "Chapter",
            stepLabel: "Step",
            eventSingular: "event",
            eventsPlural: "events",
            whyImportantLabel: "Why it matters"
        }
    };

    return dictionary[appState.language] || dictionary.fr;
}

function getImportanceText(period) {
    const dictionary = {
        fr: {
            colonization: "Ce repere aide a comprendre les racines de la domination coloniale et ses consequences durables.",
            revolution: "Ce repere montre comment les choix collectifs ont transforme la lutte en rupture historique.",
            independence: "Ce repere explique le passage vers la souverainete et la naissance d'un nouvel ordre politique.",
            "post-independence": "Ce repere eclaire les defis de construction nationale apres la rupture de 1804.",
            "twentieth-century": "Ce repere met en contexte les tensions modernes entre pouvoir, societe et souverainete.",
            contemporary: "Ce repere relie les enjeux recents a la memoire historique du pays.",
            default: "Ce repere permet de mieux lire les causes, les ruptures et les effets dans le temps long."
        },
        ht: {
            colonization: "Repere sa a ede konprann rasin dominasyon kolonyal la ak konsekans li ki dire.",
            revolution: "Repere sa a montre kijan chwa kolektif yo te fe lit la tounen yon gwo chanjman istorik.",
            independence: "Repere sa a esplike pasaj la ver souverente ak nesans yon nouvo lod politik.",
            "post-independence": "Repere sa a mete limye sou defi pou konstwi nasyon an apre 1804.",
            "twentieth-century": "Repere sa a bay kontes sou tansyon modenn ant pouvwa, sosyete ak souverente.",
            contemporary: "Repere sa a konekte kestyon resan yo ak memwa istorik peyi a.",
            default: "Repere sa a ede li miyo koz yo, pwen kase yo ak efe yo nan tan long."
        },
        en: {
            colonization: "This milestone helps explain the roots of colonial domination and its long-lasting consequences.",
            revolution: "This milestone shows how collective choices turned resistance into a historical rupture.",
            independence: "This milestone explains the shift toward sovereignty and a new political order.",
            "post-independence": "This milestone highlights the nation-building challenges that followed 1804.",
            "twentieth-century": "This milestone provides context for modern tensions between power, society and sovereignty.",
            contemporary: "This milestone connects recent issues with the country's historical memory.",
            default: "This milestone helps frame causes, turning points and long-term effects."
        }
    };
    const languagePack = dictionary[appState.language] || dictionary.fr;

    return languagePack[period] || languagePack.default;
}

