-- Add yearly_goal column to goals table
ALTER TABLE public.goals 
ADD COLUMN yearly_goal numeric NOT NULL DEFAULT 0;