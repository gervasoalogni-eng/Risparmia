import React, { useState, useEffect, useCallback } from 'react';
import { Home as HomeIcon, History, Users, Plus, Settings as SettingsIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { Home } from './components/Home';
import { Storico } from './components/Storico';
import { Prestiti } from './components/Prestiti';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddLoanModal } from './components/AddLoanModal';
import { Settings } from './components/Settings';
import { Toast } from './components/Toast';
import { Expense, Loan, Category } from './types';
import { getLocalDateString, CATEGORIES as defaultCategories } from './constants';

// Optimized: Only processes recurring expenses once on mount and when expenses change
const processRecurringExpenses = (currentExpenses: Expense[]): { expenses: Expense[]; hasChanges: boolean } => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  let newExpenses: Expense[] = [];
  let hasChanges = false;

  // Migrate old 'abbonamenti' to 'ricorrente' (one-time migration)
  const migratedExpenses = currentExpenses.map(e => {
    if (e.categoryId === 'abbonamenti') {
      hasChanges = true;
      return { ...e, categoryId: 'ricorrente' };
    }
    return e;
  });

  // Find all recurring expenses
  const recurringExpenses = migratedExpenses.filter(e => e.categoryId === 'ricorrente');

  // Group by note ONLY to find the latest date for each recurring item
  const recurringGroups = new Map<string, Expense>();
  
  recurringExpenses.forEach(e => {
    const key = e.note.trim().toLowerCase();
    if (!key) return;
    const existing = recurringGroups.get(key);
    if (!existing || new Date(e.date) > new Date(existing.date)) {
      recurringGroups.set(key, e);
    }
  });

  // For each latest recurring expense, check if we need to add new ones for current/past months
  recurringGroups.forEach(latestExpense => {
    const latestDate = new Date(latestExpense.date);
    const originalDay = latestDate.getDate();
    let targetMonth = latestDate.getMonth() + 1;
    let targetYear = latestDate.getFullYear();

    while (targetYear < currentYear || (targetYear === currentYear && targetMonth <= currentMonth)) {
      const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const targetDay = Math.min(originalDay, daysInTargetMonth);
      
      const newDate = new Date(targetYear, targetMonth, targetDay);
      const newDateString = getLocalDateString(newDate);

      if (latestExpense.stoppedDate && newDateString >= latestExpense.stoppedDate) {
        break;
      }

      if (newDateString <= getLocalDateString(now)) {
        newExpenses.push({
          ...latestExpense,
          id: uuidv4(),
          date: newDateString
        });
        hasChanges = true;
      } else {
        break;
      }

      targetMonth++;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear++;
      }
    }
  });

  if (hasChanges) {
    return { 
      expenses: [...newExpenses, ...migratedExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      hasChanges: true
    };
  }
  return { expenses: currentExpenses, hasChanges: false };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'storico' | 'prestiti' | 'settings'>('home');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [loanToEdit, setLoanToEdit] = useState<Loan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((cat: Category) => ({
        ...cat,
        icon: cat.iconName ? (Icons as any)[cat.iconName] : defaultCategories.find(c => c.id === cat.id)?.icon || Icons.Tag
      }));
    }
    return defaultCategories;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    const parsed = saved ? JSON.parse(saved) : [];
    const result = processRecurringExpenses(parsed);
    return result.hasChanges ? result.expenses : parsed;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('loans');
    return saved ? JSON.parse(saved) : [];
  });

  // Only run recurring expense processing once on mount, not on every render
  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      const parsed = JSON.parse(saved);
      const result = processRecurringExpenses(parsed);
      if (result.hasChanges) {
        setExpenses(result.expenses);
        localStorage.setItem('expenses', JSON.stringify(result.expenses));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => {
      const exists = prev.find(e => e.id === expense.id);
      if (exists) {
        return prev.map(e => e.id === expense.id ? expense : e);
      }
      return [expense, ...prev];
    });
    showToast(expenseToEdit ? 'Spesa modificata!' : 'Spesa aggiunta!');
  };
  
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => {
      const expenseToDelete = prev.find(e => e.id === id);
      if (expenseToDelete?.categoryId === 'ricorrente') {
        const note = expenseToDelete.note.trim().toLowerCase();
        return prev.filter(e => e.id !== id).map(e => {
          if (e.categoryId === 'ricorrente' && e.note.trim().toLowerCase() === note) {
            // Set stoppedDate to the date of the deleted expense to stop future projections
            return { ...e, stoppedDate: expenseToDelete.date };
          }
          return e;
        });
      }
      return prev.filter(e => e.id !== id);
    });
    showToast('Spesa eliminata!');
  };
  
  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setTimeout(() => setExpenseToEdit(null), 300); // clear after animation
  };

  const handleAddLoan = (loan: Loan) => {
    setLoans(prev => {
      const exists = prev.find(l => l.id === loan.id);
      if (exists) {
        return prev.map(l => l.id === loan.id ? loan : l);
      }
      return [loan, ...prev];
    });
    showToast(loanToEdit ? 'Prestito modificato!' : 'Prestito aggiunto!');
  };

  const handleEditLoan = (loan: Loan) => {
    setLoanToEdit(loan);
    setIsLoanModalOpen(true);
  };

  const handleCloseLoanModal = () => {
    setIsLoanModalOpen(false);
    setTimeout(() => setLoanToEdit(null), 300);
  };

  const handleToggleLoanPaid = (id: string) => {
    setLoans(prev => prev.map(l => {
      if (l.id === id) {
        const willBePaid = !l.isPaid;
        showToast(willBePaid ? 'Prestito saldato!' : 'Prestito riaperto!');
        return { 
          ...l, 
          isPaid: willBePaid,
          paidDate: willBePaid ? getLocalDateString() : undefined
        };
      }
      return l;
    }));
  };
  
  const handleDeleteLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    showToast('Prestito eliminato!');
  };

  const existingContacts = Array.from(new Set(loans.map(l => l.name)));

  const handleFabClick = () => {
    if (activeTab === 'prestiti') {
      setLoanToEdit(null);
      setIsLoanModalOpen(true);
    } else {
      setExpenseToEdit(null);
      setIsExpenseModalOpen(true);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30">
      <main className="max-w-md mx-auto relative min-h-screen">
        {activeTab === 'home' && <Home categories={categories} expenses={expenses} loans={loans} onEditExpense={handleEditExpense} onEditLoan={handleEditLoan} />}
        {activeTab === 'storico' && <Storico categories={categories} expenses={expenses} loans={loans} onDeleteExpense={handleDeleteExpense} onDeleteLoan={handleDeleteLoan} onEditExpense={handleEditExpense} onEditLoan={handleEditLoan} />}
        {activeTab === 'prestiti' && <Prestiti loans={loans} onTogglePaid={handleToggleLoanPaid} onDelete={handleDeleteLoan} onEdit={handleEditLoan} />}
        {activeTab === 'settings' && <Settings categories={categories} setCategories={setCategories} expenses={expenses} setExpenses={setExpenses} loans={loans} setLoans={setLoans} showToast={showToast} />}

        {/* FAB */}
        <motion.button 
          drag
          dragConstraints={typeof window !== 'undefined' ? { left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 160, bottom: 0 } : undefined}
          dragElastic={0.1}
          dragMomentum={false}
          onClick={handleFabClick}
          className={`fixed bottom-24 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 active:scale-95 transition-colors rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(10,132,255,0.4)] z-30 ${activeTab === 'settings' ? 'hidden' : ''}`}
          aria-label="Aggiungi"
        >
          <Plus size={28} className="text-white" />
        </motion.button>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 w-full max-w-md bg-[#1C1C1E]/90 backdrop-blur-lg border-t border-[#2C2C2E] flex justify-around items-center h-20 pb-safe z-30">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <HomeIcon size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('storico')}
            className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'storico' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <History size={24} strokeWidth={activeTab === 'storico' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Storico</span>
          </button>
          <button 
            onClick={() => setActiveTab('prestiti')}
            className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'prestiti' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Users size={24} strokeWidth={activeTab === 'prestiti' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Prestiti</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'settings' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <SettingsIcon size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Impostazioni</span>
          </button>
        </nav>
      </main>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={handleCloseExpenseModal} 
        onSave={handleAddExpense} 
        expenseToEdit={expenseToEdit}
        categories={categories}
      />
      
      <AddLoanModal 
        isOpen={isLoanModalOpen} 
        onClose={handleCloseLoanModal} 
        onSave={handleAddLoan}
        existingContacts={existingContacts}
        loanToEdit={loanToEdit}
      />
    </div>
  );
}
