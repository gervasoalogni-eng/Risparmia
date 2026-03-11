import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function CalendarModal({ isOpen, onClose, onSelect, initialDate }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (isOpen && initialDate) {
      setCurrentDate(new Date(initialDate));
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday first

  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const dayNames = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSelect = (day: number) => {
    const selected = new Date(year, month, day);
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, '0');
    const dd = String(selected.getDate()).padStart(2, '0');
    onSelect(`${yyyy}-${mm}-${dd}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
      <div className="bg-[#1C1C1E] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-[#2C2C2E]">
          <h3 className="text-lg font-semibold text-white">Seleziona Data</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-2 text-white"><ChevronLeft size={20} /></button>
            <div className="text-white font-medium">{monthNames[month]} {year}</div>
            <button onClick={handleNextMonth} className="p-2 text-white"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(d => <div key={d} className="text-center text-gray-500 text-sm">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              const isSelected = initialDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              return (
                <button
                  key={day}
                  onClick={() => handleSelect(day)}
                  className={`h-10 w-10 rounded-full flex items-center justify-center mx-auto text-sm transition-colors
                    ${isSelected ? 'bg-blue-500 text-white' : isToday ? 'bg-[#2C2C2E] text-white' : 'text-gray-300 hover:bg-[#2C2C2E]'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
