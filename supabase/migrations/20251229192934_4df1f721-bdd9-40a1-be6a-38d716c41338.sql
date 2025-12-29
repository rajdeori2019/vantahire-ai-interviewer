-- Create jobs table for job postings
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  salary_range TEXT,
  location TEXT,
  job_type TEXT DEFAULT 'full-time',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for jobs
CREATE POLICY "Recruiters can view their own jobs"
ON public.jobs FOR SELECT
USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can create jobs"
ON public.jobs FOR INSERT
WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update their own jobs"
ON public.jobs FOR UPDATE
USING (auth.uid() = recruiter_id)
WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete their own jobs"
ON public.jobs FOR DELETE
USING (auth.uid() = recruiter_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on jobs
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add job_id column to interviews table (nullable for existing interviews)
ALTER TABLE public.interviews 
ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL;