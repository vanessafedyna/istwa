<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/helpers/request.php';
require_once dirname(__DIR__) . '/app/repositories/ModuleProgressRepository.php';

try {
    enforcePostMethod();

    $authenticatedUserId = requireAuthenticatedUserId();
    $payload = readJsonRequestBody();

    if (!array_key_exists('module_slug', $payload)) {
        throw new InvalidArgumentException('The "module_slug" field is required.');
    }

    $moduleSlug = trim((string) $payload['module_slug']);

    if ($moduleSlug === '') {
        throw new InvalidArgumentException('The "module_slug" field is required.');
    }

    if (!array_key_exists('score', $payload)) {
        throw new InvalidArgumentException('The "score" field is required.');
    }

    if (filter_var($payload['score'], FILTER_VALIDATE_INT) === false) {
        throw new InvalidArgumentException('The "score" field must be an integer.');
    }

    $score = (int) $payload['score'];

    if ($score < 0 || $score > 3) {
        throw new InvalidArgumentException('The "score" field is invalid.');
    }

    if (!array_key_exists('completed_at', $payload)) {
        throw new InvalidArgumentException('The "completed_at" field is required.');
    }

    $completedAt = trim((string) $payload['completed_at']);

    if ($completedAt === '') {
        throw new InvalidArgumentException('The "completed_at" field is required.');
    }

    $timestamp = strtotime($completedAt);

    if ($timestamp === false) {
        throw new InvalidArgumentException('The "completed_at" field must be a valid date.');
    }

    $moduleProgressRepository = new ModuleProgressRepository($app['pdo']);
    $moduleProgressRepository->save([
        'user_id' => $authenticatedUserId,
        'module_slug' => $moduleSlug,
        'score' => $score,
        'completed_at' => date('Y-m-d H:i:s', $timestamp),
    ]);

    jsonSuccess([
        'saved' => true,
    ]);
} catch (InvalidArgumentException $exception) {
    jsonError($exception->getMessage(), 422);
} catch (RuntimeException $exception) {
    $statusCode = (int) $exception->getCode();

    if ($statusCode < 400 || $statusCode > 499) {
        $statusCode = 400;
    }

    jsonError($exception->getMessage(), $statusCode);
} catch (Throwable $exception) {
    jsonError('Unable to save module progress.', 500);
}
