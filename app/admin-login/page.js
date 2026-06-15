'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 📢 সাইড নোটিফিকেশন টোস্ট স্টেট
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const router = useRouter();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const ADMIN_EMAIL = 'sojibmk3899@gmail.com';
    const ADMIN_PASSWORD = 'Sojib11@@';

    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      showToast('স্বাগতম বস! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...', 'success');
      
      // টোস্ট মেসেজটি দেখার জন্য সামান্য একটু সময় নিয়ে রিডাইরেক্ট হবে
      setTimeout(() => {
        router.push('/admin-dashboard'); 
      }, 1500);
    } else {
      showToast('ভুল অ্যাডমিন তথ্য! চুরির চেষ্টা করবেন না।', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-xs select-none">
      
      {/* 🔮 স্ক্রিনের সাইডে ভেসে আসা আধুনিক UI নোটিফিকেশন বার */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-5 py-4 rounded-2xl shadow-2xl border font-bold text-white transition-all duration-300 animate-in slide-in-from-bottom-5 ${
          toast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500/30'
        }`}>
          <span>{toast.type === 'error' ? '⚠️' : '🎉'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl text-slate-100">
        
        <div className="text-center space-y-1">
          <div className="text-violet-500 text-3xl mb-2">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <h1 className="text-lg font-black uppercase tracking-wider text-violet-400">অ্যাডমিন সিকিউরিটি লগইন</h1>
          <p className="text-slate-400">অননুমোদিত ব্যক্তিদের প্রবেশ সম্পূর্ণ নিষিদ্ধ</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold">অ্যাডমিন জিমেইল</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500 font-medium" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold">সিক্রেট পাসওয়ার্ড</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500 font-medium tracking-widest" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl tracking-wider uppercase transition shadow-lg disabled:opacity-50 active:scale-98"
          >
            {loading ? 'যাচাই করা হচ্ছে...' : 'কন্যাক্রোল প্যানেলে প্রবেশ করুন ➔'}
          </button>
        </form>

      </div>
    </div>
  );
}
