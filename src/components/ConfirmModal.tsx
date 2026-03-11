import React from 'react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1C1C1E] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#2C2C2E] text-white font-medium active:scale-95 transition-transform"
          >
            Annulla
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium active:scale-95 transition-transform"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
}
