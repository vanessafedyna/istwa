<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

try {
    $app = require dirname(__DIR__) . '/app/bootstrap.php';
    $pdo = $app['pdo'];

    $statement = $pdo->query('SELECT 1');
    $databaseOk = $statement !== false && (string) $statement->fetchColumn() === '1';

    if (!$databaseOk) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed.',
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'ok',
        'message' => 'Database connection successful.',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unable to connect to the database.',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
