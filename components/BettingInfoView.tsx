
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  X, 
  Save, 
  Trash2, 
  Pencil,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Dices,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { BettingRecord, Transaction } from '../types';

interface BettingInfoViewProps {
  records: BettingRecord[];
  setRecords: React.Dispatch<React.SetStateAction<BettingRecord[]>>;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const COLORS = {
  deposit: '#f43f5e', // Red/Rose for Deposit
  withdraw: '#10b981' // Green/Emerald for Withdraw
};

const BettingInfoView: React.FC<BettingInfoViewProps> = ({ 
  records, 
  setRecords,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<BettingRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<BettingRecord | null>(null);

  const [formData, setFormData] = useState({
    type: 'deposit' as 'deposit' | 'withdraw',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    const current = new Date().getFullYear().toString();
    years.add(current);
    records.forEach(r => {
      const year = r.date.split('-')[0];
      if (year) years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const stats = useMemo(() => {
    const yearRecords = records.filter(r => r.date.startsWith(selectedYear));
    const deposits = yearRecords.filter(r => r.type === 'deposit');
    const withdraws = yearRecords.filter(r => r.type === 'withdraw');

    const totalDeposit = deposits.reduce((sum, r) => sum + r.amount, 0);
    const totalWithdraw = withdraws.reduce((sum, r) => sum + r.amount, 0);

    // Distribution Data for Donut Chart
    const distributionData = [
      { name: 'DEPOSIT', value: totalDeposit, color: COLORS.deposit },
      { name: 'WITHDRAW', value: totalWithdraw, color: COLORS.withdraw }
    ].filter(item => item.value > 0);

    return {
      totalDeposit,
      totalWithdraw,
      netProfit: totalWithdraw - totalDeposit,
      deposits,
      withdraws,
      distributionData
    };
  }, [records, selectedYear]);

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
    const RADIAN = Math.PI / 180;
    
    const midRadius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + midRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + midRadius * Math.sin(-midAngle * RADIAN);
    
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 2) * cos;
    const sy = cy + (outerRadius + 2) * sin;
    const mx = cx + (outerRadius + 18) * cos;
    const my = cy + (outerRadius + 18) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 12;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor="middle" 
          dominantBaseline="central" 
          className="text-[11px] font-black pointer-events-none"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        
        <path 
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
          stroke="#94a3b8" 
          strokeWidth={1.5} 
          fill="none" 
        />
        
        <text 
          x={ex + (cos >= 0 ? 1 : -1) * 4} 
          y={ey} 
          textAnchor={textAnchor} 
          fill="#64748b" 
          dominantBaseline="central" 
          className="text-[10px] font-black tracking-widest uppercase"
        >
          {name}
        </text>
      </g>
    );
  };

  const handleSave = () => {
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) return;

    const txDescription = `Betting ${formData.type === 'deposit' ? 'Deposit' : 'Withdraw'} (${formData.note || 'Regular'})`;

    if (editingRecord) {
      // Sync update with Financial Info if it was a deposit or is becoming a deposit
      if (formData.type === 'deposit') {
        if (editingRecord.transactionId) {
          onEditTransaction({
            id: editingRecord.transactionId,
            type: 'expense',
            category: 'Others',
            amount: amt,
            date: formData.date,
            description: txDescription
          });
        } else {
          // If it was a withdraw (no tx) and now becomes a deposit, add it
          const transactionId = onAddTransaction({
            type: 'expense',
            category: 'Others',
            amount: amt,
            date: formData.date,
            description: txDescription
          });
          editingRecord.transactionId = transactionId;
        }
      } else {
        // If it was a deposit and now becomes a withdraw, remove the expense from financial info
        if (editingRecord.transactionId) {
          onDeleteTransaction(editingRecord.transactionId);
          editingRecord.transactionId = undefined;
        }
      }

      setRecords(prev => prev.map(r => r.id === editingRecord.id ? {
        ...r,
        type: formData.type,
        amount: amt,
        date: formData.date,
        note: formData.note,
        transactionId: editingRecord.transactionId
      } : r));
    } else {
      let transactionId: string | undefined;
      
      // If it's a deposit, sync to financial info
      if (formData.type === 'deposit') {
        transactionId = onAddTransaction({
          type: 'expense',
          category: 'Others',
          amount: amt,
          date: formData.date,
          description: txDescription
        });
      }

      const newRecord: BettingRecord = {
        id: Math.random().toString(36).substr(2, 9),
        type: formData.type,
        amount: amt,
        date: formData.date,
        note: formData.note,
        transactionId
      };
      setRecords(prev => [newRecord, ...prev]);
    }

    setIsModalOpen(false);
    setEditingRecord(null);
    setFormData({ type: 'deposit', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
  };

  const handleDelete = () => {
    if (recordToDelete) {
      if (recordToDelete.transactionId) {
        onDeleteTransaction(recordToDelete.transactionId);
      }
      setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleOpenEdit = (record: BettingRecord) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      amount: record.amount.toString(),
      date: record.date,
      note: record.note || ''
    });
    setIsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* Year Filter Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-slate-400" />
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">Filter Year:</span>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/30 rounded-lg px-3 py-1 text-[13px] font-black text-indigo-600 dark:text-indigo-400 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12 transition-transform group-hover:scale-110">
            <ArrowDownCircle size={80} />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Total Deposit</p>
          <h2 className="text-2xl font-black tracking-tight leading-none">৳{stats.totalDeposit.toLocaleString()}</h2>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12 transition-transform group-hover:scale-110">
            <ArrowUpCircle size={80} />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Total Withdraw</p>
          <h2 className="text-2xl font-black tracking-tight leading-none">৳{stats.totalWithdraw.toLocaleString()}</h2>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12 transition-transform group-hover:scale-110">
            <TrendingUp size={80} />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Net Profit</p>
          <h2 className="text-2xl font-black tracking-tight leading-none">৳{stats.netProfit.toLocaleString()}</h2>
        </div>
      </div>

      {/* One-Line Layout: Distribution | Deposit History | Withdraw History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Betting Distribution Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-[450px] flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <PieIcon size={16} className="text-indigo-600" /> Betting Distribution ({selectedYear})
            </h3>
          </div>
          <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-5">
            {stats.distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={stats.distributionData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={55} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value" 
                    stroke="none" 
                    labelLine={false} 
                    label={renderCustomizedLabel}
                  >
                    {stats.distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(value: number) => `৳${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[11px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest text-center">
                No data found
              </div>
            )}
          </div>
        </div>

        {/* Deposit History Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[450px]">
          <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 bg-rose-50/40 dark:bg-rose-900/20">
            <h3 className="text-[13px] font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <ArrowDownCircle size={14} className="text-rose-600" /> Deposit History
            </h3>
          </div>
          <div className="p-4 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
            {stats.deposits.length > 0 ? (
              stats.deposits.sort((a,b) => b.date.localeCompare(a.date)).map(record => (
                <div key={record.id} className="p-3 bg-rose-50/60 dark:bg-rose-900/30 border border-rose-200/50 dark:border-rose-800/50 rounded-xl flex items-center justify-between group hover:bg-rose-100/80 dark:hover:bg-rose-900/40 transition-all shadow-sm">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight truncate">{formatDate(record.date)}</span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 truncate">{record.note || 'No Note'}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12px] font-black text-rose-700 dark:text-rose-400 tracking-tight">৳{record.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEdit(record)} className="p-1.5 text-indigo-600 bg-white/80 dark:bg-slate-800 hover:bg-white rounded-lg shadow-sm border border-indigo-100/50 dark:border-slate-700 active:scale-95"><Pencil size={11} /></button>
                      <button onClick={() => { setRecordToDelete(record); setIsDeleteModalOpen(true); }} className="p-1.5 text-rose-600 bg-white/80 dark:bg-slate-800 hover:bg-white rounded-lg shadow-sm border border-rose-100/50 dark:border-slate-700 active:scale-95"><Trash2 size={11} /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center p-12 text-center opacity-30 italic">No deposits</div>
            )}
          </div>
        </div>

        {/* Withdraw History Column */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[450px]">
          <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-900/20">
            <h3 className="text-[13px] font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <ArrowUpCircle size={14} className="text-emerald-600" /> Withdraw History
            </h3>
          </div>
          <div className="p-4 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
            {stats.withdraws.length > 0 ? (
              stats.withdraws.sort((a,b) => b.date.localeCompare(a.date)).map(record => (
                <div key={record.id} className="p-3 bg-emerald-50/60 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl flex items-center justify-between group hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 transition-all shadow-sm">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight truncate">{formatDate(record.date)}</span>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 truncate">{record.note || 'No Note'}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 tracking-tight">৳{record.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEdit(record)} className="p-1.5 text-indigo-600 bg-white/80 dark:bg-slate-800 hover:bg-white rounded-lg shadow-sm border border-indigo-100/50 dark:border-slate-700 active:scale-95"><Pencil size={11} /></button>
                      <button onClick={() => { setRecordToDelete(record); setIsDeleteModalOpen(true); }} className="p-1.5 text-rose-600 bg-white/80 dark:bg-slate-800 hover:bg-white rounded-lg shadow-sm border border-rose-100/50 dark:border-slate-700 active:scale-95"><Trash2 size={11} /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center p-12 text-center opacity-30 italic">No withdrawals</div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 dark:border-slate-800">
              <h2 className="text-[18px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{editingRecord ? 'Edit Record' : 'Add Record'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingRecord(null); }} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl">
                  <button onClick={() => setFormData({...formData, type: 'deposit'})} className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all ${formData.type === 'deposit' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'text-slate-500 hover:text-slate-700'}`}>Deposit</button>
                  <button onClick={() => setFormData({...formData, type: 'withdraw'})} className={`py-2 text-[11px] font-black uppercase rounded-lg transition-all ${formData.type === 'withdraw' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-500 hover:text-slate-700'}`}>Withdraw</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (৳)</label>
                  <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0" className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[14px] font-black text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[12px] font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Note (Optional)</label>
                <input type="text" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} placeholder="e.g. Lineup: High" className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all" />
              </div>
              <button onClick={handleSave} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[14px] uppercase shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2">
                <Save size={18} /> {editingRecord ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-[300px] rounded-[32px] p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
            <h2 className="text-[16px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Remove Record?</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold tracking-tight">This will permanently delete this record and its associated expense entry (if it was a deposit).</p>
            <div className="flex gap-4">
              <button onClick={handleDelete} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl text-[12px] font-black uppercase hover:bg-rose-700 transition-colors">Delete</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[12px] font-black uppercase hover:bg-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => { setEditingRecord(null); setFormData({ type: 'deposit', amount: '', date: new Date().toISOString().split('T')[0], note: '' }); setIsModalOpen(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95 group shadow-blue-600/40"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  );
};

export default BettingInfoView;
