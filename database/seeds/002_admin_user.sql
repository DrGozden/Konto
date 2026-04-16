-- Default admin user for development
-- Password: password (hashed with bcrypt)

INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
    ('Admin User', 'admin@konto.app', '$2a$10$zqzYGLblKN3.BH5s6izMFuAmC0QSGnq5WNP3J8q32DOOBdvY/Qfxq', 'ADMIN', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Note: The password hash above corresponds to "password"
-- In production, this should be changed immediately