-- Create table to track onboarding reminder history
CREATE TABLE public.onboarding_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL, -- 'first_reminder', 'second_reminder', etc.
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tasks_pending TEXT[] NOT NULL, -- Array of incomplete task names
  UNIQUE(user_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.onboarding_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view their own reminders
CREATE POLICY "Users can view their own reminders"
ON public.onboarding_reminders
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_onboarding_reminders_user_id ON public.onboarding_reminders(user_id);
CREATE INDEX idx_onboarding_reminders_sent_at ON public.onboarding_reminders(sent_at);