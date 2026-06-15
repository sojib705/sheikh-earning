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
      // 🛠️ নিখুঁত ও লাইভ অ্যাডমিন-অ্যাকশন এপিআই থেকে সরাসরি মেম্বার ডাটা সিঙ্ক করা
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();

      if (data && data.workers) {
        // ইমেইল এবং পাসওয়ার্ড ম্যাচিং চেক মেকানিজম
        const matchedWorker = data.workers.find(
          (w) => w.email?.trim().toLowerCase() === email.trim().toLowerCase() && 
                 w.password?.toString().trim() === password.trim()
        );

        if (matchedWorker) {
          // সেশন সেভ করা
          localStorage.setItem('workerEmail', matchedWorker.email);
          localStorage.setItem('workerUID', matchedWorker.uid);
          localStorage.setItem('workerName', matchedWorker.name);
          
          router.push('/home'); // সফল লগইনে সোজা মেইন ড্যাশবোর্ডে প্রবেশ
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
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex items-center justify-center p-4 text-xs font-sans">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-5 shadow-xl shadow-slate-200/80 border border-slate-100">
        
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-black text-[#1e3a8a]">ওয়ার্কার লগইন</h2>
          <p className="text-slate-400 font-medium">আপনার অ্যাকাউন্ট তথ্য দিয়ে প্রবেশ করুন</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-xl font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-500 font-bold block">✉️ জিমেইল অ্যাকাউন্ট</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sojibmk3899@gmail.com" 
              className="w-full bg-[#f9fafb] border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-[#3b82f6] font-medium text-slate-900 transition-all" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-500 font-bold block">🔒 পাসওয়ার্ড</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••" 
              className="w-full bg-[#f9fafb] border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-[#3b82f6] font-mono text-slate-900 transition-all" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loggingIn}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black py-4 rounded-xl uppercase tracking-wider transition active:scale-95 shadow-md shadow-blue-500/20"
          >
            {loggingIn ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন ➔'}
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="https://wa.me/your-number" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#10b981] hover:bg-[#059669] text-white font-bold px-4 py-2.5 rounded-xl transition shadow-sm">
            💬 CONTACT FOR WORK ON WHATSAPP
          </a>
        </div>

      </div>
    </div>
  );
}
