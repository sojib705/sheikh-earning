'use client';

import { useState, useEffect } from 'react';

export default function WorkerProfilePage() {
  const [profile, setProfile] = useState({
    uid: 'N/A',
    name: 'Worker',
    email: '',
    totalIncome: 0,
    monthlyIncome: 0,
    weeklyIncome: 0,
    joinedDate: '--/--/----'
  });
  const [loading, setLoading] = useState(true);

  // গুগল শিটের Users ট্যাব থেকে এই নির্দিষ্ট ওয়ার্কারের প্রোফাইল ডাটা ও ইনকাম সামারি লোড করা
  const loadWorkerProfile = async () => {
    try {
      setLoading(true);
      const savedEmail = localStorage.getItem('workerEmail');
      if (!savedEmail) return;

      // এডমিন এপিআই থেকে কারেন্ট মেম্বারদের লাইভ ডাটা তুলে আনা
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      
      // নোট: যদি আপনার এপিআই আলাদা মেম্বার লিস্ট পাঠায়, তবে সেটার অবজেক্ট নেম (যেমন: workers) মেলাবেন। 
      // এখানে লেআউট ফাইলের স্ট্রাকচারের সাথে সিঙ্ক রেখে ডাটা ফিল্টার করা হচ্ছে।
      if (!data.error && data.workers) {
        const workerEmailLower = savedEmail.trim().toLowerCase();
        const current = data.workers.find(
          (w) => w.email?.trim().toLowerCase() === workerEmailLower
        );

        if (current) {
          setProfile({
            uid: current.uid || 'UID_' + Math.floor(100000 + Math.random() * 900000),
            name: current.name || 'Worker',
            email: current.email || savedEmail,
            totalIncome: Number(current.totalIncome) || Number(current.balance) || 0, // টোটাল বা কারেন্ট ব্যালেন্স
            monthlyIncome: Number(current.monthlyIncome) || 0,
            weeklyIncome: Number(current.weeklyIncome) || 0,
            joinedDate: current.joinedDate || '০৬/১৫/২০২৬'
          });
        }
      } else {
        // যদি এপিআই-তে এখনো workers কলাম লাইভ না থাকে, তবে লোকাল স্টোরেজ থেকে বেসিক ডাটা ব্যাকআপ হিসেবে সেট হবে
        setProfile(prev => ({
          ...prev,
          email: savedEmail,
          uid: 'UID_SYNCING...'
        }));
      }
    } catch (err) {
      console.error('Profile page data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-bold">আপনার প্রোফাইল প্রোফাইল সিঙ্ক হচ্ছে ভাই...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-xs animate-in fade-in duration-200">
      
      {/* 👤 পার্সোনাল কার্ড ও বেসিক ইনফো */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg uppercase select-none">
          {profile.name[0]}
        </div>
        <div className="text-center sm:text-left space-y-1 flex-1">
          <h2 className="text-slate-100 font-black text-base tracking-wide">{profile.name}</h2>
          <p className="text-slate-400 font-medium">লগইন জিমেইল: <span className="font-mono text-slate-300">{profile.email}</span></p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
            <span className="bg-slate-950 border border-slate-800 text-violet-400 px-2.5 py-1 rounded-lg font-mono font-bold text-[10px]">ID: {profile.uid}</span>
            <span className="bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg font-bold text-[10px]">📅 জয়েনিং ডেট: {profile.joinedDate}</span>
          </div>
        </div>
        <button 
          onClick={loadWorkerProfile} 
          className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-black transition active:scale-95 whitespace-nowrap self-center sm:self-end"
        >
          🔄 রিফ্রেশ অ্যাকাউন্ট
        </button>
      </div>

      {/* 📊 ইনকাম স্ট্যাটাস মাস্টার কার্ড বোর্ড */}
      <div className="space-y-3">
        <h3 className="text-slate-400 font-black uppercase tracking-wider text-[10px] pl-1">💰 আপনার ইনকাম স্ট্যাটাস কার্ড</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* কার্ড ১: মোট ইনকাম */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-3 border-l-4 border-l-emerald-500">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">সর্বমোট ইনকাম</span>
              <span className="text-slate-400 text-[10px] font-medium block">Life-time Total Earnings</span>
            </div>
            <span className="font-mono font-black text-lg text-emerald-400">{profile.totalIncome} .০০ ৳</span>
          </div>

          {/* 카드 ২: মাসিক ইনকাম */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-3 border-l-4 border-l-indigo-500">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">এই মাসের ইনকাম</span>
              <span className="text-slate-400 text-[10px] font-medium block">Current Monthly Stats</span>
            </div>
            <span className="font-mono font-black text-lg text-indigo-400">{profile.monthlyIncome} .০০ ৳</span>
          </div>

          {/* কার্ড ৩: সাপ্তাহিক ইনকাম */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md flex flex-col justify-between space-y-3 border-l-4 border-l-violet-500">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">এই সপ্তাহের ইনকাম</span>
              <span className="text-slate-400 text-[10px] font-medium block">Current Weekly Stats</span>
            </div>
            <span className="font-mono font-black text-lg text-violet-400">{profile.weeklyIncome} .০০ ৳</span>
          </div>

        </div>
      </div>

      {/* 🔒 সিকিউরিটি নোট */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl text-slate-500 font-medium leading-relaxed">
        ⚠️ <span className="font-bold text-slate-400">নিরাপত্তা সতর্কবার্তা:</span> আপনার মেম্বার আইডি ক্রেডেনশিয়াল বা লগইন পাসওয়ার্ড অন্য কারো সাথে শেয়ার করবেন না। আপনার উপার্জিত ব্যালেন্স সরাসরি গুগল শিট ডাটাবেজের সাথে এনক্রিপ্টেড অবস্থায় সুরক্ষিত আছে। কোনো সমস্যা হলে সরাসরি নিচে থাকা কন্টাক্ট সাপোর্ট বাটনে ক্লিক করে অ্যাডমিনের সাথে যোগাযোগ করুন।
      </div>

    </div>
  );
}
