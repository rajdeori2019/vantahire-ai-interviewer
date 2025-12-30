-- Create email_messages table to track email delivery status
CREATE TABLE public.email_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  message_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

-- Recruiters can view email messages for their interviews
CREATE POLICY "Recruiters can view their email messages"
  ON public.email_messages
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.interviews i
    WHERE i.id = email_messages.interview_id
    AND i.recruiter_id = auth.uid()
  ));

-- Admins can view all email messages
CREATE POLICY "Admins can view all email messages"
  ON public.email_messages
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for updated_at
CREATE TRIGGER update_email_messages_updated_at
  BEFORE UPDATE ON public.email_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for email status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_messages;