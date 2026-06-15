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
      // লাইভ ডাটাবেজ/গুগল শিট থেকে ওয়ার্কার ভেরিফাই করা
      const response = await fetch('/api/fetch-data', { method: 'GET' });
      const data = await response.json();

      if (data && data.workers) {
        const matchedWorker = data.workers.find(
          (w) => w.email?.trim().toLowerCase() === email.trim().toLowerCase() && 
                 w.password?.toString().trim() === password.trim()
        );

        if (matchedWorker) {
          localStorage.setItem('workerEmail', matchedWorker.email);
          router.push('/home'); // লগইন সফল হলে সোজা ড্যাশবোর্ডে রিডাইরেক্ট
        } else {
          setErrorMsg('❌ জিমেইল অথবা পাসওয়ার্ড ভুল হয়েছে ভাই!');
        }
      } else {
        setErrorMsg('⚠️ ডাটাবেজ সিঙ্ক এরর! একটু পর চেষ্টা করুন।');
      }
    } catch (err) {
      setErrorMsg('⚠️ সার্ভারে সমস্যা হচ্ছে, আবার চেষ্টা করুন।');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 text-xs">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl">
        
        <div className="text-center space-y-1">
          <h2 className="text-sm font-black uppercase tracking-wider text-violet-400">ওয়ার্কার লগইন</h2>
          <p className="text-[10px] text-slate-500 font-medium">আপনার অ্যাকাউন্ট তথ্য দিয়ে প্রবেশ করুন</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block">✉️ জিমেইল অ্যাকাউন্ট</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourmail@gmail.com" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none focus:border-violet-500 font-medium text-white" 
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none focus:border-violet-500 font-mono text-white" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loggingIn}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl uppercase tracking-wider transition active:scale-95 shadow-lg shadow-indigo-600/10"
          >
            {loggingIn ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন ➔'}
          </button>
        </form>

      </div>
    </div>
  );
}
