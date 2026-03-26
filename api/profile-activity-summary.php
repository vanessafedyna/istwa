<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/repositories/UserActivityRepository.php';

try {
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($requestMethod !== 'GET' && $requestMethod !== 'POST') {
        throw new RuntimeException('Method not allowed.', 405);
    }

    $authenticatedUserId = requireAuthenticatedUserId();
    $activityRepository = new UserActivityRepository($app['pdo']);
    $summary = $activityRepository->getSummaryByUserId($authenticatedUserId);

    jsonSuccess([
        'summary' => $summary,
    ]);
} catch (RuntimeException $exception) {
    $statusCode = (int) $exception->getCode();

    if ($statusCode < 400 || $statusCode > 499) {
        $statusCode = 500;
    }

    jsonError($exception->getMessage(), $statusCode);
} catch (Throwable $exception) {
    jsonError('Unable to load profile activity summary.', 500);
}
