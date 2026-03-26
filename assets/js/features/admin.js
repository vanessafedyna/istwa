import { appState } from "../core/state.js";
import { t } from "../core/i18n.js";
import { escapeHtml } from "../core/ui.js";

export function renderAdmin() {
    const adminSection = document.getElementById("admin-section");

    if (!adminSection) {
        return;
    }

    if (!canAccessAdminDashboard()) {
        adminSection.innerHTML = "";
        return;
    }

    adminSection.innerHTML = `
        <article class="section-panel">
            <div class="section-heading">
                <div>
                    <h2 id="admin-heading" class="section-title" tabindex="-1">${escapeHtml(t("admin_title"))}</h2>
                    <p class="section-intro">${escapeHtml(t("admin_intro"))}</p>
                </div>
            </div>

            ${renderAdminStats()}
            ${renderSelectedUserStats()}

            <h3>${escapeHtml(t("admin_users_title"))}</h3>
            ${renderAdminUsersTable()}

            <h3>${escapeHtml(t("admin_quiz_attempts_title"))}</h3>
            ${renderAdminUserFilter()}
            ${renderAdminQuizAttemptsTable()}
        </article>
    `;
}

function renderAdminStats() {
    const stats = getAdminStats(getFilteredAdminQuizAttempts());
    const averagePercent = Math.round(stats.averageScoreRatio * 100);

    return `
        <div class="quiz-feedback">
            <p class="quiz-feedback__text">${escapeHtml(t("admin_stats_title"))}</p>
            <p class="quiz-feedback__text">${escapeHtml(`${t("admin_stats_total_attempts")} ${stats.totalAttempts}`)}</p>
            <p class="quiz-feedback__text">${escapeHtml(`${t("admin_stats_average")} ${averagePercent} %`)}</p>
            <p class="quiz-feedback__text">${escapeHtml(`${t("admin_stats_best")} ${stats.bestScore}/${stats.bestTotalQuestions}`)}</p>
        </div>
    `;
}

function renderSelectedUserStats() {
    const attempts = getFilteredAdminQuizAttempts();

    if (appState.selectedUserFilter === "all" || attempts.length === 0) {
        return "";
    }

    const stats = getAdminStats(attempts);
    const averagePercent = Math.round(stats.averageScoreRatio * 100);
    const selectedUser = appState.adminUsers.find((user) => String(user.id) === appState.selectedUserFilter);
    const selectedUserLabel = selectedUser
        ? selectedUser.display_name || selectedUser.username || String(selectedUser.id)
        : appState.selectedUserFilter;

    return `
        <div class="quiz-feedback">
            <p class="quiz-feedback__text">${escapeHtml(`${t("admin_user_stats_title")} ${selectedUserLabel}`)}</p>
            <p class="quiz-feedback__text">${escapeHtml(`${t("admin_stats_total_attempts")} ${stats.totalAttempts}`)}</p>
            <p class="quiz-feedback__text">${escapeHtml(`${t("admin_stats_average")} ${averagePercent} %`)}</p>
            <p class="quiz-feedback__text">${escapeHtml(`${t("admin_stats_best")} ${stats.bestScore}/${stats.bestTotalQuestions}`)}</p>
        </div>
    `;
}

function renderAdminUserFilter() {
    return `
        <div class="quiz-feedback">
            <label for="admin-user-filter" class="quiz-feedback__text">
                ${escapeHtml(t("admin_filter_label"))}
            </label>
            <select id="admin-user-filter">
                <option value="all"${appState.selectedUserFilter === "all" ? " selected" : ""}>
                    ${escapeHtml(t("admin_filter_all_users"))}
                </option>
                ${appState.adminUsers.map((user) => {
                    const optionValue = String(user.id);
                    const optionLabel = user.display_name || user.username || optionValue;

                    return `
                        <option value="${escapeHtml(optionValue)}"${appState.selectedUserFilter === optionValue ? " selected" : ""}>
                            ${escapeHtml(optionLabel)}
                        </option>
                    `;
                }).join("")}
            </select>
        </div>
    `;
}

function renderAdminUsersTable() {
    if (!Array.isArray(appState.adminUsers) || appState.adminUsers.length === 0) {
        return `<div class="empty-state">${escapeHtml(t("admin_empty"))}</div>`;
    }

    return `
        <div class="quiz-feedback">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>${escapeHtml(t("admin_email_label"))}</th>
                        <th>${escapeHtml(t("admin_username_label"))}</th>
                        <th>${escapeHtml(t("admin_display_name_label"))}</th>
                        <th>${escapeHtml(t("admin_created_at_label"))}</th>
                    </tr>
                </thead>
                <tbody>
                    ${appState.adminUsers.map((user) => `
                        <tr>
                            <td>${escapeHtml(String(user.id))}</td>
                            <td>${escapeHtml(user.email || "")}</td>
                            <td>${escapeHtml(user.username || "")}</td>
                            <td>${escapeHtml(user.display_name || "")}</td>
                            <td>${escapeHtml(formatAdminDate(user.created_at))}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderAdminQuizAttemptsTable() {
    const attempts = getFilteredAdminQuizAttempts();

    if (attempts.length === 0) {
        return `<div class="empty-state">${escapeHtml(t("admin_quiz_attempts_empty"))}</div>`;
    }

    return `
            <div class="quiz-feedback">
                <table>
                    <thead>
                        <tr>
                            <th>${escapeHtml(t("admin_user_label"))}</th>
                            <th>${escapeHtml(t("admin_score_label"))}</th>
                            <th>${escapeHtml(t("admin_completed_at_label"))}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attempts.map((attempt) => `
                            <tr>
                                <td>${escapeHtml(formatAdminUser(attempt))}</td>
                                <td>${escapeHtml(`${attempt.score || 0}/${attempt.total_questions || 0}`)}</td>
                                <td>${escapeHtml(formatAdminDate(attempt.completed_at))}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
    `;
}

export function canAccessAdminDashboard() {
    return appState.roleCode === "teacher" || appState.roleCode === "admin";
}

function formatAdminDate(value) {
    const parsedDate = value ? new Date(value) : null;

    if (parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleString(appState.language || undefined);
    }

    return String(value || "");
}

function formatAdminUser(attempt) {
    const displayName = String(attempt?.display_name || "").trim();
    const username = String(attempt?.username || "").trim();

    if (displayName !== "" && username !== "") {
        return `${displayName} (${username})`;
    }

    return displayName || username || String(attempt?.user_id || "");
}

function getAdminStats() {
    const attempts = arguments.length > 0 ? arguments[0] : [];
    let bestScore = 0;
    let bestTotalQuestions = 0;
    let totalScoreRatio = 0;

    attempts.forEach((attempt) => {
        const score = Number(attempt?.score ?? 0);
        const totalQuestions = Number(attempt?.total_questions ?? 0);
        const scoreRatio = totalQuestions > 0 ? score / totalQuestions : 0;
        const bestScoreRatio = bestTotalQuestions > 0 ? bestScore / bestTotalQuestions : 0;

        totalScoreRatio += scoreRatio;

        if (scoreRatio > bestScoreRatio) {
            bestScore = score;
            bestTotalQuestions = totalQuestions;
        }
    });

    return {
        totalAttempts: attempts.length,
        averageScoreRatio: attempts.length > 0 ? totalScoreRatio / attempts.length : 0,
        bestScore,
        bestTotalQuestions
    };
}

function getFilteredAdminQuizAttempts() {
    const attempts = Array.isArray(appState.adminQuizAttempts) ? appState.adminQuizAttempts : [];

    if (appState.selectedUserFilter === "all") {
        return attempts;
    }

    return attempts.filter((attempt) => String(attempt?.user_id || "") === appState.selectedUserFilter);
}
