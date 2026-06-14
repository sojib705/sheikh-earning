'use client';
import { useState, useEffect } from 'react';

export default function WorkerTaskSubmitPage() {
  const [timeLeft, setTimeLeft] = useState(900); // ১৫ মিনিট কাউন্টডাউন
  const [isLocked, setIsLocked] = useState(false);
  
  const [fields, setFields] = useState({ uid: '', password: '', tfa: '', mail: '', cookie: '' });
  const [errors, setErrors] = useState({ uid: '', password: '', tfa: '', mail: '', cookie: '' });

  // ১৫ মিনিটের টাইমার মেকানিজম
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsLocked(true);
      return;
    }
    const timer = setInterval(() => { setTimeLeft(prev => prev - 1); }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} মিনিট ${secs < 10 ? '০' : ''}${secs} সেকেন্ড`;
  };

  // লাইভ ক্যারেক্টার এবং এপিআই ডুপ্লিকেট ভ্যালিডেশন
  const handleLiveCheck = async (fieldName, value) => {
    setFields(prev => ({ ...prev, [fieldName]: value }));

    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'CHECK_DUPLICATE_SUBMISSION', fieldName, value })
      });
      const data = await response.json();
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: data.message || '' // লাইভ ভুল বা ডুপ্লিকেট মেসেজ লাল অক্ষরে শো করবে
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const hasErrors = Object.values(errors).some(x => x !== '') || !fields.uid || !fields.password || !fields.tfa || !fields.mail || !fields.cookie;

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 text-xs text-slate-100 space-y-4">
      
      {/* ১৫ মিনিটের লাইভ টাইমার ডিসপ্লে */}
      <div className={`p-4 rounded-2xl font-black text-center border ${isLocked ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-amber-500/10 border-amber-500 text-amber-400 animate-pulse'}`}>
        {isLocked ? '⚠️ সময় শেষ! কাজটি সম্পূর্ণরূপে লক হয়ে গেছে।' : `⏰ কাজটি শেষ হতে আর মাত্র ${formatTime(timeLeft)} বাকি আছে!`}
      </div>

      <div className="space-y-3.5">
        {/* ১. UID/USER */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold">UID / USER</label>
          <input type="text" disabled={isLocked} value={fields.uid} onChange={e => handleLiveCheck('uid', e.target.value)} placeholder="ফেসবুক আইডি ইউআইডি দিন" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none" />
          {errors.uid && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.uid}</p>}
        </div>

        {/* ২. PASSWORD */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold">PASSWORD</label>
          <input type="text" disabled={isLocked} value={fields.password} onChange={e => handleLiveCheck('password', e.target.value)} placeholder="আইডির পাসওয়ার্ড লিখুন" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none" />
          {errors.password && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.password}</p>}
        </div>

        {/* ৩. 2FA CODE (১৬ বা ৩২ অক্ষরের আলফানিউমেরিক সিক্রেট কি লক) */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold">2FA SECRET KEY (১৬/৩২ অক্ষর)</label>
          <input type="text" disabled={isLocked} value={fields.tfa} onChange={e => handleLiveCheck('tfa', e.target.value)} placeholder="যেমন: JBSWY3DPEHPK3PXP" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none font-mono uppercase tracking-wider" />
          {errors.tfa && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.tfa}</p>}
        </div>

        {/* ৪. MAIL ACCESS (৩ পাইপ সংবলিত কন্ডিশনাল বক্স) */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold">MAIL ACCESS (ফরম্যাট লক)</label>
          <input type="text" disabled={isLocked} value={fields.mail} onChange={e => handleLiveCheck('mail', e.target.value)} placeholder="mail@hotmail.com|password|recovery|cookie" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none text-[11px]" />
          {errors.mail && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.mail}</p>}
        </div>

        {/* ৫. COOKIE */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold">COOKIE DATA</label>
          <input type="text" disabled={isLocked} value={fields.cookie} onChange={e => handleLiveCheck('cookie', e.target.value)} placeholder="ফেসবুক আইডি কুকি পেস্ট করুন" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none font-mono" />
          {errors.cookie && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.cookie}</p>}
        </div>

        {/* ৫টি বক্সের শর্ত পূরণ ও কোনো ভুল না থাকলেই কেবল বাটন জ্বলবে */}
        <button 
          disabled={isLocked || hasErrors} 
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black py-4 rounded-xl uppercase tracking-wider transition shadow-lg active:scale-95"
        >
          জব সাবমিট করুন 🚀
        </button>
      </div>

    </div>
  );
}
