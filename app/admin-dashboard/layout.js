'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardLayout({ children }) {
  const [notice, setNotice] = useState('');
  const [updatingNotice, setUpdatingNotice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ submissions: 0, withdraws: 0, workers: 3 });
  
  // 📢 সাইড নোটিফিকেশন টোস্ট অ্যালার্ট স্টেট
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const router = useRouter();
  const pathname = usePathname();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // 🔒 ১. অ্যাডমিন সিকিউরিটি গার্ড লক
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdminAuthenticated');
    if (isAdmin !== 'true') {
      router.push('/admin-login');
    } else {
      loadGlobalStatsAndNotice();
    }
  }, [router]);

  // ২. নোটিশ এবং ব্যাজ কাউন্ট সামারি লোড করার গ্লোবাল ফাংশন
  const loadGlobalStatsAndNotice = async () => {
    try {
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      if (!data.error) {
        setNotice(data.currentNotice || '');
        setStats({
          submissions: data.submissions?.length || 0,
          withdraws: data.withdraws?.length || 0,
          workers: data.workers?.length || 3 // শিট থেকে লাইভ কাউন্ট (ডিফল্ট ৩)
        });
      }
    } catch (err) {
      console.error('Global layout data sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 📢 ৩. নোটিশ বোর্ড গুগল শিটে আপডেট করার গ্লোবাল ফাংশন
  const handleUpdateNotice = async (e) => {
    e.preventDefault();
    setUpdatingNotice(true);
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'UPDATE_NOTICE', noticeText: notice })
      });
      const data = await response.json();
      if (data.success) {
        showToast('📢 নোটিশ সফলভাবে গুগল শিটে লাইভ করা হয়েছে!', 'success');
      }
    } catch (err) {
      showToast('সার্ভার এরর!', 'error');
    } finally {
      setUpdatingNotice(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    router.push('/admin-login');
  };

  // স্ক্রিনশট অনুযায়ী ৪টি মেগা ট্যাবের ডেডিকেটেড সাব-রাউট ম্যাপ
  const adminTabs = [
    { name: 'কাজের পোস্ট ও রিপোর্ট', path: '/admin-dashboard/tasks', count: stats.submissions, icon: '📋' },
    { name: 'উইথড্র', path: '/admin-dashboard/withdraw', count: stats.withdraws, icon: '💰' },
    { name: 'ওয়ার্কার্স', path: '/admin-dashboard/workers', count: stats.workers, icon: '👥' },
    { name: '+ ইউজার', path: '/admin-dashboard/create-user', count: null, icon: '➕' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-500 flex flex-col items-center justify-center font-sans text-xs uppercase tracking-widest">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        অ্যাডমিন কন্ট্রোল পোর্টাল সিঙ্ক হচ্ছে...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased text-xs">
      
      {/* 🔮 স্ক্রিনের এক সাইটে ভেসে আসা টোস্ট নোটিফিকেশন বার */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-5 py-4 rounded-2xl shadow-2xl border font-bold text-white transition-all duration-300 animate-in slide-in-from-bottom-5 ${
          toast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500/30'
        }`}>
          <span>{toast.type === 'error' ? '⚠️' : '✨'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* 🏢 অ্যাডমিন টপ হেডার বার */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40 flex justify-between items-center shadow-2xl max-w-7xl mx-auto rounded-b-2xl">
        <h1 className="font-black text-sm uppercase tracking-wider text-violet-400 flex items-center gap-2 select-none">
          <i className="fa-solid fa-user-shield animate-pulse"></i> Sheikh Earning Admin Panel
        </h1>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-black text-amber-400 uppercase tracking-wide">মাস্টার মোড</span>
          <button 
            onClick={handleLogout} 
            className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 rounded-xl font-black transition active:scale-95 border border-rose-500/10"
          >
            লগআউট ➔
          </button>
        </div>
      </header>

      {/* 🏆 মেইন ওয়ার্কিং এরিয়া */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* 📢 গ্লোবাল সেকশন ১: লাইভ নোটিশ বোর্ড ইনপুট সিস্টেম (সব পেজে ফিক্সড থাকবে) */}
        <section className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl max-w-2xl">
          <form onSubmit={handleUpdateNotice} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              required 
              value={notice} 
              onChange={(e) => setNotice(e.target.value)} 
              placeholder="এখানে আজকের জরুরি নোটিশটি লিখুন..." 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-medium" 
            />
            <button 
              type="submit" 
              disabled={updatingNotice} 
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition active:scale-95 whitespace-nowrap"
            >
              {updatingNotice ? 'আপডেট হচ্ছে...' : 'নোটিশ লাইভ করুন 📢'}
            </button>
          </form>
        </section>

        {/* 🗂️ গ্লোবাল সেকশন ২: আপনার স্ক্রিনশট মেলানো ৪টি মেগা ট্যাব বাটন কন্ট্রোল */}
        <div className="bg-slate-900 rounded-2xl p-2 max-w-3xl border border-slate-800/80 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {adminTabs.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link 
                  key={tab.path} 
                  href={tab.path}
                  className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider ${
                    isActive 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10 scale-100 border border-violet-500/20' 
                      : 'bg-slate-950/40 border border-slate-800/60 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>
                    {tab.name} {tab.count !== null && `(${tab.count})`}
                  </span>
                  
                  {/* একটিভ ট্যাবের জন্য সুন্দর নিচের ইন্ডিকেটর ডট */}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 🔀 ডায়নামিক সাব-পেজ এরিয়া (এখানে ক্লিক করা পেজের কন্টেন্ট রেন্ডার হবে) */}
        <div className="min-h-[400px]">
          {children}
        </div>

      </main>
    </div>
  );
}
