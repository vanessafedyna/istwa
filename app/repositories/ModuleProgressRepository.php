<?php
declare(strict_types=1);

final class ModuleProgressRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function save(array $data): void
    {
        $sql = '
            INSERT INTO module_progress (
                user_id,
                module_slug,
                score,
                completed_at
            ) VALUES (
                :user_id,
                :module_slug,
                :score,
                :completed_at
            )
            ON DUPLICATE KEY UPDATE
                score = VALUES(score),
                completed_at = VALUES(completed_at)
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':user_id', $data['user_id'], PDO::PARAM_INT);
        $statement->bindValue(':module_slug', $data['module_slug'], PDO::PARAM_STR);
        $statement->bindValue(':score', $data['score'], PDO::PARAM_INT);
        $statement->bindValue(':completed_at', $data['completed_at'], PDO::PARAM_STR);
        $statement->execute();
    }

    public function findByUserId(int $userId): array
    {
        $sql = '
            SELECT
                module_slug,
                score,
                completed_at
            FROM module_progress
            WHERE user_id = :user_id
            ORDER BY completed_at DESC, id DESC
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll() ?: [];
    }
}
