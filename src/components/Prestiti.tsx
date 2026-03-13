import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../constants';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export function Prestiti({ loans, onTogglePaid, onDelete, onEdit }: any) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const owesMe = loans.filter((l: any) => l.type === 'owes_me');
  const iOwe = loans.filter((l: any) => l.type === 'i_owe');

  const totalOwesMe = owesMe.filter((l: any) => !l.isPaid).reduce((sum: number, l: any) => sum + l.amount, 0);
  const totalIOwe = iOwe.filter((l: any) => !l.isPaid).reduce((sum: number, l: any) => sum + l.amount, 0);
  const netTotal = totalOwesMe - totalIOwe;

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const renderLoanList = (list: any[], title: string, colorClass: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">{title}</h2>
        <div className="space-y-3">
          {list.map((loan: any) => (
            <div 
              key={loan.id} 
              onClick={() => onEdit && onEdit(loan)}
              className={`bg-[#1C1C1E] rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#2C2C2E] transition-colors ${loan.isPaid ? 'opacity-50' : ''}`}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePaid(loan.id);
                }}
                className={`shrink-0 ${loan.isPaid ? colorClass : 'text-gray-500'}`}
              >
                {loan.isPaid ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-white font-medium truncate ${loan.isPaid ? 'line-through text-gray-400' : ''}`}>{loan.name}</div>
                <div className="text-gray-400 text-xs">{formatDate(loan.date)}</div>
              </div>
              <div className={`font-semibold ${loan.isPaid ? 'text-gray-400 line-through' : colorClass}`}>
                {formatCurrency(loan.amount)}
              </div>
              <button 
                onClick={(e) => handleDeleteClick(loan.id, e)}
                className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors ml-2 shrink-0"
                aria-label="Elimina prestito"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-300">
      <header className="pt-4 mb-8">
        <h1 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Bilancio Netto</h1>
        <div className={`text-5xl font-bold tracking-tight ${netTotal >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
          {netTotal > 0 ? '+' : ''}{formatCurrency(netTotal)}
        </div>
      </header>

      {loans.length === 0 ? (
        <p className="text-gray-500 text-center py-10">Nessun prestito registrato</p>
      ) : (
        <>
          {renderLoanList(owesMe, 'Chi ti deve', 'text-[#30D158]')}
          {renderLoanList(iOwe, 'A chi devi', 'text-[#FF453A]')}
        </>
      )}

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDelete(deleteId);
        }}
        title="Elimina prestito"
        message="Sei sicuro di voler eliminare questo prestito? L'operazione non può essere annullata."
      />
    </div>
  );
}
