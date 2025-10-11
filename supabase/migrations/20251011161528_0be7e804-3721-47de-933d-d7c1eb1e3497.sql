-- Add financial tracking fields to goals table
ALTER TABLE goals ADD COLUMN IF NOT EXISTS monthly_expenses numeric DEFAULT 0 NOT NULL;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS monthly_savings_goal numeric DEFAULT 0 NOT NULL;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS monthly_spending_limit numeric DEFAULT 0 NOT NULL;

COMMENT ON COLUMN goals.monthly_expenses IS 'Total monthly expenses (rent, utilities, etc.)';
COMMENT ON COLUMN goals.monthly_savings_goal IS 'Target amount to save each month';
COMMENT ON COLUMN goals.monthly_spending_limit IS 'Maximum leisure/discretionary spending per month';