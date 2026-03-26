<?php
declare(strict_types=1);

final class UserActivityRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function create(int $userId, string $activityType, string $targetKey, ?string $metadataJson = null): int
    {
        $sql = '
            INSERT INTO user_activity_events (
                user_id,
                activity_type,
                target_key,
                metadata_json,
                occurred_at
            ) VALUES (
                :user_id,
                :activity_type,
                :target_key,
                :metadata_json,
                NOW()
            )
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue(':activity_type', $activityType, PDO::PARAM_STR);
        $statement->bindValue(':target_key', $targetKey, PDO::PARAM_STR);
        $statement->bindValue(':metadata_json', $metadataJson, $metadataJson === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $statement->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function getSummaryByUserId(int $userId): array
    {
        $totalByType = $this->fetchTotalCountByType($userId);
        $uniqueByType = $this->fetchUniqueCountByType($userId);
        $lastActivityAt = $this->fetchLastActivityAt($userId);
        $recentEvents = $this->fetchRecentEvents($userId, 12);

        return [
            'last_activity_at' => $lastActivityAt,
            'total_by_type' => $totalByType,
            'unique_targets_by_type' => $uniqueByType,
            'recent_events' => $recentEvents,
        ];
    }

    private function fetchTotalCountByType(int $userId): array
    {
        $sql = '
            SELECT activity_type, COUNT(*) AS total_count
            FROM user_activity_events
            WHERE user_id = :user_id
            GROUP BY activity_type
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();

        $rows = $statement->fetchAll() ?: [];
        $result = [];

        foreach ($rows as $row) {
            $result[(string) $row['activity_type']] = (int) $row['total_count'];
        }

        return $result;
    }

    private function fetchUniqueCountByType(int $userId): array
    {
        $sql = '
            SELECT activity_type, COUNT(DISTINCT target_key) AS unique_count
            FROM user_activity_events
            WHERE user_id = :user_id
            GROUP BY activity_type
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();

        $rows = $statement->fetchAll() ?: [];
        $result = [];

        foreach ($rows as $row) {
            $result[(string) $row['activity_type']] = (int) $row['unique_count'];
        }

        return $result;
    }

    private function fetchLastActivityAt(int $userId): ?string
    {
        $sql = '
            SELECT occurred_at
            FROM user_activity_events
            WHERE user_id = :user_id
            ORDER BY occurred_at DESC, id DESC
            LIMIT 1
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();

        $row = $statement->fetch();

        if (!is_array($row) || !isset($row['occurred_at'])) {
            return null;
        }

        return (string) $row['occurred_at'];
    }

    private function fetchRecentEvents(int $userId, int $limit): array
    {
        $sql = '
            SELECT activity_type, target_key, occurred_at
            FROM user_activity_events
            WHERE user_id = :user_id
            ORDER BY occurred_at DESC, id DESC
            LIMIT :limit
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->execute();

        $rows = $statement->fetchAll() ?: [];

        return array_map(
            static fn (array $row): array => [
                'activity_type' => (string) $row['activity_type'],
                'target_key' => (string) $row['target_key'],
                'occurred_at' => (string) $row['occurred_at'],
            ],
            $rows
        );
    }
}
