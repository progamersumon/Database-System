
import React, { useState } from 'react';
import { Menu, Search, Sun, Moon, ChevronDown } from 'lucide-react';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  onOpenMenu: () => void;
  language?: 'English' | 'বাংলা';
  profile: {
    name: string;
    role: string;
    imageUrl: string;
  };
}

const Header: React.FC<HeaderProps> = ({ activeTab, onOpenMenu, language = 'English', profile }) => {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const translations = {
    English: {
      [AppTab.DASHBOARD]: 'Dashboard',
      [AppTab.FINANCIAL]: 'Financial Info',
      [AppTab.SALARY_INFO]: 'Salary Info',
      [AppTab.ATTENDANCE]: 'Attendance',
      [AppTab.LEAVE_INFO]: 'Leave Info',
      [AppTab.SAVINGS]: 'Savings Info',
      [AppTab.BILL]: 'Bill Info',
      [AppTab.BETTING]: 'Betting Info',
      [AppTab.REMINDERS]: 'Reminders',
      [AppTab.SETTINGS]: 'Settings',
      search: 'Search resources...',
      plan: 'Premium Plan'
    },
    'বাংলা': {
      [AppTab.DASHBOARD]: 'ড্যাশবোর্ড',
      [AppTab.FINANCIAL]: 'আর্থিক তথ্য',
      [AppTab.SALARY_INFO]: 'বেতন তথ্য',
      [AppTab.ATTENDANCE]: 'উপস্থিতি',
      [AppTab.LEAVE_INFO]: 'ছুটির তথ্য',
      [AppTab.SAVINGS]: 'সঞ্চয় তথ্য',
      [AppTab.BILL]: 'বিল তথ্য',
      [AppTab.BETTING]: 'বেটিং তথ্য',
      [AppTab.REMINDERS]: 'অনুস্মারক',
      [AppTab.SETTINGS]: 'সেটিংস',
      search: 'অনুসন্ধান করুন...',
      plan: 'প্রিমিয়াম প্ল্যান'
    }
  };

  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 h-14 w-full flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm shrink-0 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <button 
          onClick={onOpenMenu}
          className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md md:hidden shrink-0"
        >
          <Menu size={20} />
        </button>
        
        {/* Active Tab Title with left outline */}
        <div className="border-l-[3px] border-indigo-600 pl-4 py-1 ml-1">
          <h1 className="text-sm md:text-base font-black text-gray-900 dark:text-gray-100 truncate uppercase tracking-tight">
            {t[activeTab]}
          </h1>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-2 hidden xs:block"></div>
        
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder={t.search} 
            className="pl-10 pr-4 py-1.5 w-48 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"
        >
          {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-slate-800 cursor-pointer group">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{profile.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{t.plan}</p>
          </div>
          <img 
            src={profile.imageUrl} 
            alt="Profile" 
            className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-100 dark:ring-slate-800 group-hover:scale-105 transition-transform"
          />
          <ChevronDown size={14} className="text-gray-400 hidden xs:block" />
        </div>
      </div>
    </header>
  );
};

export default Header;
