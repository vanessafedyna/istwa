<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/helpers/request.php';
require_once dirname(__DIR__) . '/app/repositories/QuizAttemptRepository.php';
require_once dirname(__DIR__) . '/app/services/QuizService.php';

try {
    enforcePostMethod();

    $authenticatedUserId = requireAuthenticatedUserId();
    $payload = readJsonRequestBody();
    $quizService = new QuizService();
    $quizAttemptData = $quizService->validateAndPrepareAttempt($payload);
    $quizAttemptData['user_id'] = $authenticatedUserId;

    $quizAttemptRepository = new QuizAttemptRepository($app['pdo']);
    $quizAttemptId = $quizAttemptRepository->create($quizAttemptData);

    jsonSuccess([
        'quiz_attempt_id' => $quizAttemptId,
        'message' => 'Quiz attempt saved successfully.',
    ], 201);
} catch (InvalidArgumentException $exception) {
    jsonError($exception->getMessage(), 422);
} catch (RuntimeException $exception) {
    $statusCode = (int) $exception->getCode();

    if ($statusCode < 400 || $statusCode > 499) {
        $statusCode = 400;
    }

    jsonError($exception->getMessage(), $statusCode);
} catch (Throwable $exception) {
    jsonError('Unable to save quiz attempt.', 500);
}
