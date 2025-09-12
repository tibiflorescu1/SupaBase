// Simplified auth hook without Supabase authentication
import { useState, useEffect } from 'react';

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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set a default admin user for testing
    const defaultUser = {
      id: 'test-admin-id',
      email: 'tibiflorescu@yahoo.com'
    };
    
    const defaultProfile: UserProfile = {
      id: 'test-admin-id',
      email: 'tibiflorescu@yahoo.com',
      full_name: 'Test Admin',
      role: 'admin',
      is_active: true
    };

    setUser(defaultUser);
    setProfile(defaultProfile);
    setSession({ user: defaultUser });
    setLoading(false);
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    // Mock sign in - always succeeds
    const mockUser = {
      id: 'test-user-id',
      email: email
    };
    
    const mockProfile: UserProfile = {
      id: 'test-user-id',
      email: email,
      full_name: 'Test User',
      role: 'admin',
      is_active: true
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setSession({ user: mockUser });
  };

  const signUpWithEmail = async (email: string, password: string) => {
    // Mock sign up - always succeeds
    await signInWithEmail(email, password);
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
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