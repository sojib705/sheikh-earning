'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // 🔒 আপনার সিক্রেট অ্যাডমিন ডাটা
    const ADMIN_EMAIL = 'sojibmk3899@gmail.com';
    const ADMIN_PASSWORD = 'Sojib11@@';

    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdminAuthenticated', 'true');
      alert('স্বাগতম বস! অ্যাডমিন লগইন সফল হয়েছে।');
      router.push('/admin-dashboard'); 
    } else {
      setErrorMsg('ভুল অ্যাডমিন তথ্য! চুরির চেষ্টা করবেন না।');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl text-slate-100 text-xs">
        
        <div className="text-center space-y-1">
          <div className="text-violet-500 text-3xl mb-2">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <h1 className="text-lg font-black uppercase tracking-wider text-violet-400">অ্যাডমিন সিকিউরিটি লগইন</h1>
          <p className="text-slate-400">অননুমোদিত ব্যক্তিদের প্রবেশ সম্পূর্ণ নিষিদ্ধ</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold">অ্যাডমিন ஜিমেইল</label>
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
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl tracking-wider uppercase transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'যাচাই করা হচ্ছে...' : 'কন্ট্রোল প্যানেলে প্রবেশ করুন ➔'}
          </button>
        </form>

      </div>
    </div>
  );
}
