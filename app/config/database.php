<?php
declare(strict_types=1);

return [
    'host' => getenv('ISTWA_DB_HOST') ?: '127.0.0.1',
    'port' => (int) (getenv('ISTWA_DB_PORT') ?: 3306),
    'database' => getenv('ISTWA_DB_NAME') ?: 'istwa',
    'username' => getenv('ISTWA_DB_USER') ?: 'root',
    'password' => getenv('ISTWA_DB_PASS') ?: '',
    'charset' => getenv('ISTWA_DB_CHARSET') ?: 'utf8mb4',
];
