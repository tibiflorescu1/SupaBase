import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, avatar_url, role, created_at, updated_at, is_active')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating one...');
          await createUserProfile(userId);
        } else {
          // For other errors, set a default profile
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user?.email) {
            setProfile({
              id: userId,
              email: userData.user.email,
              role: 'viewer',
              is_active: true
            });
          }
        }
      } else {
        console.log('User profile loaded:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Set a fallback profile to prevent app crash
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email) {
        setProfile({
          id: userId,
          email: userData.user.email,
          role: 'viewer',
          is_active: true
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: userData.user.email,
          role: 'viewer',
          is_active: true
        })
        .select('id, email, full_name, avatar_url, role, created_at, updated_at, is_active')
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        // Set fallback profile
        setProfile({
          id: userId,
          email: userData.user.email,
          role: 'viewer',
          is_active: true
        });
      } else {
        console.log('User profile created:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // Set fallback profile
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email) {
        setProfile({
          id: userId,
          email: userData.user.email,
          role: 'viewer',
          is_active: true
        });
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const hasPermission = (requiredRole: 'admin' | 'editor' | 'viewer'): boolean => {
    if (!profile) return false;
    
    const roleHierarchy = { viewer: 1, editor: 2, admin: 3 };
    const userLevel = roleHierarchy[profile.role] || 1;
    const requiredLevel = roleHierarchy[requiredRole] || 1;
    
    return userLevel >= requiredLevel;
  };

  const isAdmin = () => hasPermission('admin');
  const isEditor = () => hasPermission('editor');
  const canEdit = () => hasPermission('editor');
  const canDelete = () => hasPermission('admin');

  return {
    user,
    profile,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    hasPermission,
    isAdmin,
    isEditor,
    canEdit,
    canDelete
  };
}