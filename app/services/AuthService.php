<?php
declare(strict_types=1);

final class AuthService
{
    public function __construct(private UserRepository $userRepository)
    {
    }

    public function register(array $payload): array
    {
        $email = $this->normalizeEmail($payload);
        $username = $this->normalizeUsername($payload);
        $displayName = $this->requireDisplayName($payload);
        $password = $this->requirePassword($payload);

        if ($this->userRepository->findByEmail($email) !== null) {
            throw new RuntimeException('An account with this email already exists.', 409);
        }

        if ($this->userRepository->findByUsername($username) !== null) {
            throw new RuntimeException('This username is already taken.', 409);
        }

        $studentRoleId = $this->userRepository->findRoleIdByCode('student');

        if ($studentRoleId === null) {
            throw new RuntimeException('Default role not found.');
        }

        $userId = $this->userRepository->create([
            'role_id' => $studentRoleId,
            'email' => $email,
            'username' => $username,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            'display_name' => $displayName,
            'language_preference' => 'fr',
            'status' => 'active',
        ]);

        $user = $this->userRepository->findById($userId);

        if ($user === null) {
            throw new RuntimeException('Unable to load the newly created user.');
        }

        return $this->toSafeUser($user);
    }

    public function login(string $identifier, string $password): array
    {
        $identifier = $this->normalizeIdentifier($identifier);
        $password = $this->requireLoginPassword($password);

        $user = $this->userRepository->findByEmail($identifier);

        if ($user === null) {
            $user = $this->userRepository->findByUsername($identifier);
        }

        if ($user === null || !password_verify($password, (string) $user['password_hash'])) {
            throw new RuntimeException('Invalid credentials.', 401);
        }

        return $this->toSafeUser($user);
    }

    private function normalizeEmail(array $payload): string
    {
        if (!array_key_exists('email', $payload)) {
            throw new InvalidArgumentException('The "email" field is required.');
        }

        $email = strtolower(trim((string) $payload['email']));

        if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new InvalidArgumentException('The "email" field must be a valid email address.');
        }

        return $email;
    }

    private function normalizeUsername(array $payload): string
    {
        if (!array_key_exists('username', $payload)) {
            throw new InvalidArgumentException('The "username" field is required.');
        }

        $username = strtolower(trim((string) $payload['username']));

        if ($username === '') {
            throw new InvalidArgumentException('The "username" field is required.');
        }

        return $username;
    }

    private function normalizeIdentifier(string $identifier): string
    {
        $identifier = strtolower(trim($identifier));

        if ($identifier === '') {
            throw new InvalidArgumentException('The "identifier" field is required.');
        }

        return $identifier;
    }

    private function requireDisplayName(array $payload): string
    {
        if (!array_key_exists('display_name', $payload)) {
            throw new InvalidArgumentException('The "display_name" field is required.');
        }

        $displayName = trim((string) $payload['display_name']);

        if ($displayName === '') {
            throw new InvalidArgumentException('The "display_name" field is required.');
        }

        return $displayName;
    }

    private function requirePassword(array $payload): string
    {
        if (!array_key_exists('password', $payload)) {
            throw new InvalidArgumentException('The "password" field is required.');
        }

        $password = (string) $payload['password'];

        if (trim($password) === '') {
            throw new InvalidArgumentException('The "password" field is required.');
        }

        if (strlen($password) < 8) {
            throw new InvalidArgumentException('The "password" field must be at least 8 characters long.');
        }

        return $password;
    }

    private function requireLoginPassword(string $password): string
    {
        if (trim($password) === '') {
            throw new InvalidArgumentException('The "password" field is required.');
        }

        return $password;
    }

    private function toSafeUser(array $user): array
    {
        return [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'language_preference' => $user['language_preference'],
            'status' => $user['status'],
            'role' => [
                'id' => (int) $user['role_id'],
                'code' => $user['role_code'],
                'name' => $user['role_name'],
            ],
            'created_at' => $user['created_at'],
            'updated_at' => $user['updated_at'],
        ];
    }
}
