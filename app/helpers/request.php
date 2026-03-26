<?php
declare(strict_types=1);

function enforcePostMethod(): void
{
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($requestMethod !== 'POST') {
        throw new RuntimeException('Method not allowed.', 405);
    }
}

function readJsonRequestBody(): array
{
    $rawBody = file_get_contents('php://input');

    if ($rawBody === false) {
        throw new RuntimeException('Unable to read request body.', 400);
    }

    $rawBody = trim($rawBody);

    if ($rawBody === '') {
        throw new InvalidArgumentException('Request body is required.');
    }

    try {
        $decodedBody = json_decode($rawBody, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $exception) {
        throw new InvalidArgumentException('Invalid JSON payload.');
    }

    if (!is_array($decodedBody)) {
        throw new InvalidArgumentException('JSON payload must be an object.');
    }

    return $decodedBody;
}
