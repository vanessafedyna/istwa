<?php
declare(strict_types=1);

$app = require dirname(__DIR__) . '/app/bootstrap.php';

require_once dirname(__DIR__) . '/app/helpers/session.php';
require_once dirname(__DIR__) . '/app/helpers/response.php';
require_once dirname(__DIR__) . '/app/repositories/OrganismeRepository.php';

try {
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($requestMethod !== 'GET') {
        throw new RuntimeException('Method not allowed.', 405);
    }

    $authenticatedUserId = requireAuthenticatedUserId();
    ensureSessionStarted();

    $roleCode = (string) ($_SESSION['role_code'] ?? '');

    if ($roleCode !== 'teacher') {
        throw new RuntimeException('Forbidden.', 403);
    }

    $statement = $app['pdo']->prepare('
        SELECT organisme_id
        FROM users
        WHERE id = :id
        LIMIT 1
    ');
    $statement->bindValue(':id', $authenticatedUserId, PDO::PARAM_INT);
    $statement->execute();

    $organismeId = $statement->fetchColumn();

    if ($organismeId === false || $organismeId === null) {
        throw new RuntimeException('No organisme linked.', 400);
    }

    $organismeRepository = new OrganismeRepository($app['pdo']);

    jsonSuccess([
        'members' => $organismeRepository->getOrganismeMembers((int) $organismeId),
    ]);
} catch (RuntimeException $exception) {
    $statusCode = (int) $exception->getCode();

    if ($statusCode < 400 || $statusCode > 499) {
        $statusCode = 500;
    }

    jsonError($exception->getMessage(), $statusCode);
} catch (Throwable $exception) {
    jsonError('Unable to load organisme members.', 500);
}
