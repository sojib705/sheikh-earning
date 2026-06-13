'use client';

import { useState } from 'react';

export default function Dashboard() {
  // ১. সেশন বা ডামি ইউজার ডাটা (পরবর্তীতে এটা আমরা ব্যাকএন্ড থেকে আনবো)
  const [user, setUser] = useState({
    name: 'Sojib Sheikh',
    uid: 'uid_884732',
    gmail: 'sojib@gmail.com',
    role: 'worker'
  });

  // ২. ইউআরএল এর মতো পেজ কন্ট্রোল করার স্টেট (ডিফল্ট: home)
  const [currentPage, setCurrentPage] = useState('home');

  // ৩. ফর্ম ডাটা স্টেটসমূহ
  const [taskData, setTaskData] = useState({ uid: '', password: '', two_fa: '', mail_access: '', cookie: '' });
  const [withdrawData, setWithdrawData] = useState({ method: 'বিকাশ', number: '', amount: '' });

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting Task:', taskData);
    alert('কাজটি সফলভাবে সাবমিট হয়েছে!');
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting Withdraw:', withdrawData);
    alert('উইথড্র রিকোয়েস্ট পাঠানো হয়েছে!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      
      {/* 🔝 টপ হেডার (পিএইচপির includes/header.php এর আধুনিক রূপ) */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-100">
            SE
          </div>
          <span className="font-black text-slate-800 text-lg tracking-wide">SHEIKH EARNING</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <i className="fa-solid fa-user text-xs text-blue-600"></i>
          <span className="text-xs font-bold text-slate-600">{user.name}</span>
        </div>
      </header>

      {/* 📦 মেইন কন্টেন্ট এরিয়া */}
      <main className="max-w-md mx-auto p-4 pt-6">

        {/* 🏠 কন্টেন্ট ১: হোমপেজ / আজকের কাজ */}
        {currentPage === 'home' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-amber-500"></i> আজকের এভেইলেবল কাজ
            </h2>
            
            {/* কাজের বিবরণী কার্ড */}
            <div className="job-card bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-2xl text-white shadow-xl shadow-blue-100 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base tracking-wide">0F-2FA-HOTMAIL/OUTLOOK</h3>
                <p className="text-blue-100 text-xs font-medium leading-relaxed max-w-[250px]">
                  কুকি ফাইলসহ এবং অল এক্সেস মেল সাবমিট করতে হবে।
                </p>
              </div>
              <div className="job-price bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-lg font-black tracking-wide">
                ১০৳
              </div>
            </div>

            {/* কাজের সাবমিশন ফর্ম */}
            <div className="form-box bg-white p-6 rounded-2xl shadow-md border border-slate-100">
              <form onSubmit={handleTaskSubmit} className="space-y-5">
                
                <div className="input-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <i className="fa-solid fa-fingerprint text-blue-600"></i> UID / অ্যাকাউন্ট আইডি
                  </label>
                  <input type="text" placeholder="UID দিন" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-all" onChange={e => setTaskData({...taskData, uid: e.target.value})} />
                </div>

                <div className="input-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <i className="fa-solid fa-key text-blue-600"></i> পাসওয়ার্ড
                  </label>
                  <input type="text" placeholder="অ্যাকাউন্টের পাসওয়ার্ড দিন" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-all" onChange={e => setTaskData({...taskData, password: e.target.value})} />
                </div>

                <div className="input-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <i className="fa-solid fa-shield-keyhole text-blue-600"></i> 2FA কোড / কি (Key)
                  </label>
                  <input type="text" placeholder="2FA সিক্রেট কোড দিন" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-all" onChange={e => setTaskData({...taskData, two_fa: e.target.value})} />
                </div>

                <div className="input-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <i className="fa-solid fa-envelope-open text-blue-600"></i> মেইল এক্সেস পাসওয়ার্ড (যদি থাকে)
                  </label>
                  <input type="text" placeholder="Mail Access Password" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-all" onChange={e => setTaskData({...taskData, mail_access: e.target.value})} />
                </div>

                <div className="input-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <i className="fa-solid fa-cookie-bite text-blue-600"></i> কুকি ডাটা (Cookie Text)
                  </label>
                  <textarea rows="4" placeholder="এখান সম্পূর্ণ কুকি কোডটি পেস্ট করুন..." required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition-all resize-none" onChange={e => setTaskData({...taskData, cookie: e.target.value})}></textarea>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]">
                  <i className="fa-solid fa-paper-plane text-xs"></i> কাজ সাবমিট করুন
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 📊 কন্টেন্ট ২: কাজের হিস্ট্রি */}
        {currentPage === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-blue-600"></i> আপনার কাজের হিস্ট্রি
            </h2>
            
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                      <th className="p-4">তারিখ</th>
                      <th className="p-4">কাজের নাম</th>
                      <th className="p-4">স্ট্যাটাস</th>
                      <th className="p-4 text-right">টাকা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                    <tr>
                      <td className="p-4 whitespace-nowrap text-slate-400">06-13 10:30</td>
                      <td className="p-4 font-bold">0F-2FA-HOTMAIL</td>
                      <td className="p-4"><span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-bold">Done</span></td>
                      <td className="p-4 text-right font-black text-slate-900">১০৳</td>
                    </tr>
                    <tr>
                      <td className="p-4 whitespace-nowrap text-slate-400">06-13 09:15</td>
                      <td className="p-4 font-bold">0F-2FA-HOTMAIL</td>
                      <td className="p-4"><span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg font-bold">Pending</span></td>
                      <td className="p-4 text-right font-black text-slate-900">১০৳</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 💰 কন্টেন্ট ৩: উইথড্র সিস্টেম */}
        {currentPage === 'withdraw' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-wallet text-emerald-600"></i> টাকা উত্তোলন (Withdraw)
            </h2>
            
            <div className="form-box bg-white p-6 rounded-2xl shadow-md border border-slate-100">
              <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                
                <div className="input-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <i className="fa-solid fa-money-check-dollar text-emerald-600"></i> পেমেন্ট মেথড সিলেক্ট করুন
                  </label>
                  <select className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-600 transition-all" onChange={e => setWithdrawData({...withdrawData, method: e.target.value})}>
                    <option value="বিকাশ">বিকাশ (Personal)</option>
                    <option value="নগদ">নগদ (Personal)</option>
                    <option value="রকেট">রকেট (Personal)</option>
                  </select>
                </div>

                <div className="input-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <i className="fa-solid fa-phone text-emerald-600"></i> অ্যাকাউন্ট নাম্বার
                  </label>
                  <input type="number" placeholder="017XXXXXXXX" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all" onChange={e => setWithdrawData({...withdrawData, number: e.target.value})} />
                </div>

                <div className="input-group flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <i className="fa-solid fa-bangladeshi-taka-sign text-emerald-600"></i> টাকার পরিমাণ (সর্বনিম্ন ৫০৳)
                  </label>
                  <input type="number" min="50" placeholder="৫০ বা তার বেশি দিন" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 transition-all" onChange={e => setWithdrawData({...withdrawData, amount: e.target.value})} />
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]">
                  <i className="fa-solid fa-wallet text-xs"></i> উইথড্র রিকোয়েস্ট পাঠান
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 👤 কন্টেন্ট ৪: ওয়ার্কার প্রোফাইল */}
        {currentPage === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-user-gear text-orange-500"></i> আপনার প্রোফাইল
            </h2>
            
            <div className="form-box bg-white p-6 rounded-2xl shadow-md border border-slate-100 text-center space-y-4">
              <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">{user.name}</h3>
                <p className="text-slate-400 text-xs font-bold tracking-wide">ID: {user.uid}</p>
              </div>
              
              <div className="text-left bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-semibold text-slate-600 space-y-3">
                <p className="flex justify-between"><span>অ্যাকাউন্ট জিমেইল:</span> <span className="text-slate-800 font-bold">{user.gmail}</span></p>
                <p className="flex justify-between"><span>অ্যাকাউন্ট টাইপ:</span> <span className="text-emerald-600 font-bold">সক্রিয় ওয়ার্কার</span></p>
                <p className="flex justify-between"><span>দৈনিক কাজের লিমিট:</span> <span className="text-blue-600 font-bold">অ্যাডমিন নির্ধারিত</span></p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 📱 বটম নেভিগেশন বার (পিএইচপির includes/bottom-nav.php এর আধুনিক রূপ) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-xl px-4 py-2 flex justify-around max-w-md mx-auto z-50 rounded-t-2xl">
        <button onClick={() => setCurrentPage('home')} className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentPage === 'home' ? 'text-blue-600 font-black scale-105' : 'text-slate-400 font-bold'}`}>
          <i className="fa-solid fa-house text-lg"></i>
          <span className="text-[10px]">হোম</span>
        </button>
        <button onClick={() => setCurrentPage('history')} className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentPage === 'history' ? 'text-blue-600 font-black scale-105' : 'text-slate-400 font-bold'}`}>
          <i className="fa-solid fa-clock-rotate-left text-lg"></i>
          <span className="text-[10px]">হিস্ট্রি</span>
        </button>
        <button onClick={() => setCurrentPage('withdraw')} className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentPage === 'withdraw' ? 'text-blue-600 font-black scale-105' : 'text-slate-400 font-bold'}`}>
          <i className="fa-solid fa-wallet text-lg"></i>
          <span className="text-[10px]">উইথড্র</span>
        </button>
        <button onClick={() => setCurrentPage('profile')} className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${currentPage === 'profile' ? 'text-blue-600 font-black scale-105' : 'text-slate-400 font-bold'}`}>
          <i className="fa-solid fa-user text-lg"></i>
          <span className="text-[10px]">প্রোফাইল</span>
        </button>
      </nav>

    </div>
  );
}
