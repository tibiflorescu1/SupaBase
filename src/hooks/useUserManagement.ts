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
      setLoading(true);
      const { data, error } = await supabase!
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
      const { data, error } = await supabase!
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
      // Create auth user
      const { data, error } = await supabase!.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (error) throw error;

      // Update profile with role
      if (data.user) {
        const { error: profileError } = await supabase!
          .from('user_profiles')
          .update({ role, status: 'active' })
          .eq('id', data.user.id);

        if (profileError) throw profileError;
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
      const { error } = await supabase!
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
      // Delete from auth (will cascade to user_profiles)
      const { error } = await supabase!.auth.admin.deleteUser(userId);

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
      const { error } = await supabase!.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) throw error;

      // Update last password change
      await supabase!
        .from('user_profiles')
        .update({ last_password_change: new Date().toISOString() })
        .eq('id', userId);

      await loadUsers();
      return { success: true };
    } catch (err) {
      console.error('Error changing password:', err);
      return { error: err instanceof Error ? err.message : 'Failed to change password' };
    }
  };

  // Update role permissions
  const updateRolePermissions = async (role: string, permissions: Record<string, boolean>) => {
    try {
      // Delete existing permissions for role
      await supabase!
        .from('role_permissions')
        .delete()
        .eq('role', role);

      // Insert new permissions
      const permissionsArray = Object.entries(permissions).map(([permission, enabled]) => ({
        role,
        permission,
        enabled
      }));

      const { error } = await supabase!
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
    loadUsers();
    loadRolePermissions();
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