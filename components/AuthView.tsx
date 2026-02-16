
import React, { useState, useEffect } from 'react';
import { User as UserIcon, Lock, Mail, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
  language: 'English' | 'বাংলা';
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASS_NEW' | 'FORGOT_PASS_EMAIL' | 'FORGOT_PASS_OTP';

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, language }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  });

  const translations = {
    English: {
      welcome: 'Welcome Back!',
      welcomeSub: 'Keep your data organized and your business running smoothly with our advanced management system.',
      loginTitle: 'User Login',
      signupTitle: 'Create Account',
      forgotTitle: 'Reset Password',
      otpTitle: 'Verify OTP',
      username: 'Email Id',
      password: 'Password',
      newPassword: 'New Password',
      email: 'Email Id',
      name: 'Full Name',
      otp: 'Enter OTP',
      actionLogin: 'Login',
      actionRegister: 'Sign Up',
      actionNext: 'Next',
      actionSendOtp: 'Send OTP',
      actionVerify: 'Verify & Change',
      forgot: 'Forgot your password?',
      switchRegister: "Don't have an account? Sign up",
      switchLogin: 'Already have an account? Login',
      backToLogin: 'Back to Login',
      otpSent: 'An OTP has been sent to your email.',
      success: 'Password changed successfully!',
      signupSuccess: 'Account created successfully!',
      loginError: 'Incorrect Email Id or Password',
      genericError: 'Something went wrong. Please try again.'
    },
    'বাংলা': {
      welcome: 'ফিরে আসায় স্বাগতম!',
      welcomeSub: 'আমাদের উন্নত ম্যানেজমেন্ট সিস্টেমের মাধ্যমে আপনার ডেটা সংগঠিত রাখুন এবং ব্যবসা পরিচালনা করুন নির্বিঘ্নে।',
      loginTitle: 'ইউজার লগইন',
      signupTitle: 'অ্যাকাউন্ট তৈরি করুন',
      forgotTitle: 'পাসওয়ার্ড রিসেট',
      otpTitle: 'ওটিপি যাচাই',
      username: 'ইমেইল আইডি',
      password: 'পাসওয়ার্ড',
      newPassword: 'নতুন পাসওয়ার্ড',
      email: 'ইমেইল আইডি',
      name: 'পুরো নাম',
      otp: 'ওটিপি লিখুন',
      actionLogin: 'লগইন',
      actionRegister: 'সাইন আপ',
      actionNext: 'পরবর্তী',
      actionSendOtp: 'ওটিপি পাঠান',
      actionVerify: 'যাচাই ও পরিবর্তন',
      forgot: 'পাসওয়ার্ড ভুলে গেছেন?',
      switchRegister: 'অ্যাকাউন্ট নেই? সাইন আপ করুন',
      switchLogin: 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন',
      backToLogin: 'লগইনে ফিরে যান',
      otpSent: 'আপনার ইমেইলে একটি ওটিপি পাঠানো হয়েছে।',
      success: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!',
      signupSuccess: 'একাউন্ট ক্রিয়েট সাকসেসফুলি',
      loginError: 'ইমেইল বা পাসওয়ার্ড ভুল',
      genericError: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  useEffect(() => {
    if (showErrorToast) {
      const timer = setTimeout(() => setShowErrorToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'LOGIN') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          const userToLogin: User = {
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: data.user.user_metadata?.role || 'User',
            imageUrl: data.user.user_metadata?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`
          };
          onAuthSuccess(userToLogin);
        }
      } else if (mode === 'SIGNUP') {
        // Use shared config for temp supabase client
        const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, { 
          auth: { persistSession: false, autoRefreshToken: false } 
        });

        const { error } = await tempSupabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: 'User',
              imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
            }
          }
        });

        if (error) throw error;

        setShowSuccessToast(true);
        setFormData(prev => ({ ...prev, password: '' }));
        setMode('LOGIN');
      } else if (mode === 'FORGOT_PASS_EMAIL') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
        if (error) throw error;
        alert(t.otpSent);
        setMode('LOGIN');
      }
    } catch (err: any) {
      console.error('Auth Error:', err.message);
      setErrorMessage(err.message || t.genericError);
      setShowErrorToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputs = () => {
    switch (mode) {
      case 'LOGIN':
        return (
          <>
            <div className="relative group">
              <label className="absolute -top-3 left-6 bg-white px-2 text-[12px] font-black text-[#0099FF] uppercase tracking-wider z-10">
                {t.email}
              </label>
              <div className="relative flex items-center border-2 border-[#0099FF]/40 rounded-[20px] bg-white px-6 h-[48px] focus-within:border-[#0099FF] transition-all">
                <Mail size={18} className="text-[#0099FF] mr-4 opacity-80" strokeWidth={1.5} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="user@example.com"
                  className="w-full bg-transparent text-[14px] font-bold text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative group">
                <label className="absolute -top-3 left-6 bg-white px-2 text-[12px] font-black text-[#0099FF] uppercase tracking-wider z-10">
                  {t.password}
                </label>
                <div className="relative flex items-center border-2 border-[#0099FF]/40 rounded-[20px] bg-white px-6 h-[48px] focus-within:border-[#0099FF] transition-all">
                  <Lock size={18} className="text-[#0099FF] mr-4 opacity-80" strokeWidth={1.5} />
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••••••••••"
                    className="w-full bg-transparent text-[14px] font-bold text-slate-700 outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div className="flex justify-end pr-2">
                <button 
                  type="button" 
                  onClick={() => setMode('FORGOT_PASS_EMAIL')}
                  className="text-[11px] italic font-medium text-slate-400 hover:text-[#0099FF] transition-colors"
                >
                  {t.forgot}
                </button>
              </div>
            </div>
          </>
        );
      case 'SIGNUP':
        return (
          <>
            <div className="relative group">
              <label className="absolute -top-3 left-6 bg-white px-2 text-[12px] font-black text-[#0099FF] uppercase tracking-wider z-10">
                {t.name}
              </label>
              <div className="relative flex items-center border-2 border-[#0099FF]/40 rounded-[20px] bg-white px-6 h-[48px] focus-within:border-[#0099FF] transition-all">
                <UserIcon size={18} className="text-[#0099FF] mr-4 opacity-80" strokeWidth={1.5} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  className="w-full bg-transparent text-[14px] font-bold text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            </div>
            <div className="relative group">
              <label className="absolute -top-3 left-6 bg-white px-2 text-[12px] font-black text-[#0099FF] uppercase tracking-wider z-10">
                {t.email}
              </label>
              <div className="relative flex items-center border-2 border-[#0099FF]/40 rounded-[20px] bg-white px-6 h-[48px] focus-within:border-[#0099FF] transition-all">
                <Mail size={18} className="text-[#0099FF] mr-4 opacity-80" strokeWidth={1.5} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="user@example.com"
                  className="w-full bg-transparent text-[14px] font-bold text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            </div>
            <div className="relative group">
              <label className="absolute -top-3 left-6 bg-white px-2 text-[12px] font-black text-[#0099FF] uppercase tracking-wider z-10">
                {t.password}
              </label>
              <div className="relative flex items-center border-2 border-[#0099FF]/40 rounded-[20px] bg-white px-6 h-[48px] focus-within:border-[#0099FF] transition-all">
                <Lock size={18} className="text-[#0099FF] mr-4 opacity-80" strokeWidth={1.5} />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••••••••••"
                  className="w-full bg-transparent text-[14px] font-bold text-slate-700 outline-none placeholder:text-slate-300"
                />
              </div>
            </div>
          </>
        );
      case 'FORGOT_PASS_EMAIL':
        return (
          <div className="relative group">
            <label className="absolute -top-3 left-6 bg-white px-2 text-[12px] font-black text-[#0099FF] uppercase tracking-wider z-10">
              {t.email}
            </label>
            <div className="relative flex items-center border-2 border-[#0099FF]/40 rounded-[20px] bg-white px-6 h-[48px] focus-within:border-[#0099FF] transition-all">
              <Mail size={18} className="text-[#0099FF] mr-4 opacity-80" strokeWidth={1.5} />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter registered email"
                className="w-full bg-transparent text-[14px] font-bold text-slate-700 outline-none placeholder:text-slate-300"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (mode === 'LOGIN') return t.loginTitle;
    if (mode === 'SIGNUP') return t.signupTitle;
    return t.forgotTitle;
  };

  const getButtonText = () => {
    if (isLoading) return '...';
    if (mode === 'LOGIN') return t.actionLogin;
    if (mode === 'SIGNUP') return t.actionRegister;
    if (mode === 'FORGOT_PASS_EMAIL') return t.actionSendOtp;
    return t.actionNext;
  };

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row bg-white font-sans overflow-hidden">
      {/* SUCCESS TOAST */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-[200] transition-all duration-500 transform translate-y-0 opacity-100">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-[20px] shadow-2xl flex items-center gap-3 border border-white/20">
            <CheckCircle size={24} />
            <span className="text-[12px] font-black uppercase tracking-wider">{t.signupSuccess}</span>
          </div>
        </div>
      )}

      {/* ERROR TOAST */}
      {showErrorToast && (
        <div className="fixed top-6 right-6 z-[200] transition-all duration-500 transform translate-y-0 opacity-100">
          <div className="bg-rose-600 text-white px-6 py-4 rounded-[20px] shadow-2xl flex items-center gap-3 border border-white/20">
            <AlertCircle size={24} />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-wider">{t.loginError}</span>
              {errorMessage && <span className="text-[9px] opacity-80">{errorMessage}</span>}
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0099FF] via-[#0088EE] to-[#0077CC] relative flex-col items-center justify-center p-20 text-white overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 text-center max-w-md">
          <h1 className="text-6xl font-black mb-6 tracking-tight">{t.welcome}</h1>
          <p className="text-lg font-medium opacity-80 leading-relaxed mb-10">
            {t.welcomeSub}
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="h-1 w-20 bg-white/30 rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="h-1 w-20 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-[420px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="pb-8 text-center relative">
              {(mode !== 'LOGIN' && mode !== 'SIGNUP') && (
                <button 
                  type="button" 
                  onClick={() => setMode('LOGIN')}
                  className="absolute left-0 top-0 p-2 text-slate-400 hover:text-[#0099FF] transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-5xl font-black text-[#0099FF] mb-3 tracking-tight">{getTitle()}</h2>
              <div className="w-20 h-1.5 bg-[#0099FF] rounded-full mx-auto" />
            </div>

            {renderInputs()}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 bg-[#0099FF] hover:bg-[#0088EE] text-white rounded-xl font-black text-base shadow-xl shadow-[#0099FF]/20 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {getButtonText()}
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            {mode === 'LOGIN' ? (
              <button 
                onClick={() => setMode('SIGNUP')}
                className="text-[13px] font-bold text-slate-500 hover:text-[#0099FF] transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {t.switchRegister}
              </button>
            ) : (
              <button 
                onClick={() => setMode('LOGIN')}
                className="text-[13px] font-bold text-slate-500 hover:text-[#0099FF] transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {t.switchLogin}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
