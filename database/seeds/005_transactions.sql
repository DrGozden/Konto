-- Transactions seed data
-- Realistic transaction history for all users

INSERT INTO transactions (user_id, account_id, category_id, amount, type, description, created_at, updated_at) VALUES
    -- Marko Petrović DEBIT account transactions
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'marko.petrovic@email.com') AND type = 'DEBIT'),
     1, 1200.00, 'EXPENSE', 'Groceries at Maxi', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
     
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'marko.petrovic@email.com') AND type = 'DEBIT'),
     2, 800.50, 'EXPENSE', 'Bus card refill', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
     
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'marko.petrovic@email.com') AND type = 'CASH'),
     9, 45000.00, 'INCOME', 'Monthly salary', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
     
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'marko.petrovic@email.com') AND type = 'DEBIT'),
     5, 6500.00, 'EXPENSE', 'Electricity bill', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
     
    ((SELECT id FROM users WHERE email = 'marko.petrovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'marko.petrovic@email.com') AND type = 'CASH'),
     1, 650.25, 'EXPENSE', 'Lunch at restaurant', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

    -- Ana Jovanović transactions
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com') AND type = 'DEBIT'),
     9, 38000.00, 'INCOME', 'Freelance project payment', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
     
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com') AND type = 'DEBIT'),
     3, 2800.00, 'EXPENSE', 'New clothes shopping', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
     
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com') AND type = 'CASH'),
     1, 450.75, 'EXPENSE', 'Coffee and breakfast', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
     
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com') AND type = 'DEBIT'),
     6, 3200.00, 'EXPENSE', 'Doctor visit', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
     
    ((SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com') AND type = 'CASH'),
     4, 1500.00, 'EXPENSE', 'Movie tickets', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

    -- Stefan Nikolić transactions
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com') AND type = 'DEBIT'),
     9, 65000.00, 'INCOME', 'Software developer salary', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
     
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com') AND type = 'DEBIT'),
     2, 3500.00, 'EXPENSE', 'Car fuel and maintenance', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
     
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com') AND type = 'CASH'),
     1, 2200.00, 'EXPENSE', 'Family dinner', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
     
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com') AND type = 'DEBIT'),
     7, 15000.00, 'EXPENSE', 'Online course subscription', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
     
    ((SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com') AND type = 'CASH'),
     4, 800.00, 'EXPENSE', 'Gaming subscription', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

    -- Milica Stojanović transactions
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com') AND type = 'DEBIT'),
     9, 28000.00, 'INCOME', 'Part-time job salary', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
     
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com') AND type = 'CASH'),
     1, 980.50, 'EXPENSE', 'Groceries', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
     
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com') AND type = 'DEBIT'),
     7, 5500.00, 'EXPENSE', 'University books', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
     
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com') AND type = 'CASH'),
     2, 420.00, 'EXPENSE', 'Public transport', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
     
    ((SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com') AND type = 'DEBIT'),
     3, 1200.00, 'EXPENSE', 'New shoes', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

    -- Nemanja Radić transactions
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'nemanja.radic@email.com') AND type = 'DEBIT'),
     9, 52000.00, 'INCOME', 'Marketing manager salary', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),
     
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'nemanja.radic@email.com') AND type = 'DEBIT'),
     8, 8500.00, 'EXPENSE', 'Weekend trip to Zlatibor', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
     
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'nemanja.radic@email.com') AND type = 'CASH'),
     1, 1850.25, 'EXPENSE', 'Dinner with colleagues', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
     
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'nemanja.radic@email.com') AND type = 'DEBIT'),
     5, 4200.00, 'EXPENSE', 'Internet and phone bills', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
     
    ((SELECT id FROM users WHERE email = 'nemanja.radic@email.com'),
     (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'nemanja.radic@email.com') AND type = 'CASH'),
     4, 1200.00, 'EXPENSE', 'Concert tickets', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');