-- Goals seed data
-- Financial goals for users with varying progress levels

INSERT INTO goals (user_id, name, target_amount, current_amount, is_completed, created_at, updated_at) VALUES
    -- Marko Petrović goals
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 'Emergency Fund', 50000.00, 12500.00, false, NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 'New Laptop', 120000.00, 85000.00, false, NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days'),
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 'Vacation to Greece', 80000.00, 80000.00, true, NOW() - INTERVAL '90 days', NOW() - INTERVAL '15 days'),

    -- Ana Jovanović goals
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 'Car Downpayment', 200000.00, 45000.00, false, NOW() - INTERVAL '60 days', NOW() - INTERVAL '3 days'),
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 'Photography Equipment', 75000.00, 35000.00, false, NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 days'),

    -- Stefan Nikolić goals
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 'Apartment Downpayment', 500000.00, 180000.00, false, NOW() - INTERVAL '120 days', NOW() - INTERVAL '1 day'),
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 'Wedding Fund', 300000.00, 150000.00, false, NOW() - INTERVAL '180 days', NOW() - INTERVAL '7 days'),
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 'New Gaming PC', 150000.00, 150000.00, true, NOW() - INTERVAL '40 days', NOW() - INTERVAL '20 days'),

    -- Milica Stojanović goals
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 'Master Degree Fund', 100000.00, 25000.00, false, NOW() - INTERVAL '200 days', NOW() - INTERVAL '12 days'),
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 'Summer Internship in Berlin', 60000.00, 15000.00, false, NOW() - INTERVAL '50 days', NOW() - INTERVAL '6 days'),

    -- Nemanja Radić goals
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 'Investment Portfolio', 250000.00, 95000.00, false, NOW() - INTERVAL '80 days', NOW() - INTERVAL '4 days'),
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 'Mountain Bike', 45000.00, 45000.00, true, NOW() - INTERVAL '35 days', NOW() - INTERVAL '18 days'),
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 'Home Office Setup', 80000.00, 32000.00, false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day');