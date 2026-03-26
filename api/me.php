<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/repositories/UserRepository.php';

try {
    ensureSessionStarted();

    $userId = getAuthenticatedUserId();

    if ($userId === null) {
        jsonSuccess([
            'authenticated' => false,
            'user' => null,
            'role_code' => 'guest',
        ]);
    }

    $userRepository = new UserRepository($app['pdo']);
    $user = $userRepository->findById($userId);

    if ($user === null) {
        logoutUserSession();

        jsonSuccess([
            'authenticated' => false,
            'user' => null,
            'role_code' => 'guest',
        ]);
    }

    jsonSuccess([
        'authenticated' => true,
        'user' => [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'language_preference' => $user['language_preference'],
            'status' => $user['status'],
            'role' => [
                'id' => (int) $user['role_id'],
                'code' => $user['role_code'],
                'name' => $user['role_name'],
            ],
            'created_at' => $user['created_at'],
            'updated_at' => $user['updated_at'],
        ],
        'role_code' => $user['role_code'],
    ]);
} catch (Throwable $exception) {
    jsonError('Unable to load current user.', 500);
}
