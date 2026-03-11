import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { CATEGORIES, formatCurrency, formatDate, getLocalDateString } from '../constants';
import { ConfirmModal } from './ConfirmModal';
import { DonutChart } from './DonutChart';

export function Storico({ expenses, loans, onDelete }: any) {
  const [viewDate, setViewDate] = useState(new Date());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const monthStr = getLocalDateString(viewDate).slice(0, 7);
  const monthName = viewDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  // Get expenses for the selected month
  let monthExpenses = expenses.filter((e: any) => e.date.startsWith(monthStr));
  const monthLoans = loans?.filter((l: any) => l.date.startsWith(monthStr)) || [];

  // Project recurring expenses for future months
  const now = new Date();
  const currentMonthStr = getLocalDateString(now).slice(0, 7);
  
  if (monthStr > currentMonthStr) {
    // Find latest recurring expenses
    const recurringExpenses = expenses.filter((e: any) => e.categoryId === 'ricorrente');
    const recurringGroups = new Map<string, any>();
    
    recurringExpenses.forEach((e: any) => {
      const key = `${e.note.trim().toLowerCase()}-${e.amount}`;
      const existing = recurringGroups.get(key);
      if (!existing || new Date(e.date) > new Date(existing.date)) {
        recurringGroups.set(key, e);
      }
    });

    recurringGroups.forEach(latestExpense => {
      const latestDate = new Date(latestExpense.date);
      const targetMonth = viewDate.getMonth();
      const targetYear = viewDate.getFullYear();
      
      // If the latest expense is before the viewed month, project it
      if (latestDate.getFullYear() < targetYear || (latestDate.getFullYear() === targetYear && latestDate.getMonth() < targetMonth)) {
        const projectedDate = new Date(targetYear, targetMonth, latestDate.getDate());
        if (projectedDate.getMonth() !== targetMonth) {
          projectedDate.setDate(0);
        }
        monthExpenses.push({
          ...latestExpense,
          id: `projected-${latestExpense.id}-${monthStr}`,
          date: getLocalDateString(projectedDate),
          isProjected: true
        });
      }
    });
  }

  const totalExpenses = monthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  
  const loansImpact = monthLoans.reduce((sum: number, l: any) => {
    return sum + (l.type === 'i_owe' ? l.amount : -l.amount);
  }, 0);

  const totalMonth = totalExpenses + loansImpact;
  const numExpenses = monthExpenses.length;
  const avgExpense = numExpenses > 0 ? totalExpenses / numExpenses : 0;

  const categoryData = CATEGORIES.map(cat => ({
    ...cat,
    value: monthExpenses.filter((e: any) => e.categoryId === cat.id).reduce((sum: number, e: any) => sum + e.amount, 0)
  })).filter(cat => cat.value > 0).sort((a, b) => b.value - a.value);

  const cardTotal = monthExpenses.filter((e: any) => e.paymentMethod === 'card').reduce((sum: number, e: any) => sum + e.amount, 0);
  const cashTotal = monthExpenses.filter((e: any) => e.paymentMethod === 'cash').reduce((sum: number, e: any) => sum + e.amount, 0);
  const maxPayment = Math.max(cardTotal, cashTotal, 1); // avoid div by 0

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-300 space-y-6">
      <header className="pt-4 flex flex-col items-center">
        <h1 className="text-xl font-bold text-white mb-6">Report</h1>
        <div className="flex items-center justify-between w-full max-w-xs">
          <button onClick={prevMonth} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white capitalize">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </header>

      <section className="bg-[#1C1C1E] rounded-3xl p-6 shadow-lg">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center border-r border-[#2C2C2E]">
            <div className="text-gray-400 text-sm mb-1">Totale Spese</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalMonth)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Numero Spese</div>
            <div className="text-2xl font-bold text-white">{numExpenses}</div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-[#2C2C2E]">
          <span className="text-gray-400 text-sm">Media per spesa</span>
          <span className="text-white font-bold">{formatCurrency(avgExpense)}</span>
        </div>
      </section>

      <section className="bg-[#1C1C1E] rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6">Spese per Categoria</h3>
        <div className="flex flex-col items-center">
          <DonutChart data={categoryData} total={totalExpenses} />
          {categoryData.length > 0 && (
            <div className="w-full mt-6 space-y-3">
              {categoryData.map(cat => (
                <div key={cat.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-300">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">
                      {((cat.value / totalExpenses) * 100).toFixed(1)}%
                    </span>
                    <span className="text-white font-medium">{formatCurrency(cat.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#1C1C1E] rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6">Metodo di Pagamento</h3>
        <div className="flex justify-around items-end h-32 mb-6">
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-12 bg-blue-500 rounded-t-xl transition-all duration-500" style={{ height: `${(cardTotal / maxPayment) * 100}%`, minHeight: '4px' }} />
            <span className="text-sm text-gray-400">Carta</span>
          </div>
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-12 bg-green-500 rounded-t-xl transition-all duration-500" style={{ height: `${(cashTotal / maxPayment) * 100}%`, minHeight: '4px' }} />
            <span className="text-sm text-gray-400">Contanti</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-300">Carta</span>
            </div>
            <span className="text-white font-medium">{formatCurrency(cardTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-300">Contanti</span>
            </div>
            <span className="text-white font-medium">{formatCurrency(cashTotal)}</span>
          </div>
        </div>
      </section>

      <section className="space-y-3 pt-4">
        <h3 className="text-lg font-bold text-white mb-4">Dettaglio Spese</h3>
        {monthExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nessuna spesa in questo mese</p>
        ) : (
          [...monthExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense: any) => {
            const cat = CATEGORIES.find(c => c.id === expense.categoryId) || CATEGORIES[6];
            const Icon = cat.icon;
            return (
              <div key={expense.id} className="bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">
                    {cat.name} {expense.isProjected && <span className="text-xs text-blue-400 ml-1">(Prevista)</span>}
                  </div>
                  <div className="text-gray-400 text-xs truncate">{expense.note ? `${expense.note} • ` : ''}{formatDate(expense.date)}</div>
                </div>
                <div className="text-white font-semibold">
                  -{formatCurrency(expense.amount)}
                </div>
                {!expense.isProjected && (
                  <button 
                    onClick={() => setDeleteId(expense.id)}
                    className="p-2 text-red-500 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-colors shrink-0"
                    aria-label="Elimina spesa"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </section>

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
