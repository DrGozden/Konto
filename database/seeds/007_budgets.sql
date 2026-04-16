-- Budgets seed data
-- Monthly and weekly budgets for different categories and users

INSERT INTO budgets (user_id, category_id, limit_amount, period, current_spent, created_at, updated_at) VALUES
    -- Marko Petrović budgets
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 1, 15000.00, 'MONTHLY', 8200.50, NOW() - INTERVAL '28 days', NOW() - INTERVAL '2 days'),  -- Food & Dining
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 2, 5000.00, 'MONTHLY', 3200.00, NOW() - INTERVAL '28 days', NOW() - INTERVAL '3 days'),   -- Transportation
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 4, 3000.00, 'MONTHLY', 1850.00, NOW() - INTERVAL '28 days', NOW() - INTERVAL '1 day'),    -- Entertainment
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 5, 8000.00, 'MONTHLY', 6500.00, NOW() - INTERVAL '28 days', NOW() - INTERVAL '3 days'),   -- Bills & Utilities

    -- Ana Jovanović budgets
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 1, 12000.00, 'MONTHLY', 6800.25, NOW() - INTERVAL '25 days', NOW() - INTERVAL '4 days'),  -- Food & Dining
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 3, 8000.00, 'MONTHLY', 5200.00, NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 day'),    -- Shopping
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 6, 4000.00, 'MONTHLY', 3200.00, NOW() - INTERVAL '25 days', NOW() - INTERVAL '4 days'),   -- Healthcare
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 4, 2500.00, 'MONTHLY', 1500.00, NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 days'),   -- Entertainment

    -- Stefan Nikolić budgets
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 1, 20000.00, 'MONTHLY', 12500.00, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),  -- Food & Dining
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 2, 10000.00, 'MONTHLY', 7200.00, NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days'),  -- Transportation
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 7, 25000.00, 'MONTHLY', 15000.00, NOW() - INTERVAL '30 days', NOW() - INTERVAL '3 days'), -- Education
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 4, 5000.00, 'MONTHLY', 2800.00, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),    -- Entertainment
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 1, 500.00, 'WEEKLY', 280.00, NOW() - INTERVAL '6 days', NOW()),                           -- Food & Dining weekly

    -- Milica Stojanović budgets  
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 1, 8000.00, 'MONTHLY', 4500.50, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'),    -- Food & Dining
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 2, 3000.00, 'MONTHLY', 1800.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days'),   -- Transportation
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 7, 15000.00, 'MONTHLY', 8500.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),  -- Education
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 3, 4000.00, 'MONTHLY', 2400.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'),    -- Shopping

    -- Nemanja Radić budgets
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 1, 18000.00, 'MONTHLY', 11200.75, NOW() - INTERVAL '35 days', NOW() - INTERVAL '2 days'), -- Food & Dining
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 8, 15000.00, 'MONTHLY', 8500.00, NOW() - INTERVAL '35 days', NOW() - INTERVAL '12 days'), -- Travel
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 4, 6000.00, 'MONTHLY', 3800.00, NOW() - INTERVAL '35 days', NOW() - INTERVAL '1 day'),    -- Entertainment
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 5, 6000.00, 'MONTHLY', 4200.00, NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days'),   -- Bills & Utilities
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 2, 400.00, 'WEEKLY', 150.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day');        -- Transportation weekly