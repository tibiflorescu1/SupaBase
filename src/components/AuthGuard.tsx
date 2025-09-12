import React from 'react';
import { useAuth, UserRole } from '../hooks/useAuth';
import { Shield, AlertTriangle } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, requiredRole = 'viewer', fallback }: AuthGuardProps) {
  const { user, profile, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se verifică autentificarea...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acces restricționat</h2>
          <p className="text-gray-600 mb-4">
            Trebuie să te autentifici pentru a accesa această aplicație.
          </p>
        </div>
      </div>
    );
  }

  if (!hasPermission(requiredRole)) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Permisiuni insuficiente</h2>
          <p className="text-gray-600 mb-4">
            Nu ai permisiunile necesare pentru a accesa această secțiune.
          </p>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Rolul tău:</strong> {profile.role}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Rol necesar:</strong> {requiredRole}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}