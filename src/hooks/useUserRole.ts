import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type UserRole = 'recruiter' | 'candidate' | null;

interface UseUserRoleReturn {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  error: string | null;
}

export const useUserRole = (): UseUserRoleReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      try {
        const { data, error: roleError } = await supabase
          .rpc('get_user_role', { _user_id: userId });
        
        if (roleError) {
          console.error('Error fetching role:', roleError);
          // If no role found, default to recruiter for existing users
          setRole('recruiter');
        } else {
          setRole(data as UserRole);
        }
      } catch (err) {
        console.error('Error in fetchRole:', err);
        setRole('recruiter');
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid deadlock
          setTimeout(() => {
            fetchRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, role, isLoading, error };
};
