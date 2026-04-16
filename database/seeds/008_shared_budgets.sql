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