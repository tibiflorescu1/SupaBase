import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  last_password_change?: string;
}

export interface Permission {
  permission: string;
  enabled: boolean;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  permissions: Permission[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isUser: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if we're in production mode (no login required)
  const isProduction = import.meta.env.PROD;
  const autoLoginEmail = import.meta.env.VITE_AUTO_LOGIN_EMAIL || 'admin@vehiclegraphics.com';

  useEffect(() => {
    // Get initial session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      } else if (isProduction) {
        // In production, auto-login with default admin
        autoLogin();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
          
          // Update last login
          if (event === 'SIGNED_IN') {
            await updateLastLogin(session.user.id);
          }
        } else {
          setUser(null);
          setProfile(null);
          setPermissions([]);
          if (isProduction) {
            // In production, try auto-login again
            autoLogin();
          } else {
            setLoading(false);
          }
        }
      }
    ) || { unsubscribe: () => {} };

    return () => subscription.unsubscribe();
  }, []);

  const autoLogin = async () => {
    try {
      // Try to sign in with default admin credentials
      const { data, error } = await supabase!.auth.signInWithPassword({
        email: autoLoginEmail,
        password: 'admin123' // Default password for production
      });

      if (error) {
        console.warn('Auto-login failed, creating default admin user');
        // If login fails, try to create the default admin user
        await createDefaultAdmin();
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      setLoading(false);
    }
  };

  const createDefaultAdmin = async () => {
    try {
      // Create default admin user
      const { data, error } = await supabase!.auth.signUp({
        email: autoLoginEmail,
        password: 'admin123'
      });

      if (error) {
        console.error('Failed to create default admin:', error);
        setLoading(false);
        return;
      }

      // Update the user profile to admin role
      if (data.user) {
        await supabase!
          .from('user_profiles')
          .update({ role: 'admin' })
          .eq('id', data.user.id);
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase!
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Load permissions for user's role
      const { data: permissionsData, error: permissionsError } = await supabase!
        .from('role_permissions')
        .select('permission, enabled')
        .eq('role', profileData.role);

      if (permissionsError) {
        console.error('Error loading permissions:', permissionsError);
      } else {
        setPermissions(permissionsData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setLoading(false);
    }
  };

  const updateLastLogin = async (userId: string) => {
    try {
      await supabase!
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase!.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase!.auth.signOut();
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    if (profile.status !== 'active') return false;
    
    const perm = permissions.find(p => p.permission === permission);
    return perm?.enabled || false;
  };

  const isAdmin = (): boolean => {
    return profile?.role === 'admin' && profile?.status === 'active';
  };

  const isEditor = (): boolean => {
    return profile?.role === 'editor' && profile?.status === 'active';
  };

  const isUser = (): boolean => {
    return profile?.role === 'user' && profile?.status === 'active';
  };

  return {
    user,
    profile,
    permissions,
    loading,
    signIn,
    signOut,
    hasPermission,
    isAdmin,
    isEditor,
    isUser
  };
}