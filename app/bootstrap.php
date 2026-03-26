<?php
declare(strict_types=1);

$databaseConfig = require __DIR__ . '/config/database.php';

require_once __DIR__ . '/database/connection.php';

$pdo = createPdoConnection($databaseConfig);

return [
    'config' => [
        'database' => $databaseConfig,
    ],
    'pdo' => $pdo,
];
