import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar as CalendarIcon, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { CalendarModal } from './CalendarModal';
import { getLocalDateString } from '../constants';

export function AddLoanModal({ isOpen, onClose, onSave, existingContacts }: any) {
  const [type, setType] = useState<'owes_me' | 'i_owe'>('owes_me');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType('owes_me');
      setAmount('');
      setName('');
      setDate(getLocalDateString());
      setShowDropdown(false);
    }
  }, [isOpen]);

  const filteredContacts = useMemo(() => {
    if (!name) return existingContacts;
    return existingContacts.filter((c: string) => c.toLowerCase().includes(name.toLowerCase()));
  }, [name, existingContacts]);

  if (!isOpen) return null;

  const handleSave = () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(numAmount) || numAmount <= 0 || !name.trim()) return;
    
    onSave({
      id: crypto.randomUUID(),
      type,
      name: name.trim(),
      amount: numAmount,
      date,
      isPaid: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col justify-end">
      <div className="bg-[#1C1C1E] rounded-t-3xl w-full max-h-[90vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom-full duration-300">
        <div className="sticky top-0 bg-[#1C1C1E] flex justify-between items-center p-4 border-b border-[#2C2C2E] z-10 rounded-t-3xl">
          <button onClick={onClose} className="text-gray-400 p-2"><X size={24} /></button>
          <h2 className="text-white font-semibold text-lg">Nuovo Prestito</h2>
          <button 
            onClick={handleSave} 
            className={`font-semibold p-2 ${amount && parseFloat(amount.replace(',', '.')) > 0 && name.trim() ? 'text-blue-500' : 'text-gray-500'}`}
            disabled={!amount || parseFloat(amount.replace(',', '.')) <= 0 || !name.trim()}
          >
            Salva
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Type Toggle */}
          <div className="bg-[#2C2C2E] rounded-xl p-1 flex">
            <button 
              onClick={() => setType('owes_me')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${type === 'owes_me' ? 'bg-[#30D158] text-black shadow' : 'text-gray-400'}`}
            >
              <ArrowDownRight size={18} /> Mi deve
            </button>
            <button 
              onClick={() => setType('i_owe')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${type === 'i_owe' ? 'bg-[#FF453A] text-white shadow' : 'text-gray-400'}`}
            >
              <ArrowUpRight size={18} /> Devo
            </button>
          </div>

          {/* Amount */}
          <div className="flex flex-col items-center pt-4">
            <div className="flex items-center text-5xl font-bold text-white">
              <span>€</span>
              <input 
                type="text" 
                inputMode="decimal"
                value={amount}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9.,]/g, '');
                  setAmount(val);
                }}
                placeholder="0,00"
                className="bg-transparent w-full outline-none ml-2 placeholder-gray-600"
              />
            </div>
          </div>

          {/* Name with Autocomplete */}
          <div className="relative">
            <div className="bg-[#2C2C2E] rounded-xl p-3">
              <input 
                type="text" 
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Nome contatto"
                className="bg-transparent w-full text-white outline-none"
              />
            </div>
            {showDropdown && filteredContacts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#2C2C2E] rounded-xl overflow-hidden z-20 shadow-xl border border-[#3A3A3C]">
                {filteredContacts.map((contact: string) => (
                  <button
                    key={contact}
                    className="w-full text-left px-4 py-3 text-white hover:bg-[#3A3A3C] border-b border-[#3A3A3C] last:border-0"
                    onClick={() => {
                      setName(contact);
                      setShowDropdown(false);
                    }}
                  >
                    {contact}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="w-full bg-[#2C2C2E] rounded-xl px-4 py-4 flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-3">
              <CalendarIcon size={20} className="text-gray-400" />
              <span>Data</span>
            </div>
            <span className="text-gray-400">{date.split('-').reverse().join('/')}</span>
          </button>
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
