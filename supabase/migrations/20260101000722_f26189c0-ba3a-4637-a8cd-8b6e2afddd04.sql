-- Create achievement_progress table to track current progress per achievement
CREATE TABLE public.achievement_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  target_value NUMERIC NOT NULL DEFAULT 0,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own achievement progress" 
ON public.achievement_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievement progress" 
ON public.achievement_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievement progress" 
ON public.achievement_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_achievement_progress_updated_at
BEFORE UPDATE ON public.achievement_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_achievement_progress_user_id ON public.achievement_progress(user_id);
CREATE INDEX idx_achievement_progress_achievement_id ON public.achievement_progress(achievement_id);