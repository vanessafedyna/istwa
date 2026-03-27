ALTER TABLE users
    ADD COLUMN organisme_id INT UNSIGNED NULL AFTER role_id,
    ADD COLUMN join_code_used VARCHAR(20) NULL AFTER organisme_id,
    ADD CONSTRAINT fk_users_organisme
        FOREIGN KEY (organisme_id) REFERENCES organismes(id)
        ON DELETE SET NULL,
    ADD INDEX idx_users_organisme (organisme_id);
