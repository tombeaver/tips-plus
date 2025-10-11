-- Remove the old constraint that doesn't allow 'Double'
ALTER TABLE tip_entries DROP CONSTRAINT IF EXISTS check_shift_values;

-- The check_valid_shift constraint already includes 'Double', so we're good