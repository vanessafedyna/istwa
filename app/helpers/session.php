<?php
declare(strict_types=1);

function ensureSessionStarted(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function getAuthenticatedUserId(): ?int
{
    ensureSessionStarted();

    if (!isset($_SESSION['user_id'])) {
        return null;
    }

    return (int) $_SESSION['user_id'];
}

function requireAuthenticatedUserId(): int
{
    $userId = getAuthenticatedUserId();

    if ($userId === null) {
        throw new RuntimeException('Authentication required.', 401);
    }

    return $userId;
}

function loginUserSession(int $userId, string $roleCode): void
{
    ensureSessionStarted();
    session_regenerate_id(true);

    $_SESSION['user_id'] = $userId;
    $_SESSION['role_code'] = $roleCode;
    $_SESSION['logged_in_at'] = time();
}

function logoutUserSession(): void
{
    ensureSessionStarted();

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    session_destroy();
}
