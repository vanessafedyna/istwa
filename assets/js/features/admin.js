import { appState } from "../core/state.js";
import { t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

let organismeDashboardRequest = null;
let organismeDashboardError = "";
let organismeDashboardUserId = null;

export function renderAdmin() {
    const adminSection = document.getElementById("admin-section");

    if (!adminSection) {
        return;
    }

    if (!canAccessAdminDashboard()) {
        adminSection.innerHTML = "";
        adminSection.onclick = null;
        return;
    }

    renderOrganismeDashboard();
}

export function renderOrganismeDashboard() {
    const adminSection = document.getElementById("admin-section");
    const currentTeacherId = Number(appState.currentUser?.id ?? 0) || null;

    if (!adminSection) {
        return;
    }

    if (organismeDashboardUserId !== currentTeacherId) {
        organismeDashboardUserId = currentTeacherId;
        organismeDashboardRequest = null;
        organismeDashboardError = "";
        appState.organismeDashboard = null;
    }

    if (!appState.organismeDashboard && !organismeDashboardError && !organismeDashboardRequest) {
        void fetchOrganismeDashboardData();
    }

    if (organismeDashboardError !== "") {
        adminSection.innerHTML = `
            <article class="section-panel">
                <div class="section-heading">
                    <div>
                        <h2 id="admin-heading" class="section-title" tabindex="-1">${escapeHtml(t("organisme_dashboard_title"))}</h2>
                    </div>
                </div>
                <div class="empty-state">${escapeHtml(organismeDashboardError)}</div>
            </article>
        `;
        adminSection.onclick = null;
        return;
    }

    const dashboard = appState.organismeDashboard;
    const stats = dashboard?.stats || {};
    const members = getSortedOrganismeMembers(dashboard?.members);
    const popularModules = Array.isArray(dashboard?.popular_modules) ? dashboard.popular_modules : [];
    const emptyValue = t("organisme_no_activity");

    adminSection.innerHTML = `
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 id="admin-heading" class="section-title" tabindex="-1">${escapeHtml(t("organisme_dashboard_title"))}</h2>
                </div>
                <div class="button-row">
                    <button class="button button-ghost" type="button" data-action="export-organisme-dashboard">
                        ${escapeHtml(t("organisme_export_button"))}
                    </button>
                </div>
            </div>

            <div class="heroes-journey__meta">
                ${renderOrganismeStatCard(stats.total_members ?? 0, t("organisme_stats_members"))}
                ${renderOrganismeStatCard(stats.active_this_month ?? 0, t("organisme_stats_active"))}
                ${renderOrganismeStatCard(stats.modules_completed ?? 0, t("organisme_stats_modules"))}
                ${renderOrganismeStatCard(stats.quiz_average === null || stats.quiz_average === undefined ? emptyValue : stats.quiz_average, t("organisme_stats_quiz_average"))}
            </div>

            <h3>${escapeHtml(t("organisme_members_title"))}</h3>
            ${renderOrganismeMembersTable(members)}

            <h3>${escapeHtml(t("organisme_popular_modules_title"))}</h3>
            ${renderPopularModulesList(popularModules)}
        </article>
    `;

    adminSection.onclick = (event) => {
        const trigger = event.target.closest('[data-action="export-organisme-dashboard"]');

        if (!trigger) {
            return;
        }

        exportOrganismeDashboard();
    };
}

export async function fetchOrganismeDashboardData() {
    organismeDashboardError = "";

    const request = Promise.all([
        fetch("./api/organisme-stats.php", {
            credentials: "same-origin"
        }),
        fetch("./api/organisme-members.php", {
            credentials: "same-origin"
        })
    ])
        .then(async ([statsResponse, membersResponse]) => {
            const [statsResult, membersResult] = await Promise.all([
                statsResponse.json(),
                membersResponse.json()
            ]);

            if (!statsResponse.ok) {
                throw new Error(statsResult?.message || `Organisme stats fetch failed with status ${statsResponse.status}.`);
            }

            if (!membersResponse.ok) {
                throw new Error(membersResult?.message || `Organisme members fetch failed with status ${membersResponse.status}.`);
            }

            appState.organismeDashboard = {
                stats: statsResult?.data?.stats && typeof statsResult.data.stats === "object"
                    ? statsResult.data.stats
                    : null,
                popular_modules: Array.isArray(statsResult?.data?.popular_modules)
                    ? statsResult.data.popular_modules
                    : [],
                members: Array.isArray(membersResult?.data?.members)
                    ? membersResult.data.members
                    : []
            };
            organismeDashboardError = "";
            renderOrganismeDashboard();
        })
        .catch((error) => {
            console.error("Unable to load organisme dashboard.", error);
            appState.organismeDashboard = null;
            organismeDashboardError = error instanceof Error && error.message
                ? error.message
                : "Unable to load organisme dashboard.";
            renderOrganismeDashboard();
        })
        .finally(() => {
            organismeDashboardRequest = null;
        });

    organismeDashboardRequest = request;

    return request;
}

export function canAccessAdminDashboard() {
    return appState.roleCode === "teacher";
}

function renderOrganismeStatCard(value, label) {
    return `
        <article class="stat-card">
            <span class="stat-card__value">${escapeHtml(String(value))}</span>
            <span class="stat-card__label">${escapeHtml(label)}</span>
        </article>
    `;
}

function renderOrganismeMembersTable(members) {
    if (!Array.isArray(members) || members.length === 0) {
        return `<div class="empty-state">${escapeHtml(t("organisme_no_members"))}</div>`;
    }

    return `
        <div class="quiz-feedback">
            <table>
                <thead>
                    <tr>
                        <th>${escapeHtml(t("admin_display_name_label"))}</th>
                        <th>${escapeHtml(t("organisme_stats_modules"))}</th>
                        <th>${escapeHtml(t("admin_completed_at_label"))}</th>
                    </tr>
                </thead>
                <tbody>
                    ${members.map((member) => `
                        <tr>
                            <td>${escapeHtml(formatOrganismeMemberName(member))}</td>
                            <td>${escapeHtml(String(member.modules_completed ?? 0))}</td>
                            <td>${escapeHtml(formatOrganismeDashboardDate(member.last_activity))}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderPopularModulesList(popularModules) {
    if (!Array.isArray(popularModules) || popularModules.length === 0) {
        return `<div class="empty-state">${escapeHtml(t("organisme_no_members"))}</div>`;
    }

    return `
        <ul class="quiz-feedback">
            ${popularModules.map((moduleItem) => `
                <li class="quiz-feedback__text">
                    ${escapeHtml(`${resolveModuleLabel(moduleItem.module_slug)} (${Number(moduleItem.completion_count ?? 0)})`)}
                </li>
            `).join("")}
        </ul>
    `;
}

function getSortedOrganismeMembers(members) {
    const normalizedMembers = Array.isArray(members) ? members.slice() : [];

    normalizedMembers.sort((firstMember, secondMember) => {
        const firstTime = getDateTimestamp(firstMember?.last_activity);
        const secondTime = getDateTimestamp(secondMember?.last_activity);

        if (secondTime !== firstTime) {
            return secondTime - firstTime;
        }

        return String(firstMember?.display_name || "").localeCompare(String(secondMember?.display_name || ""));
    });

    return normalizedMembers;
}

function getDateTimestamp(value) {
    const parsedDate = value ? new Date(value) : null;

    if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
        return 0;
    }

    return parsedDate.getTime();
}

function formatOrganismeDashboardDate(value) {
    const parsedDate = value ? new Date(value) : null;

    if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
        return t("organisme_no_activity");
    }

    return parsedDate.toLocaleDateString(appState.language || undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatOrganismeMemberName(member) {
    const displayName = String(member?.display_name || "").trim();
    const username = String(member?.username || "").trim();

    if (displayName !== "") {
        return displayName;
    }

    return username;
}

function resolveModuleLabel(slug) {
    const modules = Array.isArray(window.IstwaModules) ? window.IstwaModules : [];
    const matchingModule = modules.find((module) => module?.slug === slug);
    const localizedQuestion = matchingModule?.question?.[appState.language]
        || matchingModule?.question?.fr
        || matchingModule?.question?.ht
        || matchingModule?.question?.en;

    if (Array.isArray(localizedQuestion)) {
        return localizedQuestion.map((item) => String(item ?? "").trim()).filter(Boolean).join(" ");
    }

    return String(localizedQuestion || slug || "");
}

function exportOrganismeDashboard() {
    const dashboard = appState.organismeDashboard;

    if (!dashboard) {
        return;
    }

    const stats = dashboard.stats || {};
    const members = getSortedOrganismeMembers(dashboard.members);
    const emptyValue = t("organisme_no_activity");
    const lines = [
        t("organisme_dashboard_title"),
        "",
        `${t("organisme_stats_members")} : ${stats.total_members ?? 0}`,
        `${t("organisme_stats_active")} : ${stats.active_this_month ?? 0}`,
        `${t("organisme_stats_modules")} : ${stats.modules_completed ?? 0}`,
        `${t("organisme_stats_quiz_average")} : ${stats.quiz_average === null || stats.quiz_average === undefined ? emptyValue : stats.quiz_average}`,
        "",
        t("organisme_members_title"),
        ...members.map((member) => {
            const memberName = formatOrganismeMemberName(member);
            const lastActivity = formatOrganismeDashboardDate(member.last_activity);

            return `${memberName} | ${t("organisme_stats_modules")}: ${Number(member.modules_completed ?? 0)} | ${lastActivity}`;
        })
    ];
    const fileContent = lines.join("\n");
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "organisme-dashboard.txt";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
}
