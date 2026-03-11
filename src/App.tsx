import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, History, Users, Plus } from 'lucide-react';
import { Home } from './components/Home';
import { Storico } from './components/Storico';
import { Prestiti } from './components/Prestiti';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddLoanModal } from './components/AddLoanModal';
import { Expense, Loan } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'storico' | 'prestiti'>('home');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  // State
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('loans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('loans', JSON.stringify(loans));
  }, [loans]);

  const handleAddExpense = (expense: Expense) => setExpenses(prev => [expense, ...prev]);
  const handleDeleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));
  
  const handleAddLoan = (loan: Loan) => setLoans(prev => [loan, ...prev]);
  const handleToggleLoanPaid = (id: string) => setLoans(prev => prev.map(l => l.id === id ? { ...l, isPaid: !l.isPaid } : l));
  const handleDeleteLoan = (id: string) => setLoans(prev => prev.filter(l => l.id !== id));

  const existingContacts = Array.from(new Set(loans.map(l => l.name)));

  const handleFabClick = () => {
    if (activeTab === 'prestiti') {
      setIsLoanModalOpen(true);
    } else {
      setIsExpenseModalOpen(true);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30">
      <main className="max-w-md mx-auto relative min-h-screen">
        {activeTab === 'home' && <Home expenses={expenses} />}
        {activeTab === 'storico' && <Storico expenses={expenses} onDelete={handleDeleteExpense} />}
        {activeTab === 'prestiti' && <Prestiti loans={loans} onTogglePaid={handleToggleLoanPaid} onDelete={handleDeleteLoan} />}

        {/* FAB */}
        <button 
          onClick={handleFabClick}
          className="fixed bottom-24 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(10,132,255,0.4)] z-30"
          aria-label="Aggiungi"
        >
          <Plus size={28} className="text-white" />
        </button>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 w-full max-w-md bg-[#1C1C1E]/90 backdrop-blur-lg border-t border-[#2C2C2E] flex justify-around items-center h-20 pb-safe z-30">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 w-20 ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <HomeIcon size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('storico')}
            className={`flex flex-col items-center gap-1 w-20 ${activeTab === 'storico' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <History size={24} strokeWidth={activeTab === 'storico' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Storico</span>
          </button>
          <button 
            onClick={() => setActiveTab('prestiti')}
            className={`flex flex-col items-center gap-1 w-20 ${activeTab === 'prestiti' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Users size={24} strokeWidth={activeTab === 'prestiti' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Prestiti</span>
          </button>
        </nav>
      </main>

      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        onSave={handleAddExpense} 
      />
      
      <AddLoanModal 
        isOpen={isLoanModalOpen} 
        onClose={() => setIsLoanModalOpen(false)} 
        onSave={handleAddLoan}
        existingContacts={existingContacts}
      />
    </div>
  );
}
