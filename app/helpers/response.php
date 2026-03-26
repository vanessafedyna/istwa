<?php
declare(strict_types=1);

function jsonSuccess(array $data = [], int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode([
        'status' => 'ok',
        'data' => $data,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}

function jsonError(string $message, int $statusCode = 400, array $errors = []): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');

    $response = [
        'status' => 'error',
        'message' => $message,
    ];

    if ($errors !== []) {
        $response['errors'] = $errors;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}
