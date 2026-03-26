<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/repositories/QuizAttemptRepository.php';

try {
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($requestMethod !== 'GET' && $requestMethod !== 'POST') {
        throw new RuntimeException('Method not allowed.', 405);
    }

    $authenticatedUserId = requireAuthenticatedUserId();
    $quizAttemptRepository = new QuizAttemptRepository($app['pdo']);
    $attempts = $quizAttemptRepository->findByUserId($authenticatedUserId);

    jsonSuccess([
        'attempts' => array_map(
            static fn (array $attempt): array => [
                'score' => (int) $attempt['score'],
                'total_questions' => (int) $attempt['total_questions'],
                'completed_at' => $attempt['completed_at'],
                'quiz_key' => $attempt['quiz_key'],
            ],
            $attempts
        ),
    ]);
} catch (RuntimeException $exception) {
    $statusCode = (int) $exception->getCode();

    if ($statusCode < 400 || $statusCode > 499) {
        $statusCode = 500;
    }

    jsonError($exception->getMessage(), $statusCode);
} catch (Throwable $exception) {
    jsonError('Unable to load quiz attempts.', 500);
}
