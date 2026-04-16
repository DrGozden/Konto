-- Accounts seed data
-- Each user gets exactly 2 accounts: DEBIT and CASH
-- Account balances for regular users

INSERT INTO accounts (user_id, type, balance, created_at, updated_at) VALUES
    -- Marko Petrović accounts
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 'DEBIT', 25000.00, NOW(), NOW()),
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 'CASH', 1200.00, NOW(), NOW()),
    
    -- Ana Jovanović accounts  
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 'DEBIT', 18500.50, NOW(), NOW()),
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 'CASH', 850.50, NOW(), NOW()),
    
    -- Stefan Nikolić accounts
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 'DEBIT', 42300.75, NOW(), NOW()),
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 'CASH', 2100.25, NOW(), NOW()),
    
    -- Milica Stojanović accounts
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 'DEBIT', 15750.25, NOW(), NOW()),
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 'CASH', 500.75, NOW(), NOW()),
    
    -- Nemanja Radić accounts
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 'DEBIT', 38200.00, NOW(), NOW()),
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 'CASH', 1750.00, NOW(), NOW())
ON CONFLICT DO NOTHING;