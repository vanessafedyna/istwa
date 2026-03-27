<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/repositories/ModuleProgressRepository.php';

try {
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($requestMethod !== 'GET') {
        throw new RuntimeException('Method not allowed.', 405);
    }

    $authenticatedUserId = requireAuthenticatedUserId();
    $moduleProgressRepository = new ModuleProgressRepository($app['pdo']);
    $results = $moduleProgressRepository->findByUserId($authenticatedUserId);

    jsonSuccess([
        'progress' => array_map(
            static fn (array $result): array => [
                'module_slug' => (string) $result['module_slug'],
                'score' => (int) $result['score'],
                'completed_at' => (string) $result['completed_at'],
            ],
            $results
        ),
    ]);
} catch (RuntimeException $exception) {
    $statusCode = (int) $exception->getCode();

    if ($statusCode < 400 || $statusCode > 499) {
        $statusCode = 500;
    }

    jsonError($exception->getMessage(), $statusCode);
} catch (Throwable $exception) {
    jsonError('Unable to load module progress.', 500);
}
