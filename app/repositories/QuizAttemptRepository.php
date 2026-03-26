<?php
declare(strict_types=1);

final class QuizAttemptRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function create(array $quizAttemptData): int
    {
        $sql = '
            INSERT INTO quiz_attempts (
                user_id,
                quiz_key,
                score,
                total_questions,
                answers_json,
                language,
                completed_at
            ) VALUES (
                :user_id,
                :quiz_key,
                :score,
                :total_questions,
                :answers_json,
                :language,
                :completed_at
            )
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':user_id', $quizAttemptData['user_id'], $quizAttemptData['user_id'] === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $statement->bindValue(':quiz_key', $quizAttemptData['quiz_key'], PDO::PARAM_STR);
        $statement->bindValue(':score', $quizAttemptData['score'], PDO::PARAM_INT);
        $statement->bindValue(':total_questions', $quizAttemptData['total_questions'], PDO::PARAM_INT);
        $statement->bindValue(':answers_json', $quizAttemptData['answers_json'], PDO::PARAM_STR);
        $statement->bindValue(':language', $quizAttemptData['language'], PDO::PARAM_STR);
        $statement->bindValue(':completed_at', $quizAttemptData['completed_at'], PDO::PARAM_STR);
        $statement->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function findByUserId(int $userId): array
    {
        $sql = '
            SELECT
                score,
                total_questions,
                completed_at,
                quiz_key
            FROM quiz_attempts
            WHERE user_id = :user_id
            ORDER BY completed_at DESC, id DESC
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $statement->execute();

        return $statement->fetchAll() ?: [];
    }

    public function findAllForAdminList(): array
    {
        $sql = '
            SELECT
                quiz_attempts.user_id,
                users.username,
                users.display_name,
                quiz_attempts.score,
                quiz_attempts.total_questions,
                quiz_attempts.completed_at
            FROM quiz_attempts
            INNER JOIN users ON users.id = quiz_attempts.user_id
            ORDER BY quiz_attempts.completed_at DESC, quiz_attempts.id DESC
        ';

        $statement = $this->pdo->query($sql);

        return $statement->fetchAll() ?: [];
    }
}
