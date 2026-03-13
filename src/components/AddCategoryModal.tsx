import React, { useState, useEffect } from 'react';
import { X, Tag, Palette } from 'lucide-react';
import * as Icons from 'lucide-react';

const AVAILABLE_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', 
  '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55',
  '#8E8E93', '#A2845E', '#FF8A65', '#4DB6AC'
];

const AVAILABLE_ICONS = [
  'ShoppingCart', 'Car', 'Home', 'Coffee', 
  'Film', 'HeartPulse', 'Gift', 'Briefcase',
  'Plane', 'Smartphone', 'Book', 'Music',
  'Zap', 'Smile', 'Star', 'Tag'
];

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: any) => void;
  categoryToEdit?: any | null;
}

export function AddCategoryModal({ isOpen, onClose, onSave, categoryToEdit }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [iconName, setIconName] = useState(AVAILABLE_ICONS[0]);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setColor(categoryToEdit.color);
      // Try to find the icon name, fallback to first if not found (since we store the component reference in constants, this is tricky, but for custom ones we can store the string name)
      setIconName(categoryToEdit.iconName || AVAILABLE_ICONS[0]);
    } else {
      setName('');
      setColor(AVAILABLE_COLORS[0]);
      setIconName(AVAILABLE_ICONS[0]);
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    const newCategory = {
      id: categoryToEdit ? categoryToEdit.id : crypto.randomUUID(),
      name: name.trim(),
      color,
      iconName,
      // We'll map iconName to the actual component when rendering, or store it here
      icon: (Icons as any)[iconName] || Icons.Tag
    };

    onSave(newCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1C1C1E] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {categoryToEdit ? 'Modifica Categoria' : 'Nuova Categoria'}
          </h2>
          <button onClick={onClose} className="p-2 bg-[#2C2C2E] rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nome</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Tag size={20} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#2C2C2E] text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Es. Spesa, Auto..."
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Colore</label>
            <div className="grid grid-cols-6 gap-3">
              {AVAILABLE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#1C1C1E]' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Icona</label>
            <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 pb-2">
              {AVAILABLE_ICONS.map(iconStr => {
                const IconComp = (Icons as any)[iconStr];
                if (!IconComp) return null;
                return (
                  <button
                    key={iconStr}
                    onClick={() => setIconName(iconStr)}
                    className={`p-3 rounded-2xl flex items-center justify-center transition-colors ${iconName === iconStr ? 'bg-blue-500 text-white' : 'bg-[#2C2C2E] text-gray-400 hover:bg-[#3A3A3C]'}`}
                  >
                    <IconComp size={24} />
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors active:scale-[0.98]"
          >
            Salva Categoria
          </button>
        </div>
      </div>
    </div>
  );
}
