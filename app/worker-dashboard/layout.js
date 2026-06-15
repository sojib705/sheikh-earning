'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function WorkerDashboardLayout({ children }) {
  const [worker, setWorker] = useState({ uid: '', name: '', balance: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 🔒 ওয়ার্কার অথেনটিকেশন এবং রিয়েল-টাইম ব্যালেন্স সিঙ্ক
  const checkWorkerAuth = async () => {
    try {
      // লোকাল স্টোরেজ থেকে লগইন করা ওয়ার্কারের ইমেইল নেওয়া
      const savedEmail = localStorage.getItem('workerEmail');
      if (!savedEmail) {
        router.push('/login'); // লগইন না থাকলে সোজা লগইন পেজে পাঠাবে
        return;
      }

      // এপিআই থেকে ওয়ার্কারের গুগল শিটের রিয়াল লাইভ ডাটা ও ব্যালেন্স চেক করা
      const response = await fetch('/api/fetch-data', { method: 'GET' });
      const data = await response.json();
      
      if (data && data.workers) {
        // শিটের মেম্বার লিস্ট থেকে কারেন্ট ওয়ার্কারকে খুঁজে বের করা
        const current = data.workers.find(
          (w) => w.email?.trim().toLowerCase() === savedEmail.trim().toLowerCase()
        );

        if (current) {
          setWorker({
            uid: current.uid || 'N/A',
            name: current.name || 'Worker',
            balance: Number(current.balance) || 0,
          });
        }
      }
    } catch (err) {
      console.error('Worker layout authentication sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkWorkerAuth();
    // প্রতি ৩০ সেকেন্ড পর পর অটোমেটিক ব্যালেন্স আপডেট হবে ব্যাকএন্ড থেকে
    const balanceInterval = setInterval(checkWorkerAuth, 30000);
    return () => clearInterval(balanceInterval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('workerEmail');
    router.push('/login');
  };

  // মেনু আইটেম লিস্ট (PC সাইডবার এবং মোবাইল বটম বার উভয়ের জন্য)
  const menuItems = [
    { name: '🏠 হোম ড্যাশবোর্ড', path: '/home' },
    { name: '📝 কাজের হিস্ট্রি', path: '/history' },
    { name: '💰 টাকা উত্তোলন', path: '/withdraw' },
    { name: '👤 আমার প্রোফাইল', path: '/profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-500 flex flex-col items-center justify-center font-sans text-xs uppercase tracking-widest">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        সিকিউর পোর্টাল সিঙ্ক হচ্ছে...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col md:flex-row text-xs">
      
      {/* 🖥️ পিসি (PC) সাইডবার: স্ক্রিন বড় হলে এটি বামপাশে ফিক্সড অ্যাডমিন স্টাইলে থাকবে */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between p-5 shrink-0 h-screen sticky top-0">
        <div className="space-y-6">
          {/* লোগো ও ব্র্যান্ড */}
          <div className="border-b border-slate-800 pb-4">
            <h1 className="font-black text-xs uppercase tracking-wider text-violet-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Sheikh Earning Portal
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {worker.uid}</p>
          </div>

          {/* পিসি মেনু লিঙ্ক */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`w-full flex items-center p-3 rounded-xl font-bold tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* পিসি সাইডবার বটম: লগআউট বাটন */}
        <button 
          onClick={handleLogout}
          className="w-full bg-slate-950 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 p-3.5 rounded-xl font-black transition duration-200 text-left"
        >
          ✕ প্যানেল থেকে বিদায়
        </button>
      </aside>

      {/* 📱 মোবাইল হেডার: স্ক্রিন ছোট হলে কেবল ওপরে শো করবে */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40 flex justify-between items-center shadow-md">
        <div>
          <h1 className="font-black text-[11px] uppercase tracking-wider text-violet-400">Sheikh Earning</h1>
          <p className="text-[9px] text-slate-500 font-mono">ID: {worker.uid}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-rose-500/10 text-rose-400 border border-rose-500/10 px-2.5 py-1 rounded-lg font-bold text-[10px]"
        >
          লগআউট
        </button>
      </header>

      {/* 🏆 মেইন কন্টেন্ট উইন্ডো (PC এবং মোবাইল উভয়ের জন্য কমন ও স্ক্রল ফ্রেন্ডলি) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* 💰 গ্লোবাল ব্যালেন্স বার: যা পিসিতে ও মোবাইলে পেজের ঠিক ওপরে সবসময় রিয়েল ডাটা শো করবে */}
        <div className="bg-slate-900/40 border-b border-slate-800/60 p-4 md:px-8 md:py-5 flex justify-between items-center shadow-inner">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">মেম্বার অ্যাকাউন্ট</span>
            <span className="text-slate-200 font-black text-sm tracking-wide">{worker.name}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 px-4 py-2 rounded-2xl flex flex-col items-end shadow-md">
            <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest block mb-0.5">💸 আপনার মোট ব্যালেন্স</span>
            <span className="font-black text-base text-emerald-400 font-mono">{worker.balance} .০০ ৳</span>
          </div>
        </div>

        {/* ডায়নামিক চাইল্ড পেজ রেন্ডার এরিয়া (হোম, হিস্ট্রি, উইথড্রয়াল বা প্রোফাইল পেজের কন্টেন্ট এখানে ঢুকবে) */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 📱 মোবাইল বটম মেনু বার: পিসিতে এটি সম্পূর্ণরূপে হাইড থাকবে, মোবাইলে নিচে ফিক্সড থাকবে */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl flex justify-around p-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          // মোবাইল স্ক্রিনের জন্য শুধু প্রথম ইমোজি বা ছোট টেক্সট আইকন আলাদা করতে পারেন
          const shortName = item.name.split(' ')[1] || item.name;
          const icon = item.name.split(' ')[0] || '⚙️';
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center p-2 rounded-xl transition duration-150 min-w-[64px] ${
                isActive ? 'text-violet-400 font-black' : 'text-slate-500 font-medium'
              }`}
            >
              <span className="text-base mb-0.5">{icon}</span>
              <span className="text-[9px] tracking-wide font-bold">{shortName}</span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
