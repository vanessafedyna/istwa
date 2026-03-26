<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/helpers/request.php';
require_once dirname(__DIR__) . '/app/repositories/UserActivityRepository.php';
require_once dirname(__DIR__) . '/app/services/UserActivityService.php';

try {
    enforcePostMethod();

    $authenticatedUserId = requireAuthenticatedUserId();
    $payload = readJsonRequestBody();
    $activityService = new UserActivityService();
    $activityData = $activityService->validateAndPrepareTrackPayload($payload);

    $activityRepository = new UserActivityRepository($app['pdo']);
    $activityId = $activityRepository->create(
        $authenticatedUserId,
        $activityData['activity_type'],
        $activityData['target_key'],
        $activityData['metadata_json']
    );

    jsonSuccess([
        'activity_id' => $activityId,
        'message' => 'Activity tracked successfully.',
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
    jsonError('Unable to track activity.', 500);
}
