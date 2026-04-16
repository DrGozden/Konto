-- Migration for shared budgets functionality

-- Create shared_budgets table
CREATE TABLE IF NOT EXISTS shared_budgets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    current_amount DECIMAL(15,2) DEFAULT 0 NOT NULL,
    status VARCHAR(15) DEFAULT 'ACTIVE' NOT NULL,
    creator_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create shared_budget_members table
CREATE TABLE IF NOT EXISTS shared_budget_members (
    id SERIAL PRIMARY KEY,
    shared_budget_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(10) NOT NULL,
    contributed_amount DECIMAL(15,2) DEFAULT 0 NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shared_budget_id) REFERENCES shared_budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(shared_budget_id, user_id)
);

-- Create shared_budget_invitations table
CREATE TABLE IF NOT EXISTS shared_budget_invitations (
    id SERIAL PRIMARY KEY,
    shared_budget_id INTEGER NOT NULL,
    inviter_id INTEGER NOT NULL,
    invitee_id INTEGER NOT NULL,
    status VARCHAR(10) DEFAULT 'PENDING' NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shared_budget_id) REFERENCES shared_budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(shared_budget_id, invitee_id)
);

-- Create shared_budget_transactions table
CREATE TABLE IF NOT EXISTS shared_budget_transactions (
    id SERIAL PRIMARY KEY,
    shared_budget_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shared_budget_id) REFERENCES shared_budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_shared_budgets_creator_id ON shared_budgets(creator_id);
CREATE INDEX idx_shared_budget_members_user_id ON shared_budget_members(user_id);
CREATE INDEX idx_shared_budget_members_shared_budget_id ON shared_budget_members(shared_budget_id);
CREATE INDEX idx_shared_budget_invitations_invitee_id ON shared_budget_invitations(invitee_id);
CREATE INDEX idx_shared_budget_invitations_shared_budget_id ON shared_budget_invitations(shared_budget_id);
CREATE INDEX idx_shared_budget_transactions_shared_budget_id ON shared_budget_transactions(shared_budget_id);
CREATE INDEX idx_shared_budget_transactions_user_id ON shared_budget_transactions(user_id);

-- Seed data for shared budgets
-- Insert shared budgets
INSERT INTO shared_budgets (name, description, current_amount, status, creator_id, created_at, updated_at) VALUES
    ('Porodični odmor', 'Budžet za letovanje u Grčkoj', 15000.00, 'ACTIVE', (SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
    ('Rođendanska proslava', 'Proslava za Milicu', 2500.00, 'ACTIVE', (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days'),
    ('Timski izlet', 'Izlet za kolege sa posla', 8000.00, 'ACTIVE', (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'),
    ('Kupovina automobila', 'Štednja za novi auto', 50000.00, 'ACTIVE', (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), NOW() - INTERVAL '60 days', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Insert shared budget members
INSERT INTO shared_budget_members (shared_budget_id, user_id, role, contributed_amount, joined_at, created_at, updated_at) VALUES
    -- Porodični odmor members
    ((SELECT id FROM shared_budgets WHERE name = 'Porodični odmor'), (SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 'OWNER', 5000.00, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Porodični odmor'), (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 'MEMBER', 3500.00, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days', NOW() - INTERVAL '5 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Porodični odmor'), (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 'MEMBER', 6500.00, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW() - INTERVAL '5 days'),
    
    -- Rođendanska proslava members
    ((SELECT id FROM shared_budgets WHERE name = 'Rođendanska proslava'), (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 'OWNER', 1000.00, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Rođendanska proslava'), (SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 'MEMBER', 800.00, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '2 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Rođendanska proslava'), (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 'MEMBER', 700.00, NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '2 days'),
    
    -- Timski izlet members
    ((SELECT id FROM shared_budgets WHERE name = 'Timski izlet'), (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), 'OWNER', 3000.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'),
    ((SELECT id FROM shared_budgets WHERE name = 'Timski izlet'), (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 'MEMBER', 2500.00, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '1 day'),
    ((SELECT id FROM shared_budgets WHERE name = 'Timski izlet'), (SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 'MEMBER', 2500.00, NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '1 day'),
    
    -- Kupovina automobila members
    ((SELECT id FROM shared_budgets WHERE name = 'Kupovina automobila'), (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 'OWNER', 20000.00, NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days', NOW() - INTERVAL '10 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Kupovina automobila'), (SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 'MEMBER', 30000.00, NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Insert shared budget invitations (some pending, some accepted)
INSERT INTO shared_budget_invitations (shared_budget_id, inviter_id, invitee_id, status, message, created_at, updated_at) VALUES
    -- Pending invitation for Porodični odmor
    ((SELECT id FROM shared_budgets WHERE name = 'Porodični odmor'), (SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), 'PENDING', 'Pozivamo te da se pridružiš našem porodičnom odmoru!', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    
    -- Accepted invitation for Rođendanska proslava (already a member, but for demo)
    ((SELECT id FROM shared_budgets WHERE name = 'Rođendanska proslava'), (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), (SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), 'ACCEPTED', 'Dođi na proslavu!', NOW() - INTERVAL '16 days', NOW() - INTERVAL '14 days'),
    
    -- Pending invitation for Timski izlet
    ((SELECT id FROM shared_budgets WHERE name = 'Timski izlet'), (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), (SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), 'PENDING', 'Pridruži se našem timskom izletu!', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    
    -- Declined invitation for Kupovina automobila
    ((SELECT id FROM shared_budgets WHERE name = 'Kupovina automobila'), (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), 'DECLINED', 'Želimo da štedimo zajedno za auto.', NOW() - INTERVAL '50 days', NOW() - INTERVAL '45 days')
ON CONFLICT DO NOTHING;

-- Insert shared budget transactions
INSERT INTO shared_budget_transactions (shared_budget_id, user_id, account_id, amount, description, created_at, updated_at) VALUES
    -- Porodični odmor transactions
    ((SELECT id FROM shared_budgets WHERE name = 'Porodični odmor'), (SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'marko.petrovic@email.com') AND type = 'DEBIT'), 2000.00, 'Uplata za avionske karte', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Porodični odmor'), (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com') AND type = 'CASH'), 1500.00, 'Dopuna za smeštaj', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Porodični odmor'), (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com') AND type = 'DEBIT'), 3000.00, 'Uplata za hotel', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
    
    -- Rođendanska proslava transactions
    ((SELECT id FROM shared_budgets WHERE name = 'Rođendanska proslava'), (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'ana.jovanovic@email.com') AND type = 'DEBIT'), 500.00, 'Poklon za Milicu', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Rođendanska proslava'), (SELECT id FROM users WHERE email = 'marko.petrovic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'marko.petrovic@email.com') AND type = 'CASH'), 400.00, 'Torta i dekoracije', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
    
    -- Timski izlet transactions
    ((SELECT id FROM shared_budgets WHERE name = 'Timski izlet'), (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'stefan.nikolic@email.com') AND type = 'DEBIT'), 1500.00, 'Rezervacija autobusa', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Timski izlet'), (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com') AND type = 'DEBIT'), 1200.00, 'Hrana za izlet', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
    
    -- Kupovina automobila transactions
    ((SELECT id FROM shared_budgets WHERE name = 'Kupovina automobila'), (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com') AND type = 'DEBIT'), 10000.00, 'Prva uplata za auto', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Kupovina automobila'), (SELECT id FROM users WHERE email = 'nemanja.radic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'nemanja.radic@email.com') AND type = 'DEBIT'), 15000.00, 'Druga uplata', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
    ((SELECT id FROM shared_budgets WHERE name = 'Kupovina automobila'), (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com'), (SELECT id FROM accounts WHERE user_id = (SELECT id FROM users WHERE email = 'milica.stojanovic@email.com') AND type = 'CASH'), 5000.00, 'Dodatna uplata', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days')
ON CONFLICT DO NOTHING;