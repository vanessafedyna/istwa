<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/helpers/request.php';
require_once dirname(__DIR__) . '/app/repositories/UserRepository.php';
require_once dirname(__DIR__) . '/app/repositories/OrganismeRepository.php';
require_once dirname(__DIR__) . '/app/services/AuthService.php';

try {
    enforcePostMethod();

    $payload = readJsonRequestBody();
    $pdo = $app['pdo'];
    $userRepository = new UserRepository($pdo);
    $organismeRepository = new OrganismeRepository($pdo);
    $authService = new AuthService($userRepository);
    $joinCode = normalizeJoinCode($payload);
    $organisme = null;

    if ($joinCode !== null) {
        $organisme = $organismeRepository->findByJoinCode($joinCode);

        if ($organisme === null) {
            throw new InvalidArgumentException('The "join_code" field is invalid.');
        }
    }

    $payload['username'] = generateUsernameFromPayload($payload, $userRepository);
    $payload['display_name'] = generateDisplayNameFromPayload($payload);

    $pdo->beginTransaction();

    try {
        $user = $authService->register($payload);

        if ($organisme !== null) {
            $statement = $pdo->prepare('
                UPDATE users
                SET organisme_id = :organisme_id,
                    join_code_used = :join_code_used
                WHERE id = :id
            ');
            $statement->bindValue(':organisme_id', (int) $organisme['id'], PDO::PARAM_INT);
            $statement->bindValue(':join_code_used', $joinCode, PDO::PARAM_STR);
            $statement->bindValue(':id', (int) $user['id'], PDO::PARAM_INT);
            $statement->execute();
        }

        $pdo->commit();
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }

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

function normalizeJoinCode(array $payload): ?string
{
    if (!array_key_exists('join_code', $payload)) {
        return null;
    }

    $joinCode = strtoupper(trim((string) $payload['join_code']));

    return $joinCode === '' ? null : $joinCode;
}

function generateUsernameFromPayload(array $payload, UserRepository $userRepository): string
{
    $email = strtolower(trim((string) ($payload['email'] ?? '')));
    $emailLocalPart = $email;

    if (str_contains($email, '@')) {
        $emailLocalPart = explode('@', $email, 2)[0];
    }

    $baseUsername = preg_replace('/[^a-z0-9]+/', '-', $emailLocalPart);
    $baseUsername = trim((string) $baseUsername, '-');

    if ($baseUsername === '') {
        $baseUsername = 'user';
    }

    $baseUsername = substr($baseUsername, 0, 84);
    $candidate = $baseUsername;
    $suffix = 1;

    while ($userRepository->findByUsername($candidate) !== null) {
        $candidate = substr($baseUsername, 0, max(1, 100 - strlen((string) $suffix) - 1)) . '-' . $suffix;
        $suffix += 1;
    }

    return $candidate;
}

function generateDisplayNameFromPayload(array $payload): string
{
    $email = trim((string) ($payload['email'] ?? ''));
    $emailLocalPart = $email;

    if (str_contains($email, '@')) {
        $emailLocalPart = explode('@', $email, 2)[0];
    }

    $displayName = trim($emailLocalPart);

    if ($displayName === '') {
        $displayName = trim($email);
    }

    if ($displayName === '') {
        return 'Utilisateur Istwa';
    }

    return substr($displayName, 0, 150);
}
