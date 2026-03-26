<?php
declare(strict_types=1);

final class UserRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function create(array $userData): int
    {
        $sql = '
            INSERT INTO users (
                role_id,
                email,
                username,
                password_hash,
                display_name,
                language_preference,
                status
            ) VALUES (
                :role_id,
                :email,
                :username,
                :password_hash,
                :display_name,
                :language_preference,
                :status
            )
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':role_id', $userData['role_id'], PDO::PARAM_INT);
        $statement->bindValue(':email', $userData['email'], PDO::PARAM_STR);
        $statement->bindValue(':username', $userData['username'], PDO::PARAM_STR);
        $statement->bindValue(':password_hash', $userData['password_hash'], PDO::PARAM_STR);
        $statement->bindValue(':display_name', $userData['display_name'], PDO::PARAM_STR);
        $statement->bindValue(':language_preference', $userData['language_preference'], PDO::PARAM_STR);
        $statement->bindValue(':status', $userData['status'], PDO::PARAM_STR);
        $statement->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function findRoleIdByCode(string $roleCode): ?int
    {
        $sql = '
            SELECT id
            FROM roles
            WHERE code = :code
            LIMIT 1
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':code', $roleCode, PDO::PARAM_STR);
        $statement->execute();

        $roleId = $statement->fetchColumn();

        return $roleId === false ? null : (int) $roleId;
    }

    public function findById(int $id): ?array
    {
        $sql = '
            SELECT
                users.id,
                users.role_id,
                users.email,
                users.username,
                users.password_hash,
                users.display_name,
                users.language_preference,
                users.status,
                users.created_at,
                users.updated_at,
                roles.code AS role_code,
                roles.name AS role_name
            FROM users
            INNER JOIN roles ON roles.id = users.role_id
            WHERE users.id = :id
            LIMIT 1
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':id', $id, PDO::PARAM_INT);
        $statement->execute();

        $user = $statement->fetch();

        return $user === false ? null : $user;
    }

    public function findByEmail(string $email): ?array
    {
        $sql = '
            SELECT
                users.id,
                users.role_id,
                users.email,
                users.username,
                users.password_hash,
                users.display_name,
                users.language_preference,
                users.status,
                users.created_at,
                users.updated_at,
                roles.code AS role_code,
                roles.name AS role_name
            FROM users
            INNER JOIN roles ON roles.id = users.role_id
            WHERE users.email = :email
            LIMIT 1
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':email', $email, PDO::PARAM_STR);
        $statement->execute();

        $user = $statement->fetch();

        return $user === false ? null : $user;
    }

    public function findByUsername(string $username): ?array
    {
        $sql = '
            SELECT
                users.id,
                users.role_id,
                users.email,
                users.username,
                users.password_hash,
                users.display_name,
                users.language_preference,
                users.status,
                users.created_at,
                users.updated_at,
                roles.code AS role_code,
                roles.name AS role_name
            FROM users
            INNER JOIN roles ON roles.id = users.role_id
            WHERE users.username = :username
            LIMIT 1
        ';

        $statement = $this->pdo->prepare($sql);
        $statement->bindValue(':username', $username, PDO::PARAM_STR);
        $statement->execute();

        $user = $statement->fetch();

        return $user === false ? null : $user;
    }

    public function findAllForAdminList(): array
    {
        $sql = '
            SELECT
                id,
                email,
                username,
                display_name,
                created_at
            FROM users
            ORDER BY created_at DESC, id DESC
        ';

        $statement = $this->pdo->query($sql);

        return $statement->fetchAll() ?: [];
    }
}
