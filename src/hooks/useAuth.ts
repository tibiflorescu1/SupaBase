import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  });

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, role: UserRole = 'viewer') => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            role
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      setAuthState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  };

  // Check permissions
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!authState.profile) return false;
    
    const userRole = authState.profile.role;
    
    switch (requiredRole) {
      case 'viewer':
        return ['admin', 'editor', 'viewer'].includes(userRole);
      case 'editor':
        return ['admin', 'editor'].includes(userRole);
      case 'admin':
        return userRole === 'admin';
      default:
        return false;
    }
  };

  // Get all user profiles (admin only)
  const getUserProfiles = async () => {
    if (!hasPermission('admin')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as UserProfile[] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: errorMessage };
    }
  };

  // Update user role (admin only)
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!hasPermission('admin')) {
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      return { success: false, error: errorMessage };
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null
          });
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          error: 'Eroare la inițializarea autentificării'
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        try {
          if (session?.user) {
            const profile = await loadUserProfile(session.user.id);
            setAuthState({
              user: session.user,
              profile,
              session,
              loading: false,
              error: null
            });
          } else {
            setAuthState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: 'Eroare la autentificare'
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Add timeout for loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authState.session?.user) {
        console.warn('Auth loading timeout - forcing to login screen');
        setAuthState(prev => ({ 
          ...prev, 
          loading: false,
          error: 'Timeout la conectarea cu baza de date'
        }));
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [authState.loading]);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    hasPermission,
    getUserProfiles,
    updateUserRole
  };
}