'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const router = useRouter();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoggingIn(true);

    try {
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();

      if (data && data.workers) {
        const matchedWorker = data.workers.find(
          (w) => w.email?.trim().toLowerCase() === email.trim().toLowerCase() && 
                 w.password?.toString().trim() === password.trim()
        );

        if (matchedWorker) {
          localStorage.setItem('workerEmail', matchedWorker.email);
          localStorage.setItem('workerUID', matchedWorker.uid);
          localStorage.setItem('workerName', matchedWorker.name);
          router.push('/home'); 
        } else {
          setErrorMsg('❌ জিমেইল অথবা পাসওয়ার্ড ভুল হয়েছে ভাই!');
        }
      } else {
        setErrorMsg('⚠️ ডাটাবেজ সিঙ্ক এরর! গুগল শিট চেক করুন।');
      }
    } catch (err) {
      setErrorMsg('⚠️ সার্ভারে সমস্যা হচ্ছে, আবার চেষ্টা করুন।');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 text-xs font-sans selection:bg-indigo-500/30">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* হেডার */}
        <div className="text-center space-y-1">
          <h2 className="text-sm font-black uppercase tracking-wider text-violet-400">ওয়ার্কার লগইন</h2>
          <p className="text-[10px] text-slate-500 font-medium">আপনার অ্যাকাউন্ট তথ্য দিয়ে প্রবেশ করুন</p>
        </div>

        {/* এরর মেসেজ */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl font-bold text-center animate-bounce">
            {errorMsg}
          </div>
        )}

        {/* লগইন ফর্ম */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">✉️ জিমেইল অ্যাকাউন্ট</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourmail@gmail.com" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 font-medium text-white transition-all shadow-inner" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">🔒 পাসওয়ার্ড</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 font-mono text-white transition-all shadow-inner" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loggingIn}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl uppercase tracking-wider transition active:scale-95 shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            {loggingIn ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন ➔'}
          </button>
        </form>

        {/* 🟢 হোয়াটসঅ্যাপ এডমিন কন্টাক্ট সেকশন */}
        <div className="pt-2 border-t border-slate-800/60 text-center space-y-2">
          <p className="text-[10px] text-slate-400 font-bold tracking-wide">
            💬 নতুন আইডি বানাতে এডমিনের সাথে যোগাযোগ করুন
          </p>
          <a 
            href="https://wa.me/8801823315984" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/10 active:scale-95 cursor-pointer text-[11px]"
          >
            {/* SVG হোয়াটসঅ্যাপ লোগো */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.489 4.936 1.492 5.428.002 9.845-4.415 9.849-9.847a9.816 9.816 0 0 0-2.856-6.96 9.815 9.815 0 0 0-6.962-2.85c-5.438 0-9.854 4.417-9.858 9.848-.002 1.748.465 3.454 1.354 4.9l-.994 3.63 3.733-.981zm12.002-7.466c-.29-.146-1.715-.847-1.98-.942-.265-.096-.458-.146-.65.147-.192.291-.745.942-.913 1.135-.167.192-.335.218-.625.073-.29-.147-1.224-.451-2.33-1.439-.86-.767-1.44-1.716-1.608-2.008-.168-.292-.018-.45.128-.595.132-.13.292-.34.438-.51.145-.17.193-.288.29-.48.096-.194.048-.364-.025-.51-.072-.145-.65-1.564-.89-2.14-.235-.564-.475-.488-.65-.497-.168-.008-.362-.01-.555-.01-.193 0-.507.073-.77.364-.263.292-1.003.98-1.003 2.392s1.03 2.736 1.173 2.93c.144.194 2.028 3.1 4.912 4.346.686.296 1.221.474 1.639.607.69.219 1.317.189 1.812.115.552-.083 1.714-.699 1.954-1.374.24-.675.24-1.253.169-1.374-.072-.121-.265-.193-.555-.339z"/>
            </svg>
            Contact Admin on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
