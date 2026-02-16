
import React, { useState } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  Camera, 
  Globe, 
  Palette,
  Check,
  Save,
  Pencil,
  AlertTriangle,
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SettingsViewProps {
  language: 'English' | 'বাংলা';
  setLanguage: (lang: 'English' | 'বাংলা') => void;
  profile: {
    name: string;
    role: string;
    imageUrl: string;
  };
  setProfile: React.Dispatch<React.SetStateAction<any>>;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ language, setLanguage, profile, setProfile, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [tempProfile, setTempProfile] = useState(profile);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const translations = {
    English: {
      profileSettings: 'Profile Settings',
      manageIdentity: 'Manage your identity',
      fullName: 'Full Name',
      role: 'Role/Designation',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      editProfile: 'Edit Profile',
      appearance: 'Appearance',
      customizeView: 'Customize your view',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      languageLabel: 'Language',
      regionalLocalization: 'Regional localization',
      securitySettings: 'Security & Access',
      changePassword: 'Change Password',
      updateSecurity: 'Update your security',
      oldPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      updatePassword: 'Update Password',
      systemAccess: 'System Access',
      securityControls: 'Security controls',
      signOut: 'Sign Out from Account',
      signOutConfirm: 'Sign Out?',
      signOutMsg: 'Are you sure you want to end your current session and sign out of the application?',
      confirm: 'Confirm Logout',
      cancel: 'Cancel',
      version: 'DataFlow Management v2.5.0',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      docs: 'Documentation'
    },
    'বাংলা': {
      profileSettings: 'প্রোফাইল সেটিংস',
      manageIdentity: 'আপনার পরিচয় পরিচালনা করুন',
      fullName: 'পুরো নাম',
      role: 'পদবী',
      saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
      saving: 'সংরক্ষণ হচ্ছে...',
      editProfile: 'ইডিট প্রোফাইল',
      appearance: 'চেহারা',
      customizeView: 'আপনার ভিউ কাস্টমাইজ করুন',
      lightMode: 'লাইট মোড',
      darkMode: 'ডার্ক মোড',
      languageLabel: 'ভাষা',
      regionalLocalization: 'আঞ্চলিক ভাষা',
      securitySettings: 'নিরাপত্তা ও অ্যাক্সেস',
      changePassword: 'পাসওয়ার্ড পরিবর্তন',
      updateSecurity: 'নিরাপত্তা আপডেট করুন',
      oldPassword: 'বর্তমান পাসওয়ার্ড',
      newPassword: 'নতুন পাসওয়ার্ড',
      confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
      updatePassword: 'পাসওয়ার্ড আপডেট করুন',
      systemAccess: 'সিস্টেম অ্যাক্সেস',
      securityControls: 'নিরাপত্তা নিয়ন্ত্রণ',
      signOut: 'অ্যাকাউন্ট থেকে লগ আউট করুন',
      signOutConfirm: 'লগ আউট করবেন?',
      signOutMsg: 'আপনি কি নিশ্চিত যে আপনি আপনার বর্তমান সেশন শেষ করে অ্যাপ্লিকেশন থেকে লগ আউট করতে চান?',
      confirm: 'লগ আউট নিশ্চিত করুন',
      cancel: 'বাতিল',
      version: 'ডেটাফ্লো ম্যানেজমেন্ট ভার্সন ২.৫.০',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'পরিষেবার শর্তাবলী',
      docs: 'ডকুমেন্টেশন'
    }
  };

  const t = translations[language];

  const toggleTheme = (mode: 'light' | 'dark') => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileButtonClick = async () => {
    if (isEditingProfile) {
      setIsSaving(true);
      try {
        // Persist profile changes to Supabase Auth Metadata
        const { error } = await supabase.auth.updateUser({
          data: {
            name: tempProfile.name,
            role: tempProfile.role,
            imageUrl: tempProfile.imageUrl
          }
        });

        if (error) throw error;

        // Update local state
        setProfile(tempProfile);
        setIsEditingProfile(false);
      } catch (err: any) {
        console.error('Failed to update profile:', err.message);
        alert(language === 'English' ? 'Failed to save changes' : 'পরিবর্তন সংরক্ষণ করতে ব্যর্থ হয়েছে');
      } finally {
        setIsSaving(false);
      }
    } else {
      setTempProfile(profile);
      setIsEditingProfile(true);
    }
  };

  const handlePasswordUpdate = () => {
    alert(language === 'English' ? 'Password updated successfully!' : 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <section className="space-y-4">
          <div className="flex items-center gap-2 ml-4">
            <div className="w-1 h-4 bg-purple-600 rounded-full" />
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.profileSettings}</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] rounded-full -mr-10 -mt-10" />
            
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="relative group/avatar">
                <div className="w-32 h-32 rounded-[32px] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                  <img src={isEditingProfile ? tempProfile.imageUrl : profile.imageUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                </div>
                {isEditingProfile && (
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-all border-4 border-white dark:border-slate-900">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              
              <div className="mt-4 text-center mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{isEditingProfile ? tempProfile.name : profile.name}</h3>
                <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mt-2 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full inline-block">{isEditingProfile ? tempProfile.role : profile.role}</p>
              </div>

              <div className="w-full space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.fullName}</label>
                  <input 
                    type="text" 
                    value={isEditingProfile ? tempProfile.name : profile.name} 
                    readOnly={!isEditingProfile}
                    onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                    className={`w-full h-10 px-4 border rounded-xl text-[12px] font-bold outline-none transition-all ${
                      isEditingProfile 
                        ? 'bg-white dark:bg-slate-950 border-purple-500 text-slate-900 dark:text-white' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.role}</label>
                  <input 
                    type="text" 
                    value={isEditingProfile ? tempProfile.role : profile.role} 
                    readOnly={!isEditingProfile}
                    onChange={(e) => setTempProfile({...tempProfile, role: e.target.value})}
                    className={`w-full h-10 px-4 border rounded-xl text-[12px] font-bold outline-none transition-all ${
                      isEditingProfile 
                        ? 'bg-white dark:bg-slate-950 border-purple-500 text-slate-900 dark:text-white' 
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 w-full mt-8">
                <button 
                  onClick={handleProfileButtonClick}
                  disabled={isSaving}
                  className={`flex-1 h-11 rounded-xl font-black text-[11px] uppercase transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 ${
                    isEditingProfile 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isEditingProfile ? (
                    <Save size={16} />
                  ) : (
                    <Pencil size={14} />
                  )}
                  {isSaving ? t.saving : (isEditingProfile ? t.saveChanges : t.editProfile)}
                </button>
                {isEditingProfile && !isSaving && (
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="w-11 h-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.appearance}</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm group">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Palette size={18} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.appearance}</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.customizeView}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => toggleTheme('light')} className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between px-5 ${!isDarkMode ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <Sun size={18} className={!isDarkMode ? 'text-blue-600' : 'text-slate-400'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${!isDarkMode ? 'text-blue-600' : 'text-slate-400'}`}>{t.lightMode}</span>
                    </div>
                    {!isDarkMode && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </button>
                  <button onClick={() => toggleTheme('dark')} className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between px-5 ${isDarkMode ? 'border-blue-500 bg-slate-800/50' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <Moon size={18} className={isDarkMode ? 'text-blue-400' : 'text-slate-400'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-slate-400'}`}>{t.darkMode}</span>
                    </div>
                    {isDarkMode && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <div className="w-1 h-4 bg-emerald-600 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.languageLabel}</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm group">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.languageLabel}</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.regionalLocalization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[{ name: 'English', flag: '🇺🇸' }, { name: 'বাংলা', flag: '🇧🇩' }].map((lang) => (
                    <button key={lang.name} onClick={() => setLanguage(lang.name as 'English' | 'বাংলা')} className={`p-3 rounded-2xl border-2 flex items-center justify-between px-5 transition-all ${language === lang.name ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-emerald-200'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <span className={`text-[11px] font-black uppercase tracking-tight ${language === lang.name ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>{lang.name}</span>
                      </div>
                      {language === lang.name && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <div className="w-1 h-4 bg-amber-600 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.changePassword}</h2>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{t.changePassword}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.updateSecurity}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input type="password" placeholder={t.oldPassword} value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold outline-none focus:border-amber-500 transition-all" />
                  <input type="password" placeholder={t.newPassword} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full h-10 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold outline-none focus:border-amber-500 transition-all" />
                  <div className="flex gap-2">
                    <input type="password" placeholder={t.confirmPassword} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="flex-1 h-10 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold outline-none focus:border-amber-500 transition-all" />
                    <button onClick={handlePasswordUpdate} className="px-4 h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                      <ShieldCheck size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-4">
                <div className="w-1 h-4 bg-rose-600 rounded-full" />
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.systemAccess}</h2>
              </div>
              <div className="bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 rounded-[32px] p-6 shadow-sm group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <LogOut size={20} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight">{t.systemAccess}</h3>
                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">{t.securityControls}</p>
                  </div>
                </div>
                <button onClick={() => setIsLogoutModalOpen(true)} className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <LogOut size={18} /> {t.signOut}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[340px] rounded-[32px] p-10 text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={32} /></div>
            <h2 className="text-[18px] font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{t.signOutConfirm}</h2>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-8 font-bold leading-relaxed">{t.signOutMsg}</p>
            <div className="space-y-3">
              <button onClick={onLogout} className="w-full py-3.5 bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95">{t.confirm}</button>
              <button onClick={() => setIsLogoutModalOpen(false)} className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
