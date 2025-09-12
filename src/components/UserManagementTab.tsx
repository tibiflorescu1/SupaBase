import React, { useState, useEffect } from 'react';
import { Users, Shield, Edit2, Trash2, UserCheck, UserX, Crown, Briefcase, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// Simplified UserProfile interface for this component
interface SimpleUserProfile {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export default function UserManagementTab() {
  const { profile: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<SimpleUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading users from user_profiles...');
      console.log('📊 Supabase client status:', !!supabase);
      console.log('🔑 Environment check:', {
        hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      });
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📋 Raw response from Supabase:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- Data length:', data?.length || 0);

      if (error) {
        console.error('❌ Supabase error:', error);
        // Don't throw immediately, try to show what we can
        setError(`Eroare Supabase: ${error.message}`);
        
        // If it's a policy error, show mock data
        if (error.message?.includes('policy') || error.message?.includes('RLS') || error.message?.includes('permission')) {
          console.log('🔄 Policy error detected, showing mock data...');
          setUsers([
            {
              id: 'mock-admin-1',
              email: 'tibiflorescu@yahoo.com',
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]);
          setError('Probleme cu politicile RLS. Se afișează date de test. Verifică migrația SQL.');
          return;
        }
      }
      
      console.log('✅ Users loaded:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('✅ Setting users data:', data);
        setUsers(data);
        setError(null); // Clear any previous errors
      } else {
        console.log('📝 No users found in database');
        // Set empty array if no users found
        setUsers([]);
        setError('Nu s-au găsit utilizatori în baza de date.');
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      console.log('🔄 Error loading users, setting empty array...');
      
      // Set empty array on error
      setUsers([]);
      setError(`Eroare la încărcare: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    if (!isAdmin()) {
      alert('Nu ai permisiuni pentru această acțiune');
      return;
    }

    if (userId === currentUser?.id && newRole !== 'admin') {
      alert('Nu îți poți schimba propriul rol de admin');
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      await loadUsers();
      alert(`Rolul utilizatorului a fost actualizat la ${newRole}`);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      alert('Eroare la actualizarea rolului: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    if (!isAdmin()) {
      alert('Nu ai permisiuni pentru această acțiune');
      return;
    }

    if (userId === currentUser?.id) {
      alert('Nu îți poți dezactiva propriul cont');
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      await loadUsers();
      alert(`Utilizatorul a fost ${!isActive ? 'activat' : 'dezactivat'}`);
    } catch (error: any) {
      console.error('Error updating user status:', error);
      alert('Eroare la actualizarea statusului: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'editor': return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-600" />;
      default: return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acces Restricționat</h3>
        <p className="text-gray-600">
          Doar administratorii pot accesa această secțiune.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Se încarcă utilizatorii...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administrare Utilizatori</h2>
          <p className="text-gray-600 mt-1">
            Gestionează rolurile și permisiunile utilizatorilor
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Total utilizatori: {users.length}</span>
          <span>Activi: {users.filter(u => u.is_active).length}</span>
          {error && (
            <button
              onClick={loadUsers}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs"
            >
              Reîncarcă
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-800 font-medium">Informație:</span>
          </div>
          <p className="text-orange-700 mt-1 text-sm">
            {error}
          </p>
          <div className="mt-2">
            <button
              onClick={loadUsers}
              className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-lg transition-colors"
            >
              🔄 Încearcă din nou
            </button>
          </div>
        </div>
      )}

      {/* Role Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Explicația Rolurilor:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            <div>
              <span className="font-medium text-yellow-800">Admin:</span>
              <p className="text-yellow-700">Acces complet, poate gestiona utilizatori</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-medium text-blue-800">Editor:</span>
              <p className="text-blue-700">Poate adăuga/edita vehicule și materiale</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-gray-600" />
            <div>
              <span className="font-medium text-gray-800">Viewer:</span>
              <p className="text-gray-700">Doar vizualizare și calculator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilizator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Înregistrat
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50 ${!user.is_active ? 'opacity-60' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar_url}
                        alt={user.full_name || user.email}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email ? user.email.split('@')[0] : 'Utilizator necunoscut'}
                        {user.id === currentUser?.id && (
                          <span className="ml-2 text-xs text-blue-600">(Tu)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.email || 'Email necunoscut'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active !== false
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active !== false ? 'Activ' : 'Inactiv'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {/* Role Change Dropdown */}
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as 'admin' | 'editor' | 'viewer')}
                      disabled={saving || user.id === currentUser?.id || user.id.startsWith('mock-') || error !== null}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>

                    {/* Toggle Status Button */}
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active !== false)}
                      disabled={saving || user.id === currentUser?.id || error !== null}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.is_active !== false
                          ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                      title={user.is_active !== false ? 'Dezactivează utilizator' : 'Activează utilizator'}
                    >
                      {user.is_active !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nu există utilizatori</h3>
          <p className="text-gray-600">
            Utilizatorii vor apărea aici după ce se conectează prima dată.
          </p>
        </div>
      )}
    </div>
  );
}