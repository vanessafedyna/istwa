CREATE TABLE quiz_attempts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    quiz_key VARCHAR(100) NOT NULL DEFAULT 'main_quiz',
    score INT NOT NULL,
    total_questions INT NOT NULL,
    answers_json JSON NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    completed_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_attempts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
