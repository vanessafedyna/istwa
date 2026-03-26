<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/helpers/request.php';
require_once dirname(__DIR__) . '/app/repositories/UserRepository.php';
require_once dirname(__DIR__) . '/app/services/AuthService.php';

try {
    enforcePostMethod();

    $payload = readJsonRequestBody();
    $userRepository = new UserRepository($app['pdo']);
    $authService = new AuthService($userRepository);
    $user = $authService->register($payload);

    loginUserSession($user['id'], $user['role']['code']);

    jsonSuccess([
        'authenticated' => true,
        'user' => $user,
    ], 201);
} catch (InvalidArgumentException $exception) {
    jsonError($exception->getMessage(), 400);
} catch (RuntimeException $exception) {
    $statusCode = (int) $exception->getCode();

    if ($statusCode < 400 || $statusCode > 499) {
        $statusCode = 500;
    }

    jsonError($exception->getMessage(), $statusCode);
} catch (Throwable $exception) {
    jsonError('Unable to register user.', 500);
}
