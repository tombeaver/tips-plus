-- Phase 1: Fix Critical Database Schema Issue
-- Make user_id columns NOT NULL to prevent orphaned data

-- First, ensure all existing records have a user_id (if any don't, this will need manual cleanup)
-- Update goals table to make user_id NOT NULL
ALTER TABLE public.goals 
ALTER COLUMN user_id SET NOT NULL;

-- Update tip_entries table to make user_id NOT NULL  
ALTER TABLE public.tip_entries
ALTER COLUMN user_id SET NOT NULL;

-- Phase 3: Database Security Hardening
-- Add check constraints to ensure data integrity

-- Ensure goals are positive values
ALTER TABLE public.goals 
ADD CONSTRAINT check_positive_goals 
CHECK (daily_goal >= 0 AND weekly_goal >= 0 AND monthly_goal >= 0 AND yearly_goal >= 0);

-- Ensure tip entries have valid data
ALTER TABLE public.tip_entries
ADD CONSTRAINT check_positive_tips 
CHECK (cash_tips >= 0 AND tips >= 0 AND sales >= 0);

ALTER TABLE public.tip_entries
ADD CONSTRAINT check_valid_guest_count 
CHECK (guest_count >= 0);

ALTER TABLE public.tip_entries
ADD CONSTRAINT check_valid_hours_worked 
CHECK (hours_worked > 0 AND hours_worked <= 24);

ALTER TABLE public.tip_entries
ADD CONSTRAINT check_valid_hourly_rate 
CHECK (hourly_rate >= 0);

ALTER TABLE public.tip_entries
ADD CONSTRAINT check_valid_mood_rating 
CHECK (mood_rating IS NULL OR (mood_rating >= 1 AND mood_rating <= 5));

ALTER TABLE public.tip_entries
ADD CONSTRAINT check_valid_shift 
CHECK (shift IN ('AM', 'PM', 'Double'));

-- Phase 2: Harden the update function security
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;