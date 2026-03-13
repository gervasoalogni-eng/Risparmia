import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, CreditCard, Banknote } from 'lucide-react';
import { getLocalDateString } from '../constants';
import { CalendarModal } from './CalendarModal';

export function AddExpenseModal({ isOpen, onClose, onSave, expenseToEdit, categories }: any) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState(categories?.[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [date, setDate] = useState(getLocalDateString());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setAmount(expenseToEdit.amount.toString().replace('.', ','));
        setNote(expenseToEdit.note || '');
        setCategoryId(expenseToEdit.categoryId);
        setPaymentMethod(expenseToEdit.paymentMethod);
        setDate(expenseToEdit.date);
      } else {
        setAmount('');
        setNote('');
        setCategoryId(categories?.[0]?.id || '');
        setPaymentMethod('card');
        setDate(getLocalDateString());
      }
    }
  }, [isOpen, expenseToEdit, categories]);

  if (!isOpen) return null;

  const handleSave = () => {
    const numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (!amount || isNaN(numAmount) || numAmount <= 0) return;
    
    onSave({
      id: expenseToEdit ? expenseToEdit.id : crypto.randomUUID(),
      amount: numAmount,
      note: note.trim(),
      categoryId,
      paymentMethod,
      date
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col justify-end">
      <div className="bg-[#1C1C1E] rounded-t-3xl w-full max-h-[90vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom-full duration-300">
        <div className="sticky top-0 bg-[#1C1C1E] flex justify-between items-center p-4 border-b border-[#2C2C2E] z-10 rounded-t-3xl">
          <button onClick={onClose} className="text-gray-400 p-2"><X size={24} /></button>
          <h2 className="text-white font-semibold text-lg">{expenseToEdit ? 'Modifica Spesa' : 'Nuova Spesa'}</h2>
          <button 
            onClick={handleSave} 
            className={`font-semibold p-2 ${amount && parseFloat(amount.replace(/\./g, '').replace(',', '.')) > 0 ? 'text-blue-500' : 'text-gray-500'}`}
            disabled={!amount || parseFloat(amount.replace(/\./g, '').replace(',', '.')) <= 0}
          >
            Salva
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Amount */}
          <div className="flex flex-col items-center">
            <div className="flex items-center text-5xl font-bold text-white">
              <span>€</span>
              <input 
                type="text" 
                inputMode="decimal"
                value={amount}
                onChange={e => {
                  let val = e.target.value.replace(/[^0-9.,]/g, '');
                  // Prevent multiple commas/dots
                  const commaCount = (val.match(/,/g) || []).length;
                  const dotCount = (val.match(/\./g) || []).length;
                  if (commaCount + dotCount > 1) {
                    return;
                  }
                  setAmount(val);
                }}
                placeholder="0,00"
                className="bg-transparent w-full outline-none ml-2 placeholder-gray-600"
                autoFocus
              />
            </div>
          </div>

          {/* Note */}
          <div className="bg-[#2C2C2E] rounded-xl p-3">
            <input 
              type="text" 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Nota (opzionale)"
              className="bg-transparent w-full text-white outline-none"
            />
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Categoria</h3>
            <div className="grid grid-cols-4 gap-4">
              {categories.map((cat: any) => {
                const Icon = cat.icon;
                const isSelected = categoryId === cat.id;
                return (
                  <button 
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-offset-[#1C1C1E]' : 'opacity-70'}`}
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color, '--tw-ring-color': cat.color } as any}
                    >
                      <Icon size={24} />
                    </div>
                    <span className={`text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}>{cat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="flex gap-4">
            <div className="flex-1 bg-[#2C2C2E] rounded-xl p-1 flex">
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${paymentMethod === 'card' ? 'bg-[#3A3A3C] text-white shadow' : 'text-gray-400'}`}
              >
                <CreditCard size={16} /> Carta
              </button>
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${paymentMethod === 'cash' ? 'bg-[#3A3A3C] text-white shadow' : 'text-gray-400'}`}
              >
                <Banknote size={16} /> Contanti
              </button>
            </div>
            <button 
              onClick={() => setIsCalendarOpen(true)}
              className="bg-[#2C2C2E] rounded-xl px-4 py-2 flex items-center justify-center gap-2 text-white text-sm"
            >
              <CalendarIcon size={16} />
              {date.split('-').reverse().join('/')}
            </button>
          </div>
        </div>
      </div>
      <CalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        onSelect={setDate} 
        initialDate={date} 
      />
    </div>
  );
}
