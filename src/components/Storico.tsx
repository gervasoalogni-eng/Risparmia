import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Users } from 'lucide-react';
import { formatCurrency, formatDate, getLocalDateString } from '../constants';
import { ConfirmModal } from './ConfirmModal';
import { DonutChart } from './DonutChart';

export function Storico({ categories, expenses, loans, onDeleteExpense, onDeleteLoan, onEditExpense, onEditLoan }: any) {
  const [viewDate, setViewDate] = useState(new Date());
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [deleteLoanId, setDeleteLoanId] = useState<string | null>(null);

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const monthStr = getLocalDateString(viewDate).slice(0, 7);
  const monthName = viewDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  const {
    monthExpenses,
    monthLoans,
    totalMonth,
    numExpenses,
    avgExpense,
    categoryData,
    chartTotal,
    cardTotal,
    cashTotal,
    maxPayment,
    monthItems
  } = useMemo(() => {
    // Get expenses for the selected month
    let mExpenses = expenses.filter((e: any) => e.date.startsWith(monthStr));
    const mLoans = loans?.filter((l: any) => l.date.startsWith(monthStr) || (l.isPaid && l.paidDate?.startsWith(monthStr))) || [];

    // Project recurring expenses for future months
    const now = new Date();
    const currentMonthStr = getLocalDateString(now).slice(0, 7);
    
    if (monthStr > currentMonthStr) {
      // Find latest recurring expenses
      const recurringExpenses = expenses.filter((e: any) => e.categoryId === 'ricorrente');
      const recurringGroups = new Map<string, any>();
      
      recurringExpenses.forEach((e: any) => {
        const key = e.note.trim().toLowerCase();
        if (!key) return;
        const existing = recurringGroups.get(key);
        if (!existing || new Date(e.date) > new Date(existing.date)) {
          recurringGroups.set(key, e);
        }
      });

      recurringGroups.forEach(latestExpense => {
        const latestDate = new Date(latestExpense.date);
        const originalDay = latestDate.getDate();
        const targetMonth = viewDate.getMonth();
        const targetYear = viewDate.getFullYear();

        // If the latest expense is before the viewed month, project it
        if (latestDate.getFullYear() < targetYear || (latestDate.getFullYear() === targetYear && latestDate.getMonth() < targetMonth)) {
          const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
          const targetDay = Math.min(originalDay, daysInTargetMonth);
          const projectedDate = new Date(targetYear, targetMonth, targetDay);
          
          if (!latestExpense.stoppedDate || getLocalDateString(projectedDate) < latestExpense.stoppedDate) {
            mExpenses.push({
              ...latestExpense,
              id: `projected-${latestExpense.id}-${monthStr}`,
              date: getLocalDateString(projectedDate),
              isProjected: true
            });
          }
        }
      });
    }

    const totalExpenses = mExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    
    const loansImpact = mLoans.reduce((sum: number, l: any) => {
      let impact = 0;
      if (l.date.startsWith(monthStr)) {
        impact += l.amount;
      }
      if (l.isPaid && l.paidDate?.startsWith(monthStr) && l.type === 'owes_me') {
        impact -= l.amount;
      }
      return sum + impact;
    }, 0);

    const tMonth = totalExpenses + loansImpact;
    
    const loansOut = loansImpact;

    const nExpenses = mExpenses.length + mLoans.filter((l: any) => l.date.startsWith(monthStr)).length;
    const aExpense = nExpenses > 0 ? tMonth / nExpenses : 0;

    const catData = categories.map((cat: any) => ({
      ...cat,
      value: mExpenses.filter((e: any) => e.categoryId === cat.id).reduce((sum: number, e: any) => sum + e.amount, 0)
    })).filter((cat: any) => cat.value > 0);

    const uncategorizedExpenses = mExpenses.filter((e: any) => !categories.some((c: any) => c.id === e.categoryId));
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

    const cdTotal = mExpenses.filter((e: any) => e.paymentMethod === 'card').reduce((sum: number, e: any) => sum + e.amount, 0);
    const csTotal = mExpenses.filter((e: any) => e.paymentMethod === 'cash').reduce((sum: number, e: any) => sum + e.amount, 0);
    const mPayment = Math.max(cdTotal, csTotal, 1); // avoid div by 0

    const mItems = [...mExpenses, ...mLoans];

    return {
      monthExpenses: mExpenses,
      monthLoans: mLoans,
      totalMonth: tMonth,
      numExpenses: nExpenses,
      avgExpense: aExpense,
      categoryData: catData,
      chartTotal: cTotal,
      cardTotal: cdTotal,
      cashTotal: csTotal,
      maxPayment: mPayment,
      monthItems: mItems
    };
  }, [categories, expenses, loans, monthStr, viewDate]);

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
          <DonutChart data={categoryData} total={chartTotal} />
          {categoryData.length > 0 && (
            <div className="w-full mt-6 space-y-3">
              {categoryData.map((cat: any) => (
                <div key={cat.id} className="flex items-center justify-between text-sm gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-300 truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-gray-500 text-xs">
                      {((cat.value / chartTotal) * 100).toFixed(1)}%
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
          <div className="flex flex-col items-center gap-2 w-1/3 h-full">
            <div className="flex-1 w-full flex items-end justify-center">
              <div className="w-12 bg-blue-500 rounded-t-xl transition-all duration-500" style={{ height: `${(cardTotal / maxPayment) * 100}%`, minHeight: '4px' }} />
            </div>
            <span className="text-sm text-gray-400">Carta</span>
          </div>
          <div className="flex flex-col items-center gap-2 w-1/3 h-full">
            <div className="flex-1 w-full flex items-end justify-center">
              <div className="w-12 bg-green-500 rounded-t-xl transition-all duration-500" style={{ height: `${(cashTotal / maxPayment) * 100}%`, minHeight: '4px' }} />
            </div>
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

      <section className="space-y-6 pt-4">
        <h3 className="text-lg font-bold text-white mb-4">Dettaglio Attività</h3>
        {monthItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nessuna attività in questo mese</p>
        ) : (
          Object.entries(
            monthItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .reduce((groups: any, item: any) => {
                const date = item.date;
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(item);
                return groups;
              }, {})
          ).map(([date, items]: [string, any]) => {
            const [year, month, day] = date.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            let dateLabel = dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
            if (date === getLocalDateString(today)) {
              dateLabel = 'Oggi';
            } else if (date === getLocalDateString(yesterday)) {
              dateLabel = 'Ieri';
            }

            return (
              <div key={date} className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider sticky top-0 bg-[#000000]/80 backdrop-blur-md py-2 z-10">{dateLabel}</h4>
                {items.map((item: any) => {
                  const isLoan = 'type' in item;

                  if (isLoan) {
                    const isOwesMe = item.type === 'owes_me';
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4 group cursor-pointer hover:bg-[#2C2C2E] transition-colors ${item.isPaid ? 'opacity-50' : ''}`}
                        onClick={() => onEditLoan && onEditLoan(item)}
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-500/20 text-blue-500">
                          <Users size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">Prestito: {item.name}</div>
                          <div className="text-gray-400 text-xs truncate">
                            {isOwesMe ? 'Mi deve' : 'Devo a'} {item.isPaid ? '(Saldato)' : ''}
                          </div>
                        </div>
                        <div className="font-semibold text-white">
                          -{formatCurrency(item.amount)}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteLoanId(item.id);
                          }}
                          className="p-2 text-red-500 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-colors shrink-0"
                          aria-label="Elimina prestito"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  }

                  const cat = categories.find((c: any) => c.id === item.categoryId) || { name: 'Altro', color: '#8E8E93', icon: Users };
                  const Icon = cat.icon;
                  return (
                    <div 
                      key={item.id} 
                      className="bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4 group cursor-pointer hover:bg-[#2C2C2E] transition-colors"
                      onClick={() => !item.isProjected && onEditExpense && onEditExpense(item)}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                        {Icon && <Icon size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {cat.name} {item.isProjected && <span className="text-xs text-blue-400 ml-1">(Prevista)</span>}
                        </div>
                        <div className="text-gray-400 text-xs truncate">{item.note ? `${item.note}` : ''}</div>
                      </div>
                      <div className="text-white font-semibold">
                        -{formatCurrency(item.amount)}
                      </div>
                      {!item.isProjected && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteExpenseId(item.id);
                          }}
                          className="p-2 text-red-500 bg-red-500/10 rounded-full hover:bg-red-500/20 transition-colors shrink-0"
                          aria-label="Elimina spesa"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </section>

      <ConfirmModal 
        isOpen={!!deleteExpenseId}
        onClose={() => setDeleteExpenseId(null)}
        onConfirm={() => {
          if (deleteExpenseId) onDeleteExpense(deleteExpenseId);
        }}
        title="Elimina spesa"
        message="Sei sicuro di voler eliminare questa spesa? L'operazione non può essere annullata."
      />

      <ConfirmModal 
        isOpen={!!deleteLoanId}
        onClose={() => setDeleteLoanId(null)}
        onConfirm={() => {
          if (deleteLoanId) onDeleteLoan(deleteLoanId);
        }}
        title="Elimina prestito"
        message="Sei sicuro di voler eliminare questo prestito? L'operazione non può essere annullata."
      />
    </div>
  );
}
