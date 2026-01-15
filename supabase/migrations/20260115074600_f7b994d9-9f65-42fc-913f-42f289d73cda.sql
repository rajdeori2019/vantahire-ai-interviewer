-- Remove the policy that allows anonymous users to read the signup code
-- This policy was a security risk as it exposed the secret signup code to unauthenticated users
DROP POLICY IF EXISTS "Allow anonymous read for signup validation" ON public.admin_settings;