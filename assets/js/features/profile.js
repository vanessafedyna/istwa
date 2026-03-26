import { appState } from "../core/state.js";
import { getHeroes, getTimelineEvents } from "../core/content.js";
import { getLocalizedValue, t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

export function renderProfile() {
    const profileSection = document.getElementById("profile-section");

    if (!profileSection) {
        return;
    }

    if (appState.authenticated !== true || !appState.currentUser) {
        const ui = getProfileUiCopy();

        profileSection.innerHTML = `
            <article class="section-panel profile-journey profile-journey--locked">
                <div class="section-heading">
                    <div>
                        <h2 id="profile-heading" class="section-title" tabindex="-1">${escapeHtml(ui.title)}</h2>
                        <p class="section-intro">${escapeHtml(ui.lockedIntro)}</p>
                    </div>
                </div>

                <div class="button-row">
                    <button class="button button-primary" type="button" data-action="open-login">
                        ${escapeHtml(t("quiz_auth_login_button"))}
                    </button>
                    <button class="button button-ghost" type="button" data-action="change-section" data-section="timeline">
                        ${escapeHtml(t("home_timeline_button"))}
                    </button>
                </div>
            </article>
        `;
        return;
    }

    const ui = getProfileUiCopy();
    const activitySummary = normalizeActivitySummary(appState.profileActivitySummary);
    const stats = getProfileStats(activitySummary);
    const achievements = getAchievements(stats);
    const recentActivity = getRecentActivity(activitySummary);
    const displayName = appState.currentUser.display_name || appState.currentUser.username || ui.memberLabel;

    profileSection.innerHTML = `
        <div class="profile-journey">
            <article class="section-panel profile-journey__hero">
                <div class="section-heading">
                    <div>
                        <h2 id="profile-heading" class="section-title" tabindex="-1">${escapeHtml(ui.title)}</h2>
                        <p class="section-intro">${escapeHtml(ui.intro)}</p>
                    </div>
                </div>

                <div class="profile-identity">
                    <div class="profile-identity__avatar">${escapeHtml(getInitials(displayName))}</div>
                    <div>
                        <p class="profile-identity__name">${escapeHtml(displayName)}</p>
                        <p class="profile-identity__meta">${escapeHtml(appState.currentUser.email || ui.memberLabel)}</p>
                        <p class="profile-identity__meta">${escapeHtml(`${ui.lastActivityPrefix} ${stats.lastActivityLabel}`)}</p>
                    </div>
                </div>
            </article>

            <article class="section-panel">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml(ui.progressTitle)}</h3>
                        <p class="section-intro">${escapeHtml(ui.progressIntro)}</p>
                    </div>
                </div>

                <div class="profile-progress">
                    <div class="profile-progress__bar" aria-label="${escapeHtml(ui.globalProgressLabel)}">
                        <span class="profile-progress__value" style="width: ${stats.progressPercent}%;"></span>
                    </div>
                    <p class="profile-progress__meta">${escapeHtml(`${ui.globalProgressLabel} ${stats.progressPercent}%`)}</p>
                </div>

                <div class="profile-kpis">
                    <article class="card">
                        <p class="profile-kpi__label">${escapeHtml(ui.quizAttemptsLabel)}</p>
                        <p class="profile-kpi__value">${escapeHtml(String(stats.totalAttempts))}</p>
                    </article>
                    <article class="card">
                        <p class="profile-kpi__label">${escapeHtml(ui.timelineViewsLabel)}</p>
                        <p class="profile-kpi__value">${escapeHtml(String(stats.timelinePeriodsViewed))}</p>
                    </article>
                    <article class="card">
                        <p class="profile-kpi__label">${escapeHtml(ui.heroViewsLabel)}</p>
                        <p class="profile-kpi__value">${escapeHtml(String(stats.heroesViewed))}</p>
                    </article>
                </div>

                <div class="profile-sections">
                    <article class="profile-section-chip ${stats.totalAttempts > 0 ? "is-done" : ""}">
                        <p class="profile-section-chip__title">${escapeHtml(t("quiz_title"))}</p>
                        <p class="profile-section-chip__meta">${escapeHtml(stats.totalAttempts > 0 ? `${ui.exploredLabel}: ${stats.totalAttempts}` : ui.pendingLabel)}</p>
                    </article>
                    <article class="profile-section-chip ${stats.timelinePeriodsViewed > 0 ? "is-done" : ""}">
                        <p class="profile-section-chip__title">${escapeHtml(t("timeline_title"))}</p>
                        <p class="profile-section-chip__meta">${escapeHtml(stats.timelinePeriodsViewed > 0 ? `${ui.exploredLabel}: ${stats.timelinePeriodsViewed}` : ui.pendingLabel)}</p>
                    </article>
                    <article class="profile-section-chip ${stats.heroesViewed > 0 ? "is-done" : ""}">
                        <p class="profile-section-chip__title">${escapeHtml(t("heroes_title"))}</p>
                        <p class="profile-section-chip__meta">${escapeHtml(stats.heroesViewed > 0 ? `${ui.exploredLabel}: ${stats.heroesViewed}` : ui.pendingLabel)}</p>
                    </article>
                </div>
            </article>

            <div class="profile-layout">
                <article class="section-panel">
                    <div class="section-heading">
                        <div>
                            <h3 class="section-title">${escapeHtml(ui.achievementsTitle)}</h3>
                            <p class="section-intro">${escapeHtml(ui.achievementsIntro)}</p>
                        </div>
                    </div>

                    <div class="profile-achievements">
                        ${achievements.map((achievement) => `
                            <article class="profile-badge ${achievement.unlocked ? "is-unlocked" : ""}">
                                <p class="profile-badge__title">${escapeHtml(achievement.title)}</p>
                                <p class="profile-badge__meta">${escapeHtml(achievement.description)}</p>
                            </article>
                        `).join("")}
                    </div>
                </article>

                <article class="section-panel">
                    <div class="section-heading">
                        <div>
                            <h3 class="section-title">${escapeHtml(ui.activityTitle)}</h3>
                            <p class="section-intro">${escapeHtml(ui.activityIntro)}</p>
                        </div>
                    </div>

                    ${recentActivity.length > 0 ? `
                        <ul class="profile-activity-list">
                            ${recentActivity.map((item) => `
                                <li class="profile-activity-item">
                                    <p class="profile-activity-item__title">${escapeHtml(item.title)}</p>
                                    <p class="profile-activity-item__meta">${escapeHtml(item.meta)}</p>
                                </li>
                            `).join("")}
                        </ul>
                    ` : `
                        <div class="empty-state">${escapeHtml(ui.activityEmpty)}</div>
                    `}
                </article>
            </div>

            <article class="section-panel profile-next-step">
                <div class="section-heading">
                    <div>
                        <h3 class="section-title">${escapeHtml(ui.nextStepTitle)}</h3>
                        <p class="section-intro">${escapeHtml(ui.nextStepIntro)}</p>
                    </div>
                </div>

                <div class="button-row">
                    <button class="button button-gold" type="button" data-action="change-section" data-section="timeline">
                        ${escapeHtml(t("home_timeline_button"))}
                    </button>
                    <button class="button button-ghost" type="button" data-action="change-section" data-section="heroes">
                        ${escapeHtml(t("home_heroes_button"))}
                    </button>
                    <button class="button button-primary" type="button" data-action="change-section" data-section="quiz" data-reset-quiz="true">
                        ${escapeHtml(t("home_quiz_button"))}
                    </button>
                </div>
            </article>
        </div>
    `;
}

function normalizeActivitySummary(summary) {
    const normalizedSummary = summary && typeof summary === "object" ? summary : {};

    return {
        last_activity_at: typeof normalizedSummary.last_activity_at === "string" && normalizedSummary.last_activity_at !== ""
            ? normalizedSummary.last_activity_at
            : null,
        total_by_type: normalizedSummary.total_by_type && typeof normalizedSummary.total_by_type === "object"
            ? normalizedSummary.total_by_type
            : {},
        unique_targets_by_type: normalizedSummary.unique_targets_by_type && typeof normalizedSummary.unique_targets_by_type === "object"
            ? normalizedSummary.unique_targets_by_type
            : {},
        recent_events: Array.isArray(normalizedSummary.recent_events) ? normalizedSummary.recent_events : []
    };
}

function getProfileStats(activitySummary) {
    const attempts = Array.isArray(appState.quizAttempts) ? appState.quizAttempts : [];
    let bestScore = 0;
    let bestTotal = 0;
    let totalRatio = 0;

    attempts.forEach((attempt) => {
        const score = Number(attempt?.score ?? 0);
        const total = Number(attempt?.total_questions ?? 0);
        const ratio = total > 0 ? score / total : 0;
        const bestRatio = bestTotal > 0 ? bestScore / bestTotal : 0;

        totalRatio += ratio;

        if (ratio > bestRatio) {
            bestScore = score;
            bestTotal = total;
        }
    });

    const timelinePeriodsViewed = Number(activitySummary.unique_targets_by_type?.timeline_period_view ?? 0);
    const heroesViewed = Number(activitySummary.unique_targets_by_type?.hero_view ?? 0);
    const averagePercent = attempts.length > 0 ? Math.round((totalRatio / attempts.length) * 100) : 0;
    const progressSignals = [
        appState.authenticated === true,
        attempts.length > 0,
        timelinePeriodsViewed > 0,
        heroesViewed > 0
    ];
    const progressPercent = Math.round((progressSignals.filter(Boolean).length / progressSignals.length) * 100);

    return {
        totalAttempts: attempts.length,
        averagePercent,
        progressPercent,
        bestScoreDisplay: bestTotal > 0 ? `${bestScore}/${bestTotal}` : "0/0",
        timelinePeriodsViewed,
        heroesViewed,
        lastActivityLabel: formatActivityDateLabel(activitySummary.last_activity_at)
    };
}

function getAchievements(stats) {
    const ui = getProfileUiCopy();

    return [
        {
            title: ui.badgeMemberTitle,
            description: ui.badgeMemberDesc,
            unlocked: appState.authenticated === true
        },
        {
            title: ui.badgeFirstQuizTitle,
            description: ui.badgeFirstQuizDesc,
            unlocked: stats.totalAttempts > 0
        },
        {
            title: ui.badgeTimelineTitle,
            description: ui.badgeTimelineDesc,
            unlocked: stats.timelinePeriodsViewed > 0
        },
        {
            title: ui.badgeHeroTitle,
            description: ui.badgeHeroDesc,
            unlocked: stats.heroesViewed > 0
        }
    ];
}

function getRecentActivity(activitySummary) {
    const ui = getProfileUiCopy();
    const attempts = Array.isArray(appState.quizAttempts) ? appState.quizAttempts : [];

    const quizItems = attempts.slice(0, 6).map((attempt) => {
        const score = Number(attempt?.score ?? 0);
        const total = Number(attempt?.total_questions ?? 0);
        const completedAt = attempt?.completed_at ? new Date(attempt.completed_at) : null;

        return {
            title: `${ui.quizAttemptLabel} ${score}/${total}`,
            meta: formatActivityDateLabel(completedAt instanceof Date && !Number.isNaN(completedAt.getTime()) ? completedAt.toISOString() : null),
            sortValue: completedAt instanceof Date && !Number.isNaN(completedAt.getTime()) ? completedAt.getTime() : 0
        };
    });

    const trackedItems = activitySummary.recent_events.slice(0, 8).map((eventItem) => {
        const occurredAt = eventItem?.occurred_at ? new Date(eventItem.occurred_at) : null;
        const sortValue = occurredAt instanceof Date && !Number.isNaN(occurredAt.getTime()) ? occurredAt.getTime() : 0;

        return {
            title: getTrackedActivityTitle(String(eventItem?.activity_type || ""), String(eventItem?.target_key || "")),
            meta: formatActivityDateLabel(eventItem?.occurred_at || null),
            sortValue
        };
    });

    return [...quizItems, ...trackedItems]
        .sort((left, right) => right.sortValue - left.sortValue)
        .slice(0, 8)
        .map(({ title, meta }) => ({ title, meta }));
}

function getTrackedActivityTitle(activityType, targetKey) {
    const ui = getProfileUiCopy();

    if (activityType === "timeline_period_view") {
        return `${ui.timelineViewLabel} ${resolveTimelineLabel(targetKey)}`;
    }

    if (activityType === "hero_view") {
        return `${ui.heroViewLabel} ${resolveHeroLabel(targetKey)}`;
    }

    return ui.genericActivityLabel;
}

function resolveTimelineLabel(periodKey) {
    if (periodKey === "all") {
        return t("timeline_filter_all");
    }

    const matchingEvent = getTimelineEvents().find((eventItem) => eventItem.period === periodKey);

    return matchingEvent ? getLocalizedValue(matchingEvent.periodLabel) : periodKey;
}

function resolveHeroLabel(heroId) {
    const matchingHero = getHeroes().find((hero) => hero.id === heroId);

    return matchingHero ? getLocalizedValue(matchingHero.name) : heroId;
}

function formatActivityDateLabel(value) {
    const ui = getProfileUiCopy();

    if (typeof value !== "string" || value.trim() === "") {
        return ui.dateUnavailable;
    }

    const dateValue = new Date(value);

    if (Number.isNaN(dateValue.getTime())) {
        return ui.dateUnavailable;
    }

    return dateValue.toLocaleString(appState.language || undefined);
}

function getInitials(name) {
    const words = String(name || "").trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        return "PR";
    }

    return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
}

function getProfileUiCopy() {
    const dictionary = {
        fr: {
            title: "Profil",
            intro: "Suivez votre progression d'apprentissage et vos reperes recents dans un espace personnel simple.",
            lockedIntro: "Connectez-vous pour activer votre espace profil, consulter vos tentatives et continuer votre progression.",
            memberLabel: "Membre Istwa",
            progressTitle: "Progression globale",
            progressIntro: "Cette vue combine vos tentatives quiz et un suivi d'activite minimal (parcours et heros).",
            globalProgressLabel: "Progression estimee :",
            quizAttemptsLabel: "Tentatives quiz",
            timelineViewsLabel: "Periodes consultees",
            heroViewsLabel: "Fiches heros ouvertes",
            exploredLabel: "Explore",
            pendingLabel: "A demarrer",
            achievementsTitle: "Realisations",
            achievementsIntro: "Des reperes simples pour valoriser votre progression reelle.",
            activityTitle: "Activite recente",
            activityIntro: "Cette liste melange quiz recents et consultations parcours/heros enregistrees.",
            activityEmpty: "Aucune activite recente enregistree pour le moment.",
            nextStepTitle: "Prochaine etape",
            nextStepIntro: "Poursuivez votre exploration selon votre rythme.",
            badgeMemberTitle: "Compte actif",
            badgeMemberDesc: "Connexion et profil actif.",
            badgeFirstQuizTitle: "Premier quiz termine",
            badgeFirstQuizDesc: "Au moins une tentative quiz enregistree.",
            badgeTimelineTitle: "Parcours consulte",
            badgeTimelineDesc: "Au moins une periode du parcours a ete ouverte.",
            badgeHeroTitle: "Figure decouverte",
            badgeHeroDesc: "Au moins une fiche heros a ete ouverte.",
            quizAttemptLabel: "Tentative quiz",
            timelineViewLabel: "Parcours consulte :",
            heroViewLabel: "Hero consulte :",
            genericActivityLabel: "Activite recente",
            lastActivityPrefix: "Derniere activite :",
            dateUnavailable: "Date indisponible"
        },
        ht: {
            title: "Pwofil",
            intro: "Swiv pwogres aprantisaj ou ak denye repere ou yo nan yon espas pesonel ki kle.",
            lockedIntro: "Konekte pou aktive pwofil ou, gade tantativ yo epi kontinye pwogres ou.",
            memberLabel: "Manm Istwa",
            progressTitle: "Pwogres global",
            progressIntro: "Vizyon sa a melanje done quiz ak yon ti swivi aktivite sou parcours ak ewo yo.",
            globalProgressLabel: "Pwogres estime :",
            quizAttemptsLabel: "Tantativ quiz",
            timelineViewsLabel: "Peryod gade",
            heroViewsLabel: "Fich ewo louvri",
            exploredLabel: "Eksplore",
            pendingLabel: "Pou komanse",
            achievementsTitle: "Reyalizasyon",
            achievementsIntro: "Ti repere senp pou valorize pwogres reyel ou.",
            activityTitle: "Denye aktivite",
            activityIntro: "Lis sa a melanje quiz resan ak konsiltasyon parcours/ewo yo.",
            activityEmpty: "Pa gen aktivite resan pou kounye a.",
            nextStepTitle: "Pwochen etap",
            nextStepIntro: "Kontinye eksplore selon ritm pa ou.",
            badgeMemberTitle: "Kont aktif",
            badgeMemberDesc: "Koneksyon ak pwofil aktif.",
            badgeFirstQuizTitle: "Premye quiz fini",
            badgeFirstQuizDesc: "Omwen youn tantativ quiz anrejistre.",
            badgeTimelineTitle: "Parcours konsilte",
            badgeTimelineDesc: "Omwen youn peryod parcours la te louvri.",
            badgeHeroTitle: "Figi dekouvri",
            badgeHeroDesc: "Omwen youn fich ewo te louvri.",
            quizAttemptLabel: "Tantativ quiz",
            timelineViewLabel: "Parcours konsilte :",
            heroViewLabel: "Ewo konsilte :",
            genericActivityLabel: "Aktivite resan",
            lastActivityPrefix: "Denye aktivite :",
            dateUnavailable: "Dat pa disponib"
        },
        en: {
            title: "Profile",
            intro: "Track your learning continuity and recent milestones in a simple personal space.",
            lockedIntro: "Sign in to unlock your profile, view your attempts and continue your progression.",
            memberLabel: "Istwa member",
            progressTitle: "Overall progress",
            progressIntro: "This view combines quiz attempts with minimal activity tracking (timeline and heroes).",
            globalProgressLabel: "Estimated progress:",
            quizAttemptsLabel: "Quiz attempts",
            timelineViewsLabel: "Timeline periods viewed",
            heroViewsLabel: "Hero profiles opened",
            exploredLabel: "Explored",
            pendingLabel: "To start",
            achievementsTitle: "Achievements",
            achievementsIntro: "Simple markers that reflect your real progress.",
            activityTitle: "Recent activity",
            activityIntro: "This feed combines recent quiz attempts and tracked timeline/hero views.",
            activityEmpty: "No recent activity has been recorded yet.",
            nextStepTitle: "Next step",
            nextStepIntro: "Continue exploring at your own pace.",
            badgeMemberTitle: "Active account",
            badgeMemberDesc: "Signed in with an active profile.",
            badgeFirstQuizTitle: "First quiz completed",
            badgeFirstQuizDesc: "At least one recorded quiz attempt.",
            badgeTimelineTitle: "Timeline explored",
            badgeTimelineDesc: "At least one timeline period has been viewed.",
            badgeHeroTitle: "Hero discovered",
            badgeHeroDesc: "At least one hero profile has been opened.",
            quizAttemptLabel: "Quiz attempt",
            timelineViewLabel: "Timeline viewed:",
            heroViewLabel: "Hero viewed:",
            genericActivityLabel: "Recent activity",
            lastActivityPrefix: "Last activity:",
            dateUnavailable: "Date unavailable"
        }
    };

    return dictionary[appState.language] || dictionary.fr;
}
