import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';

interface PolicyInfo {
  policyname: string;
  tablename: string;
  cmd: string;
  permissive: string;
  roles: string[];
  qual: string;
}

interface DatabaseStatusProps {
  onClose: () => void;
}

export default function DatabaseStatus({ onClose }: DatabaseStatusProps) {
  const [policies, setPolicies] = useState<PolicyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check policies on categorii table
      const { data, error } = await supabase
        .from('pg_policies')
        .select('policyname, tablename, cmd, permissive, roles, qual')
        .eq('tablename', 'categorii')
        .order('cmd', { ascending: true });

      if (error) {
        throw error;
      }

      setPolicies(data || []);
    } catch (err) {
      console.error('Error checking policies:', err);
      setError(err instanceof Error ? err.message : 'Failed to check policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPolicies();
  }, []);

  const selectPolicies = policies.filter(p => p.cmd === 'SELECT');
  const hasDuplicates = selectPolicies.length > 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Status Bază de Date</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={checkPolicies}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Se verifică politicile...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Eroare la verificare:</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {/* Status Summary */}
              <div className={`p-4 rounded-lg border ${
                hasDuplicates 
                  ? 'bg-red-50 border-red-200' 
                  : selectPolicies.length === 1 
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center mb-2">
                  {hasDuplicates ? (
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  ) : selectPolicies.length === 1 ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    hasDuplicates 
                      ? 'text-red-800' 
                      : selectPolicies.length === 1 
                        ? 'text-green-800'
                        : 'text-yellow-800'
                  }`}>
                    {hasDuplicates 
                      ? '❌ Politici Duplicate Detectate' 
                      : selectPolicies.length === 1 
                        ? '✅ Politici Corecte'
                        : '⚠️ Lipsesc Politici SELECT'
                    }
                  </span>
                </div>
                <p className={`text-sm ${
                  hasDuplicates 
                    ? 'text-red-700' 
                    : selectPolicies.length === 1 
                      ? 'text-green-700'
                      : 'text-yellow-700'
                }`}>
                  {hasDuplicates 
                    ? `Găsite ${selectPolicies.length} politici SELECT pe tabela categorii. Ar trebui să fie doar una.`
                    : selectPolicies.length === 1 
                      ? 'Exact o politică SELECT găsită pe tabela categorii. Perfect!'
                      : 'Nu s-au găsit politici SELECT pe tabela categorii.'
                  }
                </p>
              </div>

              {/* Policies List */}
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Politici pe tabela "categorii" ({policies.length} total)
                </h3>
                
                {policies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nu s-au găsit politici pe tabela categorii
                  </div>
                ) : (
                  <div className="space-y-3">
                    {policies.map((policy, index) => (
                      <div 
                        key={index}
                        className={`p-4 border rounded-lg ${
                          policy.cmd === 'SELECT' && hasDuplicates
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {policy.policyname}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            policy.cmd === 'SELECT' 
                              ? 'bg-blue-100 text-blue-800'
                              : policy.cmd === 'INSERT'
                                ? 'bg-green-100 text-green-800'
                                : policy.cmd === 'UPDATE'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                          }`}>
                            {policy.cmd}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Tip:</strong> {policy.permissive}</p>
                          <p><strong>Roluri:</strong> {policy.roles?.join(', ') || 'N/A'}</p>
                          {policy.qual && (
                            <p><strong>Condiție:</strong> <code className="bg-gray-200 px-1 rounded">{policy.qual}</code></p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {hasDuplicates && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🔧 Recomandări:</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Rulează migrația SQL pentru a elimina duplicatele</li>
                    <li>Verifică din nou după rularea migrației</li>
                    <li>Testează funcționalitatea aplicației</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}