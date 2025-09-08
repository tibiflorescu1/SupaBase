@@ .. @@
 import React, { useState } from 'react';
 import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
-import type { AppData, Categorie } from '../types';
+import type { AppData, Categorie } from '../hooks/useSupabaseData';
 
 interface CategoriesTabProps {
   data: AppData;
-  setData: (data: AppData) => void;
+  onSaveCategorie: (categorie: Omit<Categorie, 'id'> & { id?: string }) => Promise<void>;
+  onDeleteCategorie: (id: string) => Promise<void>;
+  onRefetch: () => Promise<void>;
 }
 
-export default function CategoriesTab({ data, setData }: CategoriesTabProps) {
+export default function CategoriesTab({ data, onSaveCategorie, onDeleteCategorie }: CategoriesTabProps) {
   const [editingId, setEditingId] = useState<string | null>(null);
@@ .. @@
   const [newCategory, setNewCategory] = useState('');
   const [isAdding, setIsAdding] = useState(false);
+  const [saving, setSaving] = useState(false);
 
-  const handleSave = (id: string, nume: string) => {
-    setData({
-      ...data,
-      categorii: data.categorii.map(cat =>
-        cat.id === id ? { ...cat, nume } : cat
-      )
-    });
-    setEditingId(null);
-    setEditingName('');
+  const handleSave = async (id: string, nume: string) => {
+    if (!nume.trim()) return;
+    
+    try {
+      setSaving(true);
+      await onSaveCategorie({ id, nume: nume.trim() });
+      setEditingId(null);
+      setEditingName('');
+    } catch (error) {
+      console.error('Error saving category:', error);
+      alert('Eroare la salvarea categoriei');
+    } finally {
+      setSaving(false);
+    }
   };
 
-  const handleDelete = (id: string) => {
+  const handleDelete = async (id: string) => {
     if (confirm('Ești sigur că vrei să ștergi această categorie?')) {
-      setData({
-        ...data,
-        categorii: data.categorii.filter(cat => cat.id !== id)
-      });
+      try {
+        setSaving(true);
+        await onDeleteCategorie(id);
+      } catch (error) {
+        console.error('Error deleting category:', error);
+        alert('Eroare la ștergerea categoriei');
+      } finally {
+        setSaving(false);
+      }
     }
   };
 
-  const handleAdd = () => {
+  const handleAdd = async () => {
     if (newCategory.trim()) {
-      const newId = Date.now().toString();
-      setData({
-        ...data,
-        categorii: [...data.categorii, { id: newId, nume: newCategory.trim() }]
-      });
-      setNewCategory('');
-      setIsAdding(false);
+      try {
+        setSaving(true);
+        await onSaveCategorie({ nume: newCategory.trim() });
+        setNewCategory('');
+        setIsAdding(false);
+      } catch (error) {
+        console.error('Error adding category:', error);
+        alert('Eroare la adăugarea categoriei');
+      } finally {
+        setSaving(false);
+      }
     }
   };
 
@@ .. @@
                   <button
                     onClick={() => handleSave(category.id, editingName)}
                     className="p-1 text-green-600 hover:text-green-800"
+                    disabled={saving}
                   >
-                    <Save className="w-4 h-4" />
+                    {saving ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                   </button>
@@ .. @@
                   <button
                     onClick={() => handleDelete(category.id)}
                     className="p-1 text-red-600 hover:text-red-800"
+                    disabled={saving}
                   >
                     <Trash2 className="w-4 h-4" />
@@ .. @@
               <button
                 onClick={handleAdd}
                 className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
+                disabled={saving}
               >
-                Adaugă
+                {saving ? 'Se salvează...' : 'Adaugă'}
               </button>