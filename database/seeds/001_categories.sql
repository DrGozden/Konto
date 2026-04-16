-- Categories seed data
-- Insert default categories for personal finance tracking

INSERT INTO categories (name, created_at, updated_at) VALUES
    ('Food & Dining', NOW(), NOW()),
    ('Transportation', NOW(), NOW()),
    ('Shopping', NOW(), NOW()),
    ('Entertainment', NOW(), NOW()),
    ('Bills & Utilities', NOW(), NOW()),
    ('Healthcare', NOW(), NOW()),
    ('Education', NOW(), NOW()),
    ('Travel', NOW(), NOW()),
    ('Income', NOW(), NOW()),
    ('Other', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE categories IS 'Personal finance expense and income categories';
COMMENT ON COLUMN categories.name IS 'Unique category name for transactions';