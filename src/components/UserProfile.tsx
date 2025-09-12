import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, Shield } from 'lucide-react';

export default function UserProfile() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    if (confirm('Ești sigur că vrei să te deconectezi?')) {
      await signOut();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-yellow-100 text-yellow-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Vizualizator';
      default:
        return role;
    }
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{user.email}</span>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(profile.role)}`}>
          <Shield className="w-3 h-3 mr-1" />
          {getRoleLabel(profile.role)}
        </span>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        title="Deconectează-te"
      >
        <LogOut className="w-4 h-4" />
        <span>Ieșire</span>
      </button>
    </div>
  );
}