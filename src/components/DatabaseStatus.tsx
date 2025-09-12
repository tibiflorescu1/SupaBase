import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Database, RefreshCw } from 'lucide-react';

interface DatabaseTest {
  test: string;
  status: 'success' | 'error';
  message: string;
}

interface DatabaseStatusProps {
  onClose: () => void;
}

export default function DatabaseStatus({ onClose }: DatabaseStatusProps) {
  const [tests, setTests] = useState<DatabaseTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runDatabaseTests = async () => {
    try {
      if (!supabase) {
        setError('Supabase nu este configurat - lipsesc variabilele de mediu');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const testResults: DatabaseTest[] = [];
      
      // Test 1: Can read categorii (public access)
      try {
        const { data, error } = await supabase
          .from('categorii')
          .select('id, nume')
          .limit(1);
        
        if (error) {
          testResults.push({
            test: 'Citire Categorii (Public)',
            status: 'error',
            message: `Eroare: ${error.message}`
          });
        } else {
          testResults.push({
            test: 'Citire Categorii (Public)',
            status: 'success',
            message: `Succes - găsite ${data?.length || 0} categorii`
          });
        }
      } catch (err) {
        testResults.push({
          test: 'Citire Categorii (Public)',
          status: 'error',
          message: `Excepție: ${err}`
        });
      }

      // Test 2: Can read vehicule (public access)
      try {
        const { data, error } = await supabase
          .from('vehicule')
          .select('id, producator, model')
          .limit(1);
        
        if (error) {
          testResults.push({
            test: 'Citire Vehicule (Public)',
            status: 'error',
            message: `Eroare: ${error.message}`
          });
        } else {
          testResults.push({
            test: 'Citire Vehicule (Public)',
            status: 'success',
            message: `Succes - găsite ${data?.length || 0} vehicule`
          });
        }
      } catch (err) {
        testResults.push({
          test: 'Citire Vehicule (Public)',
          status: 'error',
          message: `Excepție: ${err}`
        });
      }

      // Test 3: Can read acoperiri (public access)
      try {
        const { data, error } = await supabase
          .from('acoperiri')
          .select('id, nume, pret')
          .limit(1);
        
        if (error) {
          testResults.push({
            test: 'Citire Acoperiri (Public)',
            status: 'error',
            message: `Eroare: ${error.message}`
          });
        } else {
          testResults.push({
            test: 'Citire Acoperiri (Public)',
            status: 'success',
            message: `Succes - găsite ${data?.length || 0} acoperiri`
          });
        }
      } catch (err) {
        testResults.push({
          test: 'Citire Acoperiri (Public)',
          status: 'error',
          message: `Excepție: ${err}`
        });
      }

      // Test 4: Can read materiale_print (public access)
      try {
        const { data, error } = await supabase
          .from('materiale_print')
          .select('id, nume')
          .limit(1);
        
        if (error) {
          testResults.push({
            test: 'Citire Materiale Print (Public)',
            status: 'error',
            message: `Eroare: ${error.message}`
          });
        } else {
          testResults.push({
            test: 'Citire Materiale Print (Public)',
            status: 'success',
            message: `Succes - găsite ${data?.length || 0} materiale`
          });
        }
      } catch (err) {
        testResults.push({
          test: 'Citire Materiale Print (Public)',
          status: 'error',
          message: `Excepție: ${err}`
        });
      }

      setTests(testResults);
    } catch (err) {
      console.error('Error running database tests:', err);
      setError(err instanceof Error ? err.message : 'Failed to run database tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDatabaseTests();
  }, []);

  const hasErrors = tests.some(t => t.status === 'error');
  const allSuccess = tests.every(t => t.status === 'success');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Teste Bază de Date</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={runDatabaseTests}
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
              <p className="text-gray-600">Se rulează testele...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Eroare la testare:</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {/* Status Summary */}
              <div className={`p-4 rounded-lg border ${
                hasErrors 
                  ? 'bg-red-50 border-red-200' 
                  : allSuccess 
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center mb-2">
                  {hasErrors ? (
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  ) : allSuccess ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    hasErrors 
                      ? 'text-red-800' 
                      : allSuccess 
                        ? 'text-green-800'
                        : 'text-yellow-800'
                  }`}>
                    {hasErrors 
                      ? '❌ Probleme Detectate' 
                      : allSuccess 
                        ? '✅ Toate Testele Trecute'
                        : '⚠️ Teste Parțiale'
                    }
                  </span>
                </div>
                <p className={`text-sm ${
                  hasErrors 
                    ? 'text-red-700' 
                    : allSuccess 
                      ? 'text-green-700'
                      : 'text-yellow-700'
                }`}>
                  {hasErrors 
                    ? `Unele teste au eșuat. Verifică politicile RLS și permisiunile.`
                    : allSuccess 
                      ? 'Toate tabelele sunt accesibile. Baza de date funcționează corect!'
                      : 'Unele teste nu au fost rulate complet.'
                  }
                </p>
              </div>

              {/* Tests List */}
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Rezultate Teste ({tests.length} total)
                </h3>
                
                {tests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nu s-au rulat teste
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tests.map((test, index) => (
                      <div 
                        key={index}
                        className={`p-4 border rounded-lg ${
                          test.status === 'error'
                            ? 'border-red-200 bg-red-50'
                            : test.status === 'success'
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {test.test}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            test.status === 'success' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {test.status === 'success' ? '✅ SUCCES' : '❌ EROARE'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{test.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {hasErrors && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🔧 Recomandări:</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Verifică politicile RLS în Supabase Dashboard</li>
                    <li>Asigură-te că tabelele au acces public pentru citire</li>
                    <li>Rulează migrația SQL pentru corectarea politicilor</li>
                    <li>Testează din nou după modificări</li>
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