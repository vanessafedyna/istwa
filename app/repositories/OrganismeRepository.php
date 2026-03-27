<?php
declare(strict_types=1);

final class OrganismeRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function findByJoinCode(string $joinCode): ?array
    {
        $normalizedJoinCode = strtoupper(trim($joinCode));

        $sql = '
            SELECT
                id,
                name,
                slug,
                join_code,
                contact_email,
                status,
                created_at
            FROM organismes
            WHERE join_code = :join_code
              AND status = :status
            LIMIT 1
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':join_code', $normalizedJoinCode, PDO::PARAM_STR);
        $statement->bindValue(':status', 'active', PDO::PARAM_STR);
        $statement->execute();

        $organisme = $statement->fetch();

        return $organisme === false ? null : $organisme;
    }

    public function findById(int $id): ?array
    {
        $sql = '
            SELECT
                id,
                name,
                slug,
                join_code,
                contact_email,
                status,
                created_at
            FROM organismes
            WHERE id = :id
            LIMIT 1
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':id', $id, PDO::PARAM_INT);
        $statement->execute();

        $organisme = $statement->fetch();

        return $organisme === false ? null : $organisme;
    }

    public function getOrganismeStats(int $organismeId): array
    {
        return [
            'total_members' => $this->fetchTotalMembers($organismeId),
            'active_this_month' => $this->fetchActiveThisMonth($organismeId),
            'modules_completed' => $this->fetchModulesCompleted($organismeId),
            'quiz_average' => $this->fetchQuizAverage($organismeId),
        ];
    }

    public function getOrganismeMembers(int $organismeId): array
    {
        $sql = '
            SELECT
                users.id,
                users.display_name,
                users.username,
                users.created_at,
                (
                    SELECT COUNT(*)
                    FROM module_progress
                    WHERE module_progress.user_id = users.id
                ) AS modules_completed,
                (
                    SELECT MAX(activity_at)
                    FROM (
                        SELECT MAX(module_progress.completed_at) AS activity_at
                        FROM module_progress
                        WHERE module_progress.user_id = users.id

                        UNION ALL

                        SELECT MAX(quiz_attempts.completed_at) AS activity_at
                        FROM quiz_attempts
                        WHERE quiz_attempts.user_id = users.id
                    ) AS activity_rows
                ) AS last_activity
            FROM users
            WHERE users.organisme_id = :organisme_id
            ORDER BY users.display_name ASC, users.username ASC, users.id ASC
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':organisme_id', $organismeId, PDO::PARAM_INT);
        $statement->execute();

        $rows = $statement->fetchAll() ?: [];

        return array_map(
            static fn (array $row): array => [
                'id' => (int) $row['id'],
                'display_name' => (string) $row['display_name'],
                'username' => (string) $row['username'],
                'created_at' => (string) $row['created_at'],
                'modules_completed' => (int) $row['modules_completed'],
                'last_activity' => $row['last_activity'] === null ? null : (string) $row['last_activity'],
            ],
            $rows
        );
    }

    public function getPopularModules(int $organismeId): array
    {
        $sql = '
            SELECT
                module_progress.module_slug,
                COUNT(*) AS completion_count
            FROM module_progress
            INNER JOIN users ON users.id = module_progress.user_id
            WHERE users.organisme_id = :organisme_id
            GROUP BY module_progress.module_slug
            ORDER BY completion_count DESC, module_progress.module_slug ASC
            LIMIT 5
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':organisme_id', $organismeId, PDO::PARAM_INT);
        $statement->execute();

        $rows = $statement->fetchAll() ?: [];

        return array_map(
            static fn (array $row): array => [
                'module_slug' => (string) $row['module_slug'],
                'completion_count' => (int) $row['completion_count'],
            ],
            $rows
        );
    }

    private function fetchTotalMembers(int $organismeId): int
    {
        $sql = '
            SELECT COUNT(*)
            FROM users
            WHERE organisme_id = :organisme_id
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':organisme_id', $organismeId, PDO::PARAM_INT);
        $statement->execute();

        return (int) $statement->fetchColumn();
    }

    private function fetchActiveThisMonth(int $organismeId): int
    {
        $sql = '
            SELECT COUNT(DISTINCT users.id)
            FROM users
            WHERE users.organisme_id = :organisme_id
              AND (
                    EXISTS (
                        SELECT 1
                        FROM module_progress
                        WHERE module_progress.user_id = users.id
                          AND module_progress.completed_at >= DATE_FORMAT(CURRENT_DATE, "%Y-%m-01")
                    )
                    OR EXISTS (
                        SELECT 1
                        FROM quiz_attempts
                        WHERE quiz_attempts.user_id = users.id
                          AND quiz_attempts.completed_at >= DATE_FORMAT(CURRENT_DATE, "%Y-%m-01")
                    )
                )
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':organisme_id', $organismeId, PDO::PARAM_INT);
        $statement->execute();

        return (int) $statement->fetchColumn();
    }

    private function fetchModulesCompleted(int $organismeId): int
    {
        $sql = '
            SELECT COUNT(*)
            FROM module_progress
            INNER JOIN users ON users.id = module_progress.user_id
            WHERE users.organisme_id = :organisme_id
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':organisme_id', $organismeId, PDO::PARAM_INT);
        $statement->execute();

        return (int) $statement->fetchColumn();
    }

    private function fetchQuizAverage(int $organismeId): ?float
    {
        $sql = '
            SELECT ROUND(AVG((quiz_attempts.score / NULLIF(quiz_attempts.total_questions, 0)) * 100), 1) AS quiz_average
            FROM quiz_attempts
            INNER JOIN users ON users.id = quiz_attempts.user_id
            WHERE users.organisme_id = :organisme_id
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':organisme_id', $organismeId, PDO::PARAM_INT);
        $statement->execute();

        $quizAverage = $statement->fetchColumn();

        return $quizAverage === false || $quizAverage === null ? null : (float) $quizAverage;
    }
}
