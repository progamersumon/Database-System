
import React, { useState, useEffect, useRef } from 'react';
import { AppTab, Transaction, SavingsGoal, SavingsRecord, BillRecord, BettingRecord, Reminder, User, LeaveRecord, LeaveType, PayrollProfile, SalaryIncrement } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import FinancialInfoView from './components/FinancialInfoView';
import PayrollInfoView from './components/PayrollInfoView';
import AttendanceView from './components/AttendanceView';
import LeaveInfoView from './components/LeaveInfoView';
import SavingsInfoView from './components/SavingsInfoView';
import BillInfoView from './components/BillInfoView';
import BettingInfoView from './components/BettingInfoView';
import SettingsView from './components/SettingsView';
import RemindersView from './components/RemindersView';
import AuthView from './components/AuthView';
import { Menu, X, Database, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App States
  const [language, setLanguage] = useState<'English' | 'বাংলা'>('English');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsRecords, setSavingsRecords] = useState<SavingsRecord[]>([]);
  const [billRecords, setBillRecords] = useState<BillRecord[]>([]);
  const [bettingRecords, setBettingRecords] = useState<BettingRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([]);
  const [leaveQuotas, setLeaveQuotas] = useState<LeaveType[]>([
    { id: 'casual', type: 'Casual Leave', total: 10, color: 'bg-amber-500' },
    { id: 'medical', type: 'Medical Leave', total: 14, color: 'bg-rose-500' },
    { id: 'annual', type: 'Annual Leave', total: 20, color: 'bg-blue-500' },
  ]);
  const [payrollProfile, setPayrollProfile] = useState<PayrollProfile>({
    name: 'Tanim Ahmed',
    role: 'Senior Developer',
    department: 'Engineering',
    employeeId: 'EMP-202409',
    imageUrl: 'https://picsum.photos/seed/tanim/200/200',
    grossSalary: 65000,
    baseDeduction: 2450,
    basicSalary: 41700,
    houseRent: 20850,
    medical: 750,
    conveyance: 450,
    food: 1250,
    attendanceBonus: 925,
    tiffinBillDays: 25,
    tiffinRate: 50,
    yearlyBonus: 43333,
    eidBonus: 41700
  });
  const [salaryHistory, setSalaryHistory] = useState<SalaryIncrement[]>([]);

  // 1. Initial Auth Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'User',
          imageUrl: session.user.user_metadata?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser({
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'User',
          imageUrl: session.user.user_metadata?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
        });
      } else {
        setCurrentUser(null);
        setHasFetchedInitialData(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Data Fetching from Supabase
  useEffect(() => {
    if (!currentUser || hasFetchedInitialData) return;

    const loadData = async () => {
      setIsLoadingData(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingData(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data?.payload) {
        const p = data.payload;
        if (p.transactions) setTransactions(p.transactions);
        if (p.savingsGoals) setSavingsGoals(p.savingsGoals);
        if (p.savingsRecords) setSavingsRecords(p.savingsRecords);
        if (p.billRecords) setBillRecords(p.billRecords);
        if (p.bettingRecords) setBettingRecords(p.bettingRecords);
        if (p.attendanceList) setAttendanceList(p.attendanceList);
        if (p.reminders) setReminders(p.reminders);
        if (p.language) setLanguage(p.language);
        if (p.leaveHistory) setLeaveHistory(p.leaveHistory);
        if (p.leaveQuotas) setLeaveQuotas(p.leaveQuotas);
        if (p.payrollProfile) setPayrollProfile(p.payrollProfile);
        if (p.salaryHistory) setSalaryHistory(p.salaryHistory);
      }
      
      setHasFetchedInitialData(true);
      setIsLoadingData(false);
    };

    loadData();
  }, [currentUser?.email, hasFetchedInitialData]);

  // 3. Data Sync to Supabase (Guarded)
  useEffect(() => {
    // CRITICAL: Only sync if we've successfully finished fetching initial data
    if (!currentUser || !hasFetchedInitialData || isLoadingData) return;

    const syncToCloud = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setIsSyncing(true);
      const payload = {
        transactions,
        savingsGoals,
        savingsRecords,
        billRecords,
        bettingRecords,
        attendanceList,
        reminders,
        language,
        leaveHistory,
        leaveQuotas,
        payrollProfile,
        salaryHistory,
        updated_at: new Date().toISOString()
      };

      try {
        await supabase.from('user_data').upsert({
          user_id: session.user.id,
          payload: payload
        }, { onConflict: 'user_id' });
      } catch (err) {
        console.error("Sync failed:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    const timer = setTimeout(syncToCloud, 2000); 
    return () => clearTimeout(timer);
  }, [
    transactions, savingsGoals, savingsRecords, billRecords, bettingRecords, 
    attendanceList, reminders, language, leaveHistory, leaveQuotas, 
    payrollProfile, salaryHistory, currentUser?.email, hasFetchedInitialData, isLoadingData
  ]);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const tx: Transaction = { ...newTx, id };
    setTransactions(prev => [...prev, tx]);
    return id;
  };

  const handleEditTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setHasFetchedInitialData(false);
    setActiveTab(AppTab.DASHBOARD);
  };

  if (!currentUser) {
    return <AuthView language={language} onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  // Global Hydration Screen
  if (isLoadingData && !hasFetchedInitialData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-purple-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-purple-600/20">
            <Database size={32} className="animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 size={18} className="animate-spin text-purple-600" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronizing Your Cloud Database...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} onSelectTab={handleTabChange} language={language} onLogout={handleLogout} />
      </div>

      <div className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className={`absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center p-4 border-b dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Database size={18} /></div>
              <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">DataFlow</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-400"><X size={20} /></button>
          </div>
          <Sidebar activeTab={activeTab} onSelectTab={handleTabChange} isMobile language={language} onLogout={handleLogout} />
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header 
          activeTab={activeTab} 
          onOpenMenu={() => setIsSidebarOpen(true)} 
          language={language}
          profile={currentUser}
        />
        {(isSyncing) && (
          <div className="absolute top-[56px] left-0 w-full h-0.5 bg-indigo-600/20 z-[60] overflow-hidden">
             <div className="w-full h-full bg-indigo-600 animate-[shimmer_2s_infinite]"></div>
          </div>
        )}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto w-full p-4 md:p-8 mt-0 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
             {activeTab === AppTab.DASHBOARD && (
               <DashboardView 
                 language={language} 
                 profile={currentUser} 
                 transactions={transactions} 
                 savingsGoals={savingsGoals}
                 attendanceList={attendanceList}
                 reminders={reminders}
               />
             )}
             {activeTab === AppTab.FINANCIAL && <FinancialInfoView transactions={transactions} onAdd={handleAddTransaction} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} />}
             {activeTab === AppTab.SALARY_INFO && (
               <PayrollInfoView 
                 profileData={payrollProfile} 
                 setProfileData={setPayrollProfile} 
                 salaryHistory={salaryHistory} 
                 setSalaryHistory={setSalaryHistory} 
               />
             )}
             {activeTab === AppTab.ATTENDANCE && <AttendanceView activitiesList={attendanceList} setActivitiesList={setAttendanceList} />}
             {activeTab === AppTab.LEAVE_INFO && (
               <LeaveInfoView 
                 leaveHistory={leaveHistory} 
                 setLeaveHistory={setLeaveHistory} 
                 leaveQuotas={leaveQuotas} 
                 setLeaveQuotas={setLeaveQuotas} 
               />
             )}
             {activeTab === AppTab.SAVINGS && (
               <SavingsInfoView 
                 goals={savingsGoals} 
                 records={savingsRecords} 
                 setGoals={setSavingsGoals} 
                 setRecords={setSavingsRecords}
                 onAddTransaction={handleAddTransaction}
                 onEditTransaction={handleEditTransaction}
                 onDeleteTransaction={handleDeleteTransaction}
               />
             )}
             {activeTab === AppTab.BILL && (
               <BillInfoView 
                 bills={billRecords} 
                 setBills={setBillRecords}
                 onAddTransaction={handleAddTransaction}
                 onEditTransaction={handleEditTransaction}
                 onDeleteTransaction={handleDeleteTransaction}
               />
             )}
             {activeTab === AppTab.BETTING && (
               <BettingInfoView 
                 records={bettingRecords} 
                 setRecords={setBettingRecords}
                 onAddTransaction={handleAddTransaction}
                 onEditTransaction={handleEditTransaction}
                 onDeleteTransaction={handleDeleteTransaction}
               />
             )}
             {activeTab === AppTab.SETTINGS && <SettingsView language={language} setLanguage={setLanguage} profile={currentUser} setProfile={setCurrentUser} onLogout={handleLogout} />}
             {activeTab === AppTab.REMINDERS && <RemindersView language={language} reminders={reminders} setReminders={setReminders} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
