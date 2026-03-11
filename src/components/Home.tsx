import React from 'react';
import { DonutChart } from './DonutChart';
import { CATEGORIES, formatCurrency, formatDate, getLocalDateString } from '../constants';

export function Home({ expenses, loans }: any) {
  const currentMonth = getLocalDateString().slice(0, 7);
  const monthExpenses = expenses.filter((e: any) => e.date.startsWith(currentMonth));
  const monthLoans = loans?.filter((l: any) => l.date.startsWith(currentMonth)) || [];
  
  const totalExpenses = monthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  
  // i_owe (debito) adds to expenses, owes_me (credito) subtracts from expenses
  const loansImpact = monthLoans.reduce((sum: number, l: any) => {
    return sum + (l.type === 'i_owe' ? l.amount : -l.amount);
  }, 0);

  const totalMonth = totalExpenses + loansImpact;

  const categoryData = CATEGORIES.map(cat => ({
    ...cat,
    value: monthExpenses.filter((e: any) => e.categoryId === cat.id).reduce((sum: number, e: any) => sum + e.amount, 0)
  })).filter(cat => cat.value > 0).sort((a, b) => b.value - a.value);

  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="p-6 pb-24 space-y-8 animate-in fade-in duration-300">
      <header className="pt-4">
        <h1 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Totale Mese</h1>
        <div className="text-5xl font-bold text-white tracking-tight">{formatCurrency(totalMonth)}</div>
      </header>

      <section className="bg-[#1C1C1E] rounded-3xl p-6 flex flex-col items-center shadow-lg">
        <DonutChart data={categoryData} total={totalExpenses} />
        {categoryData.length > 0 && (
          <div className="w-full mt-6 space-y-3">
            {categoryData.map(cat => (
              <div key={cat.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-300">{cat.name}</span>
                </div>
                <span className="text-white font-medium">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Spese Recenti</h2>
        <div className="space-y-3">
          {recentExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nessuna spesa recente</p>
          ) : (
            recentExpenses.map((expense: any) => {
              const cat = CATEGORIES.find(c => c.id === expense.categoryId) || CATEGORIES[6];
              const Icon = cat.icon;
              return (
                <div key={expense.id} className="bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{cat.name}</div>
                    <div className="text-gray-400 text-xs truncate">{expense.note || formatDate(expense.date)}</div>
                  </div>
                  <div className="text-white font-semibold">
                    -{formatCurrency(expense.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
