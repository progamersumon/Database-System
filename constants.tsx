
import React from 'react';
import { 
  BarChart3, 
  CreditCard, 
  PiggyBank, 
  Receipt, 
  Dices, 
  Bell, 
  Settings,
  LogOut 
} from 'lucide-react';
import { ViewType, NavItem } from './types';

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: ViewType.FINANCIAL, label: 'Financial Info', icon: 'BarChart3' },
  { id: ViewType.PAYROLL, label: 'Payroll Info', icon: 'CreditCard' },
  { id: ViewType.SAVINGS, label: 'Savings Info', icon: 'PiggyBank' },
  { id: ViewType.BILL, label: 'Bill Info', icon: 'Receipt' },
  { id: ViewType.BETTING, label: 'Betting Info', icon: 'Dices' },
  { id: ViewType.REMINDERS, label: 'Reminders', icon: 'Bell' },
  { id: ViewType.SETTINGS, label: 'Settings', icon: 'Settings' },
];

export const ICON_MAP: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 size={20} />,
  CreditCard: <CreditCard size={20} />,
  PiggyBank: <PiggyBank size={20} />,
  Receipt: <Receipt size={20} />,
  Dices: <Dices size={20} />,
  Bell: <Bell size={20} />,
  Settings: <Settings size={20} />,
  LogOut: <LogOut size={20} />,
};
