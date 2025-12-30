-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('recruiter', 'candidate');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create candidate_profiles table for candidate-specific data
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  bio TEXT,
  skills TEXT[],
  experience_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on candidate_profiles
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own profile
CREATE POLICY "Candidates can view their own profile"
ON public.candidate_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Candidates can update their own profile
CREATE POLICY "Candidates can update their own profile"
ON public.candidate_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Candidates can insert their own profile
CREATE POLICY "Candidates can insert their own profile"
ON public.candidate_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Recruiters can view candidate profiles for their interviews
CREATE POLICY "Recruiters can view candidate profiles for their interviews"
ON public.candidate_profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'recruiter') AND
  EXISTS (
    SELECT 1 FROM public.interviews i
    WHERE i.recruiter_id = auth.uid()
    AND i.candidate_email = candidate_profiles.email
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_candidate_profiles_updated_at
BEFORE UPDATE ON public.candidate_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add candidate_user_id to interviews table to link authenticated candidates
ALTER TABLE public.interviews ADD COLUMN candidate_user_id UUID REFERENCES auth.users(id);

-- Allow candidates to view their own interviews (by email or user_id)
CREATE POLICY "Candidates can view their own interviews"
ON public.interviews
FOR SELECT
USING (
  public.has_role(auth.uid(), 'candidate') AND (
    candidate_user_id = auth.uid() OR
    candidate_email = (SELECT email FROM public.candidate_profiles WHERE user_id = auth.uid())
  )
);

-- Function to assign role on signup (called by trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Check if role was passed in metadata, default to 'recruiter' for backwards compatibility
  v_role := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::user_role,
    'recruiter'::user_role
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role);
  
  -- If candidate, create candidate profile
  IF v_role = 'candidate' THEN
    INSERT INTO public.candidate_profiles (user_id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user role assignment
CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();