-- Create tip_entries table
CREATE TABLE public.tip_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  tips DECIMAL(10,2) NOT NULL DEFAULT 0,
  section INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_goal DECIMAL(10,2) NOT NULL DEFAULT 0,
  weekly_goal DECIMAL(10,2) NOT NULL DEFAULT 0,
  monthly_goal DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tip_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create policies for tip_entries
CREATE POLICY "Users can view their own tip entries" 
ON public.tip_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tip entries" 
ON public.tip_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tip entries" 
ON public.tip_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tip entries" 
ON public.tip_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for goals
CREATE POLICY "Users can view their own goals" 
ON public.goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tip_entries_updated_at
  BEFORE UPDATE ON public.tip_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();