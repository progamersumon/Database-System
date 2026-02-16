
// Added React import to provide the React namespace for ReactNode in MenuItem interface
import React from 'react';

export enum AppTab {
  DASHBOARD = 'Dashboard',
  FINANCIAL = 'Financial Info',
  SALARY_INFO = 'Salary Info',
  ATTENDANCE = 'Attendance',
  LEAVE_INFO = 'Leave Info',
  SAVINGS = 'Savings Info',
  BILL = 'Bill Info',
  BETTING = 'Betting Info',
  REMINDERS = 'Reminders',
  SETTINGS = 'Settings'
}

export enum ViewType {
  DASHBOARD = 'Dashboard',
  FINANCIAL = 'Financial Info',
  PAYROLL = 'Payroll Info',
  SAVINGS = 'Savings Info',
  BILL = 'Bill Info',
  BETTING = 'Betting Info',
  REMINDERS = 'Reminders',
  SETTINGS = 'Settings'
}

export interface User {
  name: string;
  email: string;
  role: string;
  imageUrl: string;
  password?: string;
}

export interface MenuItem {
  id: AppTab;
  icon: React.ReactNode;
  label: string;
}

export interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
}

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Bonus', 'Investment', 'Other'],
  expense: ['Food', 'Rent', 'Bill', 'DPS', 'Home', 'Transport', 'Shopping', 'Medical', 'Others']
};

export interface AIInsight {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  maturityValue: number;
  color: string;
  plan: string;
  monthlyDeposit: number;
  years: number;
  profitPercent: number;
}

export interface SavingsRecord {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note: string;
  transactionId?: string;
}

export interface BillRecord {
  id: string;
  type: 'Electric' | 'Wifi';
  amount: number;
  date: string;
  note?: string;
  transactionId?: string;
}

export interface BettingRecord {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  note?: string;
  transactionId?: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  note?: string;
}

// Leave Management Types
export interface LeaveType {
  id: string;
  type: string;
  total: number;
  color: string;
}

export interface LeaveRecord {
  id: string;
  typeId: string;
  typeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedOn: string;
}

// Payroll Management Types
export interface PayrollProfile {
  name: string;
  role: string;
  department: string;
  employeeId: string;
  imageUrl: string;
  grossSalary: number;
  baseDeduction: number;
  basicSalary: number;
  houseRent: number;
  medical: number;
  conveyance: number;
  food: number;
  attendanceBonus: number;
  tiffinBillDays: number;
  tiffinRate: number;
  yearlyBonus: number;
  eidBonus: number;
}

export interface SalaryIncrement {
  id: string;
  year: number;
  inc: number;
  amt: number;
  total: number;
}
