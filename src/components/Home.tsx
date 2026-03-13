import React, { useMemo } from 'react';
import { DonutChart } from './DonutChart';
import { formatCurrency, formatDate, getLocalDateString } from '../constants';
import { Users } from 'lucide-react';

export function Home({ categories, expenses, loans, onEditExpense, onEditLoan }: any) {
  const currentMonth = getLocalDateString().slice(0, 7);

  const {
    totalMonth,
    categoryData,
    chartTotal,
    recentItems
  } = useMemo(() => {
    const monthExpenses = expenses.filter((e: any) => e.date.startsWith(currentMonth));
    const totalExpenses = monthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    
    const loansImpact = (loans || []).reduce((sum: number, l: any) => {
      let impact = 0;
      if (l.date.startsWith(currentMonth)) {
        impact += (l.type === 'owes_me' ? l.amount : -l.amount);
      }
      if (l.isPaid && l.paidDate?.startsWith(currentMonth)) {
        impact += (l.type === 'owes_me' ? -l.amount : l.amount);
      }
      return sum + impact;
    }, 0);

    const tMonth = totalExpenses + loansImpact;

    const loansOut = (loans || []).reduce((sum: number, l: any) => {
      let out = 0;
      if (l.date.startsWith(currentMonth) && l.type === 'owes_me') {
        out += l.amount;
      }
      if (l.isPaid && l.paidDate?.startsWith(currentMonth) && l.type === 'i_owe') {
        out += l.amount;
      }
      return sum + out;
    }, 0);

    const catData = categories.map((cat: any) => ({
      ...cat,
      value: monthExpenses.filter((e: any) => e.categoryId === cat.id).reduce((sum: number, e: any) => sum + e.amount, 0)
    })).filter((cat: any) => cat.value > 0);

    const uncategorizedExpenses = monthExpenses.filter((e: any) => !categories.some((c: any) => c.id === e.categoryId));
    const uncategorizedValue = uncategorizedExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

    if (uncategorizedValue > 0) {
      catData.push({
        id: 'uncategorized',
        name: 'Altro',
        icon: Users,
        color: '#8E8E93',
        value: uncategorizedValue
      } as any);
    }

    if (loansOut > 0) {
      catData.push({
        id: 'prestiti',
        name: 'Prestiti',
        icon: Users,
        color: '#0A84FF',
        value: loansOut
      } as any);
    }

    catData.sort((a: any, b: any) => b.value - a.value);
    const cTotal = catData.reduce((sum: number, cat: any) => sum + cat.value, 0);

    const rItems = [...expenses, ...loans]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalMonth: tMonth,
      categoryData: catData,
      chartTotal: cTotal,
      recentItems: rItems
    };
  }, [categories, expenses, loans, currentMonth]);

  return (
    <div className="p-6 pb-24 space-y-8 animate-in fade-in duration-300">
      <header className="pt-4">
        <h1 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Totale Mese</h1>
        <div className="text-5xl font-bold text-white tracking-tight">{formatCurrency(totalMonth)}</div>
      </header>

      <section className="bg-[#1C1C1E] rounded-3xl p-6 flex flex-col items-center shadow-lg">
        <DonutChart data={categoryData} total={chartTotal} />
        {categoryData.length > 0 && (
          <div className="w-full mt-6 space-y-3">
            {categoryData.map((cat: any) => (
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
        <h2 className="text-lg font-semibold text-white mb-4">Ultime Attività</h2>
        <div className="space-y-3">
          {recentItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nessuna attività recente</p>
          ) : (
            recentItems.map((item: any) => {
              const isLoan = 'type' in item;
              
              if (isLoan) {
                const isOwesMe = item.type === 'owes_me';
                return (
                  <div 
                    key={item.id} 
                    className={`bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#2C2C2E] transition-colors ${item.isPaid ? 'opacity-50' : ''}`}
                    onClick={() => onEditLoan && onEditLoan(item)}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-500/20 text-blue-500">
                      <Users size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">Prestito: {item.name}</div>
                      <div className="text-gray-400 text-xs truncate">
                        {isOwesMe ? 'Mi deve' : 'Devo a'} {item.isPaid ? '(Saldato)' : ''} • {formatDate(item.date)}
                      </div>
                    </div>
                    <div className={`font-semibold ${isOwesMe ? 'text-white' : 'text-green-500'}`}>
                      {isOwesMe ? '-' : '+'}{formatCurrency(item.amount)}
                    </div>
                  </div>
                );
              }

              const cat = categories.find((c: any) => c.id === item.categoryId) || { name: 'Altro', color: '#8E8E93', icon: Users };
              const Icon = cat.icon;
              return (
                <div 
                  key={item.id} 
                  className="bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#2C2C2E] transition-colors"
                  onClick={() => onEditExpense && onEditExpense(item)}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                    {Icon && <Icon size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{cat.name}</div>
                    <div className="text-gray-400 text-xs truncate">{item.note || formatDate(item.date)}</div>
                  </div>
                  <div className="text-white font-semibold">
                    -{formatCurrency(item.amount)}
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
