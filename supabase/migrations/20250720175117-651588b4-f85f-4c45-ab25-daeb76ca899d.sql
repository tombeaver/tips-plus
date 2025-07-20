-- Add missing columns to tip_entries table
ALTER TABLE public.tip_entries 
ADD COLUMN cash_tips numeric NOT NULL DEFAULT 0,
ADD COLUMN guest_count integer NOT NULL DEFAULT 0,
ADD COLUMN shift text NOT NULL DEFAULT 'PM',
ADD COLUMN hours_worked numeric NOT NULL DEFAULT 8,
ADD COLUMN hourly_rate numeric NOT NULL DEFAULT 15;

-- Add check constraint for shift values
ALTER TABLE public.tip_entries 
ADD CONSTRAINT check_shift_values CHECK (shift IN ('AM', 'PM'));