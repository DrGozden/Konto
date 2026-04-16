-- Users seed data
-- All passwords are 'password' hashed with bcrypt for development

INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
    -- Regular users (password: password)
    ('Marko Petrović', 'marko.petrovic@email.com', '$2a$10$zqzYGLblKN3.BH5s6izMFuAmC0QSGnq5WNP3J8q32DOOBdvY/Qfxq', 'USER', NOW(), NOW()),
    ('Ana Jovanović', 'ana.jovanovic@email.com', '$2a$10$zqzYGLblKN3.BH5s6izMFuAmC0QSGnq5WNP3J8q32DOOBdvY/Qfxq', 'USER', NOW(), NOW()),
    ('Stefan Nikolić', 'stefan.nikolic@email.com', '$2a$10$zqzYGLblKN3.BH5s6izMFuAmC0QSGnq5WNP3J8q32DOOBdvY/Qfxq', 'USER', NOW(), NOW()),
    ('Milica Stojanović', 'milica.stojanovic@email.com', '$2a$10$zqzYGLblKN3.BH5s6izMFuAmC0QSGnq5WNP3J8q32DOOBdvY/Qfxq', 'USER', NOW(), NOW()),
    ('Nemanja Radić', 'nemanja.radic@email.com', '$2a$10$zqzYGLblKN3.BH5s6izMFuAmC0QSGnq5WNP3J8q32DOOBdvY/Qfxq', 'USER', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;