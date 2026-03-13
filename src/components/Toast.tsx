import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Toast({ message, onClose }: { message: string, onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 fade-in duration-300">
      <div className="bg-[#2C2C2E] text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-3 border border-[#3A3A3C]">
        <CheckCircle2 size={20} className="text-[#30D158]" />
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
}
