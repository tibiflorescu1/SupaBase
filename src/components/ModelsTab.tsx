@@ .. @@
 import React, { useState } from 'react';
 import { Plus, Edit2, Trash2, Save, X, Upload, FileText } from 'lucide-react';
-import type { AppData, Vehicul, Acoperire, OptiuneExtra } from '../types';
+import type { AppData, Vehicul, Acoperire, OptiuneExtra } from '../hooks/useSupabaseData';
 
 interface ModelsTabProps {
   data: AppData;
-  setData: (data: AppData) => void;
+  onSaveVehicul: (vehicul: Omit<Vehicul, 'id' | 'acoperiri' | 'optiuniExtra'> & { id?: string }) => Promise<void>;
+  onDeleteVehicul: (id: string) => Promise<void>;
+  onRefetch: () => Promise<void>;
 }
 
-export default function ModelsTab({ data, setData }: ModelsTabProps) {
+export default function ModelsTab({ data, onSaveVehicul, onDeleteVehicul }: ModelsTabProps) {
   const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
@@ .. @@
   const [isAdding, setIsAdding] = useState(false);
   const [searchTerm, setSearchTerm] = useState('');
+  const [saving, setSaving] = useState(false);
 
-  const handleSaveVehicle = () => {
+  const handleSaveVehicle = async () => {
     if (editingVehicle && editingVehicle.producator && editingVehicle.model && editingVehicle.categorieId) {
-      if (editingVehicle.id) {
-        // Update existing
-        setData({
-          ...data,
-          vehicule: data.vehicule.map(v =>
-            v.id === editingVehicle.id ? editingVehicle : v
-          )
-        });
-      } else {
-        // Add new
-        const newVehicle = {
-          ...editingVehicle,
-          id: Date.now().toString(),
-          acoperiri: [],
-          optiuniExtra: []
-        };
-        setData({
-          ...data,
-          vehicule: [...data.vehicule, newVehicle]
-        });
+      try {
+        setSaving(true);
+        await onSaveVehicul({
+          id: editingVehicle.id,
+          producator: editingVehicle.producator,
+          model: editingVehicle.model,
+          categorieId: editingVehicle.categorieId,
+          perioadaFabricatie: editingVehicle.perioadaFabricatie
+        });
+        setEditingVehicle(null);
+        setIsAdding(false);
+      } catch (error) {
+        console.error('Error saving vehicle:', error);
+        alert('Eroare la salvarea vehiculului');
+      } finally {
+        setSaving(false);
       }
-      setEditingVehicle(null);
-      setIsAdding(false);
     }
   };
 
-  const handleDeleteVehicle = (id: string) => {
+  const handleDeleteVehicle = async (id: string) => {
     if (confirm('Ești sigur că vrei să ștergi acest vehicul?')) {
-      setData({
-        ...data,
-        vehicule: data.vehicule.filter(v => v.id !== id)
-      });
-      if (selectedVehicle === id) {
-        setSelectedVehicle(null);
+      try {
+        setSaving(true);
+        await onDeleteVehicul(id);
+        if (selectedVehicle === id) {
+          setSelectedVehicle(null);
+        }
        alert('Vehiculul a fost salvat cu succes!');
+      } catch (error) {
+        console.error('Error deleting vehicle:', error);
+        alert('Eroare la ștergerea vehiculului');
+      } finally {
+        setSaving(false);
       }
     }
   };
@@ .. @@
                 <button
                   onClick={handleSaveVehicle}
                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
+                  disabled={saving}
                 >
-                  <Save className="w-4 h-4 mr-2" />
-                  Salvează
+                  {saving ? (
+                    <>
+                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
+                      Se salvează...
+                    </>
+                  ) : (
+                    <>
+                      <Save className="w-4 h-4 mr-2" />
+                      Salvează
+                    </>
+                  )}
                 </button>
@@ .. @@
                     <button
                       onClick={() => handleDeleteVehicle(vehicle.id)}
                       className="p-2 text-red-600 hover:text-red-800"
+                      disabled={saving}
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>