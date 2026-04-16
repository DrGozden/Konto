-- Master seed file for Konto Personal Finance Application
-- This file creates schema and executes all seed files in the correct order
-- Run with: psql -d konto -f database/seeds/seed.sql

\echo 'Starting database setup...'

-- 0. Create schema (tables, indexes, triggers)
\echo 'Creating database schema...'
\i database/seeds/000_schema.sql

-- 1. Categories (must be first as other tables reference them)
\echo 'Seeding categories...'
\i database/seeds/001_categories.sql

-- 2. Admin user (can be run before or after other users)
\echo 'Seeding admin user...'
\i database/seeds/002_admin_user.sql

-- 3. Regular users
\echo 'Seeding users...'
\i database/seeds/003_users.sql

-- 4. Accounts (depends on users)
\echo 'Seeding accounts...'
\i database/seeds/004_accounts.sql

-- 5. Transactions (depends on users, accounts, categories)
\echo 'Seeding transactions...'
\i database/seeds/005_transactions.sql

-- 6. Goals (depends on users)
\echo 'Seeding goals...'
\i database/seeds/006_goals.sql

-- 7. Budgets (depends on users, categories)
\echo 'Seeding budgets...'
\i database/seeds/007_budgets.sql

-- 8. Shared budgets (depends on users, accounts)
\echo 'Creating shared budgets schema...'
\i database/seeds/008_shared_budgets.sql

\echo 'Database setup completed successfully!'
\echo ''
\echo 'Default login credentials:'
\echo 'Admin: admin@konto.app / password'
\echo 'Users: [any_user_email] / password'
\echo ''