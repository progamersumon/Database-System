
import React, { useState, useMemo, useEffect } from 'react';
import { 
  PiggyBank, 
  Plus, 
  X, 
  Pencil, 
  Trash2, 
  Target,
  Save,
  History,
  Layers,
  Fingerprint,
  Percent,
  AlertTriangle
} from 'lucide-react';
import { SavingsGoal, SavingsRecord, Transaction } from '../types';

interface SavingsInfoViewProps {
  goals: SavingsGoal[];
  records: SavingsRecord[];
  setGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
  setRecords: React.Dispatch<React.SetStateAction<SavingsRecord[]>>;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const SavingsInfoView: React.FC<SavingsInfoViewProps> = ({ 
  goals, 
  records, 
  setGoals, 
  setRecords,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  
  const [isDeleteGoalConfirmOpen, setIsDeleteGoalConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [isDeleteRecordConfirmOpen, setIsDeleteRecordConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<SavingsRecord | null>(null);

  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [editingRecord, setEditingRecord] = useState<SavingsRecord | null>(null);

  const [goalForm, setGoalForm] = useState({
    name: '',
    monthlyDeposit: '', 
    years: '10',
    profitPercent: '8.5',
    targetAmount: '', 
    maturityValue: '', 
    color: '#6366f1'
  });

  const [recordForm, setRecordForm] = useState({
    goalId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    const P = parseFloat(goalForm.monthlyDeposit);
    const annualRate = parseFloat(goalForm.profitPercent);
    const yrs = parseFloat(goalForm.years);
    
    if (!isNaN(P) && !isNaN(annualRate) && !isNaN(yrs) && P > 0) {
      const totalPrincipal = P * 12 * yrs;
      const i = (annualRate / 100) / 12; 
      const n = yrs * 12; 
      const maturity = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      
      setGoalForm(prev => ({ 
        ...prev, 
        targetAmount: Math.round(totalPrincipal).toString(),
        maturityValue: Math.round(maturity).toString() 
      }));
    } else {
      setGoalForm(prev => ({ 
        ...prev, 
        targetAmount: '',
        maturityValue: '' 
      }));
    }
  }, [goalForm.monthlyDeposit, goalForm.profitPercent, goalForm.years]);

  const analytics = useMemo(() => {
    let totalDeposit = 0;
    let totalEstimatedProfit = 0;

    goals.forEach(goal => {
      const goalRecords = records.filter(r => r.goalId === goal.id);
      const goalDeposit = goalRecords.reduce((sum, r) => sum + r.amount, 0);
      totalDeposit += goalDeposit;

      if (goal.targetAmount > 0) {
        const totalExpectedProfit = goal.maturityValue - goal.targetAmount;
        const progress = goalDeposit / goal.targetAmount;
        totalEstimatedProfit += totalExpectedProfit * progress;
      }
    });

    return {
      deposit: totalDeposit,
      profit: totalEstimatedProfit,
      total: totalDeposit + totalEstimatedProfit,
    };
  }, [records, goals]);

  // Ensure latest transaction is at the top
  const sortedHistory = useMemo(() => {
    return [...records].sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  const handleSaveGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.monthlyDeposit) return;

    const targetVal = parseFloat(goalForm.targetAmount);
    const maturityVal = parseFloat(goalForm.maturityValue);
    const monthlyDepositVal = parseFloat(goalForm.monthlyDeposit);
    const yearsVal = parseFloat(goalForm.years);
    const profitVal = parseFloat(goalForm.profitPercent);

    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? {
        ...g,
        name: goalForm.name,
        plan: `৳${goalForm.monthlyDeposit}/Mo`,
        targetAmount: targetVal,
        maturityValue: maturityVal,
        color: goalForm.color,
        monthlyDeposit: monthlyDepositVal,
        years: yearsVal,
        profitPercent: profitVal
      } : g));
    } else {
      const newGoal: SavingsGoal = {
        id: Math.random().toString(36).substr(2, 9),
        name: goalForm.name,
        plan: `৳${goalForm.monthlyDeposit}/Mo`,
        targetAmount: targetVal,
        currentAmount: 0,
        maturityValue: maturityVal,
        color: goalForm.color,
        monthlyDeposit: monthlyDepositVal,
        years: yearsVal,
        profitPercent: profitVal
      };
      setGoals(prev => [...prev, newGoal]);
    }
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleSaveRecord = () => {
    const amt = parseFloat(recordForm.amount);
    if (!recordForm.goalId || isNaN(amt)) return;

    const selectedGoal = goals.find(g => g.id === recordForm.goalId);
    const description = `DPS Installment: ${selectedGoal?.name || 'Account'} (${recordForm.note || 'Regular'})`;

    if (editingRecord) {
      // Sync with Financial Transaction if linked
      if (editingRecord.transactionId) {
        onEditTransaction({
          id: editingRecord.transactionId,
          type: 'expense',
          category: 'DPS',
          amount: amt,
          date: recordForm.date,
          description: description
        });
      }

      const oldAmt = editingRecord.amount;
      const oldGoalId = editingRecord.goalId;
      const newGoalId = recordForm.goalId;

      setRecords(prev => prev.map(r => r.id === editingRecord.id ? {
        ...r,
        goalId: newGoalId,
        amount: amt,
        date: recordForm.date,
        note: recordForm.note
      } : r));
      
      setGoals(prev => prev.map(g => {
        if (g.id === newGoalId) {
          const diff = oldGoalId === newGoalId ? amt - oldAmt : amt;
          return { ...g, currentAmount: g.currentAmount + diff };
        }
        if (g.id === oldGoalId && newGoalId !== oldGoalId) {
          return { ...g, currentAmount: Math.max(0, g.currentAmount - oldAmt) };
        }
        return g;
      }));
    } else {
      // Create associated financial transaction
      const transactionId = onAddTransaction({
        type: 'expense',
        category: 'DPS',
        amount: amt,
        date: recordForm.date,
        description: description
      });

      const newRecord: SavingsRecord = {
        id: Math.random().toString(36).substr(2, 9),
        goalId: recordForm.goalId,
        amount: amt,
        date: recordForm.date,
        note: recordForm.note,
        transactionId
      };
      setRecords(prev => [newRecord, ...prev]);
      setGoals(prev => prev.map(g => g.id === recordForm.goalId ? { ...g, currentAmount: g.currentAmount + amt } : g));
    }
    setIsRecordModalOpen(false);
    setEditingRecord(null);
    setRecordForm({ goalId: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
  };

  const confirmDeleteRecord = () => {
    if (recordToDelete) {
      // Sync Delete with Financial Info
      if (recordToDelete.transactionId) {
        onDeleteTransaction(recordToDelete.transactionId);
      }
      setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      setGoals(prev => prev.map(g => g.id === recordToDelete.goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount - recordToDelete.amount) } : g));
      setIsDeleteRecordConfirmOpen(false);
      setRecordToDelete(null);
    }
  };

  const confirmDeleteGoal = () => {
    if (goalToDelete) {
      // Get all linked transactions to delete them too
      const linkedRecords = records.filter(r => r.goalId === goalToDelete);
      linkedRecords.forEach(r => {
        if (r.transactionId) onDeleteTransaction(r.transactionId);
      });

      setGoals(prev => prev.filter(g => g.id !== goalToDelete));
      setRecords(prev => prev.filter(r => r.goalId !== goalToDelete));
      setIsDeleteGoalConfirmOpen(false);
      setIsGoalModalOpen(false);
      setGoalToDelete(null);
      setEditingGoal(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTimePeriod = (totalMonths: number) => {
    const years = Math.floor(totalMonths / 12);
    const months = Math.round(totalMonths % 12);
    let result = '';
    if (years > 0) result += `${years} YEAR${years > 1 ? 'S' : ''} `;
    if (months > 0 || years === 0) result += `${months} MONTH${months > 1 ? 'S' : ''}`;
    return result.trim();
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full" /> Financial Assets
              </h3>
              <button 
                onClick={() => { 
                  setEditingGoal(null); 
                  setGoalForm({ name: '', monthlyDeposit: '', years: '10', targetAmount: '', profitPercent: '8.5', maturityValue: '', color: '#6366f1' }); 
                  setIsGoalModalOpen(true); 
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100 dark:border-indigo-800"
              >
                <Plus size={14} /> Initialize Account
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {goals.length > 0 ? goals.map(goal => (
                <div 
                  key={goal.id} 
                  className="aspect-[1.586/1] rounded-[24px] p-6 shadow-2xl relative overflow-hidden group transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-white/20 select-none"
                  style={{ 
                    background: `linear-gradient(135deg, ${goal.color} 0%, ${goal.color}aa 40%, ${goal.color}ff 100%)`,
                    boxShadow: `0 25px 50px -12px ${goal.color}55`
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-white/30 blur-[100px] rounded-full animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                  </div>

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] leading-none mb-1">Portfolio Account</p>
                        <h4 className="text-[16px] font-black text-white uppercase tracking-tight truncate max-w-[210px] drop-shadow-lg">{goal.name}</h4>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingGoal(goal); 
                            setGoalForm({ 
                              name: goal.name, 
                              monthlyDeposit: goal.monthlyDeposit ? goal.monthlyDeposit.toString() : goal.plan.replace('৳', '').replace('/Mo', ''), 
                              years: goal.years ? goal.years.toString() : '10', 
                              targetAmount: goal.targetAmount.toString(), 
                              profitPercent: goal.profitPercent ? goal.profitPercent.toString() : '8.5', 
                              maturityValue: goal.maturityValue.toString(), 
                              color: goal.color 
                            }); 
                            setIsGoalModalOpen(true); 
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 backdrop-blur-md"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-yellow-100 via-amber-400 to-yellow-500 shadow-inner flex items-center justify-center relative overflow-hidden border border-amber-200/50">
                        <div className="absolute inset-0 opacity-40">
                          <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
                        </div>
                        <div className="w-8 h-6 border-[0.5px] border-black/10 rounded-sm flex flex-wrap">
                          <div className="w-1/2 h-1/3 border-b border-r border-black/10" />
                          <div className="w-1/2 h-1/3 border-b border-black/10" />
                          <div className="w-1/2 h-1/3 border-b border-r border-black/10" />
                          <div className="w-1/2 h-1/3 border-b border-black/10" />
                          <div className="w-1/2 h-1/3 border-r border-black/10" />
                          <div className="w-1/2 h-1/3" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-mono font-black text-white/80 tracking-[0.15em] drop-shadow-md">
                          ••••  ••••  ••••  <span className="text-white">8842</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Net Savings</p>
                      <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-2xl">৳{goal.currentAmount.toLocaleString()}</h2>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">Maturity</p>
                          <p className="text-[12px] font-black text-white/90">৳{goal.maturityValue.toLocaleString()}</p>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div>
                          <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">Monthly</p>
                          <p className="text-[10px] font-black text-white/90 uppercase">{goal.plan}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <Layers size={22} className="text-white/30 group-hover:text-white/80 transition-all duration-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity">
                    <Fingerprint size={48} className="text-white" />
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                    <PiggyBank size={32} className="text-indigo-500 opacity-80" />
                  </div>
                  <div className="text-center px-4">
                    <span className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Portfolio is Empty</span>
                    <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-[240px]">Initialize your first account to start tracking wealth</p>
                    <button 
                      onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                      Initialize Asset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" /> Transaction History
              </h3>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-emerald-50 dark:bg-emerald-900/20">
                      <th className="px-6 py-2 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-2 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Asset Account</th>
                      <th className="px-6 py-2 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-2 text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sortedHistory.length > 0 ? sortedHistory.slice(0, 15).map(record => {
                      const goal = goals.find(g => g.id === record.goalId);
                      return (
                        <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                          <td className="px-6 py-2">
                            <span className="text-[12px] font-black text-slate-800 dark:text-white uppercase leading-none tracking-tight">{formatDate(record.date)}</span>
                          </td>
                          <td className="px-6 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: goal?.color || '#cbd5e1' }} />
                              <span className="text-[12px] font-black text-slate-700 dark:text-slate-300 uppercase truncate max-w-[200px] tracking-tight">{goal?.name || 'Deleted Account'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-2">
                            <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">৳{record.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => { setEditingRecord(record); setRecordForm({ goalId: record.goalId, amount: record.amount.toString(), date: record.date, note: record.note }); setIsRecordModalOpen(true); }} 
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all border border-transparent hover:border-indigo-100"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => { setRecordToDelete(record); setIsDeleteRecordConfirmOpen(true); }} 
                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all border border-transparent hover:border-rose-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="opacity-60 text-slate-400 dark:text-slate-500 flex flex-col items-center">
                            <History size={40} className="mb-3" />
                            <p className="text-[11px] font-black uppercase tracking-widest">No Recent Activity</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-900/80 rounded-full" /> TARGET PROGRESS
            </h3>
            <div className="space-y-6">
              {goals.length > 0 ? goals.map(goal => {
                const monthlyP = parseFloat(goal.plan.replace('৳', '').replace('/Mo', '')) || 1;
                const totalMonthsNeeded = Math.round(goal.targetAmount / monthlyP);
                const completedMonths = Math.min(Math.floor(goal.currentAmount / monthlyP), totalMonthsNeeded);
                const remainingMonths = Math.max(0, totalMonthsNeeded - completedMonths);
                const progressPercent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);

                return (
                  <div key={goal.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] p-5 shadow-sm relative overflow-hidden group hover:border-blue-400/30 transition-all">
                    <div className="absolute top-5 right-5">
                      <div className="px-3.5 py-1.5 bg-[#2563eb] text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-600/20">
                        {progressPercent}%
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-[18px] font-black text-[#1e293b] dark:text-white uppercase tracking-tight leading-tight">{goal.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {goal.years} YEARS PLAN • GOAL TARGETED
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">GOAL TARGET</p>
                        <h5 className="text-[14px] font-black text-blue-600 tracking-tight leading-none">৳{goal.targetAmount.toLocaleString()}</h5>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">MATURITY VALUE</p>
                        <h5 className="text-[14px] font-black text-emerald-500 tracking-tight leading-none">৳{goal.maturityValue.toLocaleString()}</h5>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">OVERALL PROGRESS</span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight">
                          {completedMonths} COMPLETE / {remainingMonths} REMAINING
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 bg-blue-600 shadow-sm" 
                          style={{ width: `${progressPercent}%` }} 
                        />
                      </div>

                      <div className="flex justify-between items-center px-1 pt-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">
                          COM- {formatTimePeriod(completedMonths)}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight text-right">
                          REM- {formatTimePeriod(remainingMonths)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30">
                  <Target size={32} className="mx-auto mb-3 text-slate-400 opacity-60" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-80">Track your goals here</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600 rounded-full" /> GROWTH SUMMARY
            </h3>
            <div className="space-y-3">
              <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 border-l-8 border-l-purple-500 rounded-2xl py-3.5 px-5 shadow-sm group hover:shadow-md transition-all">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">TOTAL PRINCIPAL</p>
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">৳{analytics.deposit.toLocaleString()}</h2>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 border-l-8 border-l-emerald-400 rounded-2xl py-3.5 px-5 shadow-sm group hover:shadow-md transition-all">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">ACCUMULATED PROFIT</p>
                <h2 className="text-xl font-black text-emerald-600 tracking-tighter leading-none">৳{Math.round(analytics.profit).toLocaleString()}</h2>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 border-l-8 border-l-blue-600 rounded-2xl py-3.5 px-5 shadow-sm group hover:shadow-md transition-all">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">NET WORTH ESTIMATION</p>
                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">৳{Math.round(analytics.total).toLocaleString()}</h2>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[440px] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 dark:border-slate-800">
              <h2 className="text-[18px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{editingGoal ? 'Configure Asset' : 'New Asset Account'}</h2>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-[1fr_80px] gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bank Name</label>
                  <input 
                    type="text" 
                    value={goalForm.name} 
                    onChange={(e) => setGoalForm({...goalForm, name: e.target.value})} 
                    placeholder="e.g. Dutch Bangla Savings" 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center">Color</label>
                  <div className="relative h-10">
                    <input type="color" value={goalForm.color} onChange={(e) => setGoalForm({...goalForm, color: e.target.value})} className="absolute inset-0 w-full h-full bg-transparent border-none outline-none cursor-pointer p-0 opacity-0 z-10" />
                    <div className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-transform active:scale-95" style={{ backgroundColor: goalForm.color }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[1.5fr_0.8fr_1fr] gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monthly Deposit</label>
                  <input 
                    type="number" 
                    value={goalForm.monthlyDeposit} 
                    onChange={(e) => setGoalForm({...goalForm, monthlyDeposit: e.target.value})} 
                    placeholder="0" 
                    className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center">Year</label>
                  <input 
                    type="number" 
                    step="1" 
                    value={goalForm.years} 
                    onChange={(e) => setGoalForm({...goalForm, years: e.target.value})} 
                    placeholder="10" 
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center">Profit %</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.1" 
                      value={goalForm.profitPercent} 
                      onChange={(e) => setGoalForm({...goalForm, profitPercent: e.target.value})} 
                      placeholder="8.5" 
                      className="w-full h-10 pl-4 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-sm" 
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Percent size={12} /></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Total (৳)</label>
                  <input 
                    type="number" 
                    value={goalForm.targetAmount} 
                    readOnly
                    placeholder="-"
                    className="w-full h-10 px-4 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl text-[13px] font-black text-indigo-700 dark:text-indigo-400 outline-none cursor-default shadow-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Maturity (Est.)</label>
                  <input 
                    type="number" 
                    value={goalForm.maturityValue} 
                    readOnly 
                    placeholder="-" 
                    className="w-full h-10 px-4 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl text-[13px] font-black text-emerald-700 dark:text-emerald-400 outline-none cursor-default shadow-sm" 
                  />
                </div>
              </div>

              {editingGoal && (
                <button onClick={() => { setGoalToDelete(editingGoal.id); setIsDeleteGoalConfirmOpen(true); }} className="w-full flex items-center justify-center gap-2 py-2 text-rose-500 text-[10px] font-black uppercase hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                  <Trash2 size={12} /> Delete Account
                </button>
              )}
              <button 
                onClick={handleSaveGoal} 
                className={`w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[14px] uppercase shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 ${(!goalForm.name || !goalForm.monthlyDeposit) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save size={18} /> {editingGoal ? 'Confirm Update' : 'Initialize Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isRecordModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 dark:border-slate-800">
              <h2 className="text-[18px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{editingRecord ? 'Update Record' : 'Record Deposit'}</h2>
              <button onClick={() => { setIsRecordModalOpen(false); setEditingRecord(null); }} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Destination Account</label>
                <select value={recordForm.goalId} onChange={(e) => setRecordForm({...recordForm, goalId: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-bold text-slate-900 dark:text-white outline-none cursor-pointer">
                  <option value="">Select Account</option>
                  {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deposit (৳)</label>
                  <input type="number" value={recordForm.amount} onChange={(e) => setRecordForm({...recordForm, amount: e.target.value})} placeholder="5,000" className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date Paid</label>
                  <input type="date" value={recordForm.date} onChange={(e) => setRecordForm({...recordForm, date: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[12px] font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transaction Note</label>
                <input type="text" value={recordForm.note} onChange={(e) => setRecordForm({...recordForm, note: e.target.value})} placeholder="e.g. Feb installment" className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all" />
              </div>
              <button onClick={handleSaveRecord} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[14px] uppercase shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
                {editingRecord ? <Save size={18} /> : <Plus size={18} />} 
                {editingRecord ? 'Update Transaction' : 'Record Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteGoalConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[320px] rounded-[32px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-700/50 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Destroy Account?</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">Warning: This will permanently delete the bank account and all its historical records. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={confirmDeleteGoal} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20">Delete</button>
              <button onClick={() => { setIsDeleteGoalConfirmOpen(false); setGoalToDelete(null); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[12px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteRecordConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[320px] rounded-[32px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-700/50 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Remove Record?</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">This installment will be removed from history and your current balance will be adjusted accordingly.</p>
            <div className="flex gap-3">
              <button onClick={confirmDeleteRecord} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20">Delete</button>
              <button onClick={() => { setIsDeleteRecordConfirmOpen(false); setRecordToDelete(null); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[12px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => { setEditingRecord(null); setRecordForm({ goalId: goals[0]?.id || '', amount: '', date: new Date().toISOString().split('T')[0], note: '' }); setIsRecordModalOpen(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95 group shadow-indigo-600/30"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  );
};

export default SavingsInfoView;
