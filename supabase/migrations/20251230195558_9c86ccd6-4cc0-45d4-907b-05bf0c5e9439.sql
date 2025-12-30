-- Add sales breakdown columns to tip_entries table
-- These categories make up the total sales: food, liquor, beer, wine, cocktails

ALTER TABLE public.tip_entries 
ADD COLUMN IF NOT EXISTS food_sales numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS liquor_sales numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS beer_sales numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS wine_sales numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cocktail_sales numeric DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN public.tip_entries.food_sales IS 'Food sales portion of total sales';
COMMENT ON COLUMN public.tip_entries.liquor_sales IS 'Liquor sales (part of alcohol)';
COMMENT ON COLUMN public.tip_entries.beer_sales IS 'Beer sales (part of alcohol)';
COMMENT ON COLUMN public.tip_entries.wine_sales IS 'Wine sales (part of alcohol)';
COMMENT ON COLUMN public.tip_entries.cocktail_sales IS 'Cocktail sales (part of alcohol)';