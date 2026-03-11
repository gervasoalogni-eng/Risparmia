import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CATEGORIES, formatCurrency, formatDate } from '../constants';
import { ConfirmModal } from './ConfirmModal';

export function Storico({ expenses, onDelete }: any) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by month
  const grouped = sortedExpenses.reduce((acc: any, expense: any) => {
    const month = expense.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(expense);
    return acc;
  }, {});

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-white mb-6 pt-4">Storico Spese</h1>
      
      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500 text-center py-10">Nessuna spesa registrata</p>
      ) : (
        Object.keys(grouped).sort().reverse().map(month => {
          const [year, m] = month.split('-');
          const monthName = new Date(Number(year), Number(m) - 1).toLocaleString('it-IT', { month: 'long', year: 'numeric' });
          
          return (
            <div key={month} className="mb-8">
              <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3 capitalize">{monthName}</h2>
              <div className="space-y-3">
                {grouped[month].map((expense: any) => {
                  const cat = CATEGORIES.find(c => c.id === expense.categoryId) || CATEGORIES[6];
                  const Icon = cat.icon;
                  return (
                    <div key={expense.id} className="bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{cat.name}</div>
                        <div className="text-gray-400 text-xs truncate">{expense.note ? `${expense.note} • ` : ''}{formatDate(expense.date)}</div>
                      </div>
                      <div className="text-white font-semibold">
                        -{formatCurrency(expense.amount)}
                      </div>
                      <button 
                        onClick={() => setDeleteId(expense.id)}
                        className="p-2 text-red-500 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-colors shrink-0"
                        aria-label="Elimina spesa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDelete(deleteId);
        }}
        title="Elimina spesa"
        message="Sei sicuro di voler eliminare questa spesa? L'operazione non può essere annullata."
      />
    </div>
  );
}
