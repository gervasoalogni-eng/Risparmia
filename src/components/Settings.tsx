import React, { useState, useRef } from 'react';
import { Download, Upload, Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import * as Icons from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ConfirmModal } from './ConfirmModal';
import { AddCategoryModal } from './AddCategoryModal';

export function Settings({ categories, setCategories, expenses, loans, setExpenses, setLoans, showToast }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any | null>(null);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCategories(items);
  };

  const handleExport = () => {
    const data = {
      spese: expenses,
      prestiti: loans,
      categorie: categories,
      expenses, // backward compatibility
      loans, // backward compatibility
      categories, // backward compatibility
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-dati-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup esportato con successo!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (Array.isArray(data)) {
          // Old format: just an array of expenses
          setExpenses(data);
        } else {
          // New format
          const importedExpenses = data.spese || data.expenses;
          const importedLoans = data.prestiti || data.loans;
          const importedCategories = data.categorie || data.categories;

          if (importedExpenses) setExpenses(importedExpenses);
          if (importedLoans) setLoans(importedLoans);
          if (importedCategories) {
            const mappedCategories = importedCategories.map((cat: any) => ({
              ...cat,
              icon: cat.iconName ? (Icons as any)[cat.iconName] : Icons.Tag
            }));
            setCategories(mappedCategories);
          }
        }
        showToast('Dati importati con successo!');
      } catch (error) {
        alert('Errore durante l\'importazione. File non valido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveCategory = (category: any) => {
    if (categoryToEdit) {
      setCategories((prev: any) => prev.map((c: any) => c.id === category.id ? category : c));
      showToast('Categoria modificata!');
    } else {
      setCategories((prev: any) => [...prev, category]);
      showToast('Categoria aggiunta!');
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      showToast('Non puoi eliminare l\'ultima categoria!');
      setDeleteCatId(null);
      return;
    }
    setCategories((prev: any) => prev.filter((c: any) => c.id !== id));
    showToast('Categoria eliminata!');
    setDeleteCatId(null);
  };

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-300 space-y-8">
      <header className="pt-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Impostazioni</h1>
      </header>

      <section className="bg-[#1C1C1E] rounded-3xl p-6 shadow-lg space-y-6">
        <h2 className="text-lg font-semibold text-white">Backup e Sincronizzazione</h2>
        <p className="text-sm text-gray-400">
          Esporta i tuoi dati per non perderli o per trasferirli su un altro dispositivo.
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleExport}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={20} />
            Esporta Dati (JSON)
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Upload size={20} />
            Importa Dati
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
          />
        </div>
      </section>

      <section className="bg-[#1C1C1E] rounded-3xl p-6 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Categorie</h2>
          <button 
            onClick={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            className="p-2 text-blue-500 bg-blue-500/10 rounded-full hover:bg-blue-500/20 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div 
                className="space-y-3"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {categories.map((cat: any, index: number) => {
                  const Icon = cat.icon;
                  return (
                    <Draggable key={cat.id} draggableId={cat.id} index={index} {...({} as any)}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-3 bg-[#2C2C2E] rounded-xl group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500/50 z-50' : ''}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div 
                              {...provided.dragHandleProps}
                              className="p-1 text-gray-500 hover:text-white cursor-grab active:cursor-grabbing shrink-0"
                            >
                              <GripVertical size={20} />
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                              {Icon && <Icon size={18} />}
                            </div>
                            <span className="text-white font-medium truncate">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              onClick={() => {
                                setCategoryToEdit(cat);
                                setIsCategoryModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => setDeleteCatId(cat.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </section>

      <AddCategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        categoryToEdit={categoryToEdit}
      />

      <ConfirmModal 
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={() => {
          if (deleteCatId) handleDeleteCategory(deleteCatId);
        }}
        title="Elimina categoria"
        message="Sei sicuro di voler eliminare questa categoria? Le spese associate rimarranno, ma senza categoria."
      />
    </div>
  );
}
