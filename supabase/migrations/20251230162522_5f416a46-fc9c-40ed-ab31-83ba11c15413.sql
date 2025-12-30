-- Add alcohol_sales column to tip_entries table
ALTER TABLE public.tip_entries 
ADD COLUMN alcohol_sales numeric NOT NULL DEFAULT 0;