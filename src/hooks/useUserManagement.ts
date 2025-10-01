import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile, Permission } from './useAuth';

export interface UserWithPermissions extends UserProfile {
  permissions?: Permission[];
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all users
  const loadUsers = async () => {
    try {
      if (!supabase) {
        setError('Supabase not configured');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Load role permissions
  const loadRolePermissions = async () => {
    try {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;

      // Transform to nested object structure
      const permissions: Record<string, Record<string, boolean>> = {};
      data?.forEach(perm => {
        if (!permissions[perm.role]) {
          permissions[perm.role] = {};
        }
        permissions[perm.role][perm.permission] = perm.enabled;
      });

      setRolePermissions(permissions);
    } catch (err) {
      console.error('Error loading role permissions:', err);
    }
  };

  // Create new user
  const createUser = async (email: string, password: string, role: string) => {
    try {
      if (!supabase) {
        return { error: 'Supabase not configured' };
      }
      
      // Create auth user using signUp
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role
          }
        }
      });

      if (error) throw error;

      // The user profile will be created automatically by the trigger
      // But we need to update the role since triggers run before we can set custom data
      if (data.user) {
        // Wait a bit for the trigger to create the profile
        setTimeout(async () => {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({ role, status: 'active' })
            .eq('id', data.user.id);

          if (profileError) {
            console.error('Error updating user role:', profileError);
          }
        }, 1000);
      }

      await loadUsers();
      return { success: true };
    } catch (err) {
      console.error('Error creating user:', err);
      return { error: err instanceof Error ? err.message : 'Failed to create user' };
    }
  };

  // Update user
  const updateUser = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      if (!supabase) {
        return { error: 'Supabase not configured' };
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
      return { success: true };
    } catch (err) {
      console.error('Error updating user:', err);
      return { error: err instanceof Error ? err.message : 'Failed to update user' };
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    try {
      if (!supabase) {
        return { error: 'Supabase not configured' };
      }
      
      // We can't delete auth users from client-side
      // Instead, we'll just deactivate the user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
      return { success: true };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { error: err instanceof Error ? err.message : 'Failed to delete user' };
    }
  };

  // Change user password
  const changeUserPassword = async (userId: string, newPassword: string) => {
    try {
      if (!supabase) {
        return { error: 'Supabase not configured' };
      }
      
      // We can't change passwords from client-side for security reasons
      // Instead, we'll send a password reset email
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      
      // Update last password change attempt
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ last_password_change: new Date().toISOString() })
        .eq('id', userId);
        
      if (updateError) throw updateError;

      await loadUsers();
      return { success: true, message: 'Email de resetare parolă trimis!' };
    } catch (err) {
      console.error('Error changing password:', err);
      return { error: err instanceof Error ? err.message : 'Failed to send password reset' };
    }
  };

  // Update role permissions
  const updateRolePermissions = async (role: string, permissions: Record<string, boolean>) => {
    try {
      if (!supabase) {
        return { error: 'Supabase not configured' };
      }
      
      // Delete existing permissions for role
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role);

      // Insert new permissions
      const permissionsArray = Object.entries(permissions).map(([permission, enabled]) => ({
        role,
        permission,
        enabled
      }));

      const { error } = await supabase
        .from('role_permissions')
        .insert(permissionsArray);

      if (error) throw error;

      await loadRolePermissions();
      return { success: true };
    } catch (err) {
      console.error('Error updating role permissions:', err);
      return { error: err instanceof Error ? err.message : 'Failed to update permissions' };
    }
  };

  useEffect(() => {
    if (supabase) {
      loadUsers();
      loadRolePermissions();
    }
  }, []);

  return {
    users,
    rolePermissions,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    updateRolePermissions,
    refetch: () => {
      loadUsers();
      loadRolePermissions();
    }
  };
}