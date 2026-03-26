<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/repositories/UserRepository.php';

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

    $userRepository = new UserRepository($app['pdo']);
    $users = $userRepository->findAllForAdminList();

    jsonSuccess([
        'users' => array_map(
            static fn (array $user): array => [
                'id' => (int) $user['id'],
                'email' => $user['email'],
                'username' => $user['username'],
                'display_name' => $user['display_name'],
                'created_at' => $user['created_at'],
            ],
            $users
        ),
    ]);
} catch (RuntimeException $exception) {
    $statusCode = (int) $exception->getCode();

    if ($statusCode < 400 || $statusCode > 499) {
        $statusCode = 500;
    }

    jsonError($exception->getMessage(), $statusCode);
} catch (Throwable $exception) {
    jsonError('Unable to load users list.', 500);
}
