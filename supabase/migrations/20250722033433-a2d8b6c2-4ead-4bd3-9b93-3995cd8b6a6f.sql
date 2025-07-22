-- Add mood rating column to tip_entries table
ALTER TABLE public.tip_entries 
ADD COLUMN mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5);