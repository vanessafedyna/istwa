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

    requireAuthenticatedUserId();
    ensureSessionStarted();

    $roleCode = (string) ($_SESSION['role_code'] ?? '');

    if ($roleCode !== 'teacher' && $roleCode !== 'admin') {
        throw new RuntimeException('Forbidden.', 403);
    }

    $quizAttemptRepository = new QuizAttemptRepository($app['pdo']);
    $attempts = $quizAttemptRepository->findAllForAdminList();

    jsonSuccess([
        'attempts' => array_map(
            static fn (array $attempt): array => [
                'user_id' => (int) $attempt['user_id'],
                'username' => $attempt['username'],
                'display_name' => $attempt['display_name'],
                'score' => (int) $attempt['score'],
                'total_questions' => (int) $attempt['total_questions'],
                'completed_at' => $attempt['completed_at'],
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
    jsonError('Unable to load quiz attempts list.', 500);
}
