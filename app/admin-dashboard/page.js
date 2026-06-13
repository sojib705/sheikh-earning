'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  // অ্যাডমিন প্যানেলের ডিফল্ট স্টেটসমূহ
  const [activeTab, setActiveTab] = useState('tasks'); // tasks অথবা withdraws
  const [submissions, setSubmissions] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);

  // গুগল শিট থেকে অ্যাডমিনের জন্য সমস্ত ডাটা লোড করার ইফেক্ট
  useEffect(() => {
    // এখানে পরবর্তীতে আমরা অ্যাডমিন ডাটা ফেচ করার API কানেক্ট করব
    // আপাতত ডামি ডাটা দিয়ে UI প্রিভিউ দেওয়া হলো
    setSubmissions([
      { id: 1, date: '2026-06-14 02:30', task: '0F-2FA-HOTMAIL', uid: 'uid_884732', status: 'Pending', price: '১০৳' },
      { id: 2, date: '2026-06-14 01:15', task: '0F-2FA-HOTMAIL', uid: 'uid_110293', status: 'Approved', price: '১০৳' }
    ]);
    setWithdraws([
      { id: 1, date: '2026-06-14 11:00', method: 'বিকাশ', number: '01823315984', amount: '৫০০৳', status: 'Pending' }
    ]);
    setLoading(false);
  }, []);

  // স্ট্যাটাস চেঞ্জ হ্যান্ডলার (Approve/Reject বাটন অ্যাকশন)
  const handleAction = (type, id, action) => {
    alert(`${type === 'task' ? 'কাজ' : 'উইথড্র'} ID ${id} সফলভাবে ${action === 'approve' ? 'Approved' : 'Rejected'} হয়েছে!`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-12">
      
      {/* 👑 অ্যাডমিন টপ বার */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
            AD
          </div>
          <div>
            <h1 className="font-black text-base tracking-wide uppercase">Sheikh Earning</h1>
            <p className="text-[10px] text-violet-400 font-bold">অফিশিয়াল অ্যাডমিন প্যানেল</p>
          </div>
        </div>
        <div className="bg-slate-700/50 px-4 py-2 rounded-xl border border-slate-600 text-xs font-bold flex items-center gap-2 text-violet-300">
          <i className="fa-solid fa-user-shield"></i> প্রধান অ্যাডমিন
        </div>
      </header>

      {/* 📊 মেইন ড্যাশবোর্ড এরিয়া */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* 🗂️ ট্যাব সিলেক্টর বাটনসমূহ */}
        <div className="flex gap-3 bg-slate-800 p-1.5 rounded-2xl w-full max-w-md border border-slate-700/50">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${activeTab === 'tasks' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <i className="fa-solid fa-list-check"></i> ওয়ার্কারদের কাজ ({submissions.length})
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${activeTab === 'withdraw' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <i className="fa-solid fa-money-bill-transfer"></i> উইথড্র রিকোয়েস্ট ({withdraws.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-bold text-sm">ডাটা লোড হচ্ছে...</div>
        ) : (
          <>
            {/* 📋 টেবিল ১: ওয়ার্কারদের জমা দেওয়া কাজের তালিকা */}
            {activeTab === 'tasks' && (
              <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50">
                  <h2 className="text-sm font-black tracking-wide text-slate-300 uppercase">জমা হওয়া কাজের রিভিউ প্যানেল</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-700/30 border-b border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">তারিখ ও সময়</th>
                        <th className="p-4">ইউজার UID</th>
                        <th className="p-4">কাজের নাম</th>
                        <th className="p-4">টাকা</th>
                        <th className="p-4">স্ট্যাটাস</th>
                        <th className="p-4 text-center">অ্যাকশন (সিদ্ধান্ত)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 font-medium text-slate-300">
                      {submissions.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="p-4 whitespace-nowrap text-slate-500">{item.date}</td>
                          <td className="p-4 font-bold text-violet-400">{item.uid}</td>
                          <td className="p-4 font-bold">{item.task}</td>
                          <td className="p-4 font-black text-emerald-400">{item.price}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            {item.status === 'Pending' && (
                              <>
                                <button onClick={() => handleAction('task', item.id, 'approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition shadow-sm active:scale-95">Approve</button>
                                <button onClick={() => handleAction('task', item.id, 'reject')} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-bold transition shadow-sm active:scale-95">Reject</button>
                              </>
                            )}
                            {item.status !== 'Pending' && <span className="text-slate-500 italic text-[11px]">রিভিউ সম্পন্ন</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 📋 টেবিল ২: টাকা উত্তোলনের রিকোয়েস্ট তালিকা */}
            {activeTab === 'withdraw' && (
              <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50">
                  <h2 className="text-sm font-black tracking-wide text-slate-300 uppercase">পেন্ডিং উইথড্র রিকোয়েস্ট সমূহ</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-700/30 border-b border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">তারিখ</th>
                        <th className="p-4">ইউজার UID</th>
                        <th className="p-4">মেথড</th>
                        <th className="p-4">নাম্বার</th>
                        <th className="p-4">পরিমাণ</th>
                        <th className="p-4">স্ট্যাটাস</th>
                        <th className="p-4 text-center">অ্যাকশন (পেমেন্ট সফল)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 font-medium text-slate-300">
                      {withdraws.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="p-4 whitespace-nowrap text-slate-500">{item.date}</td>
                          <td className="p-4 font-bold text-violet-400">{item.uid}</td>
                          <td className="p-4"><span className="bg-slate-700 px-2 py-1 rounded-md font-bold text-slate-200">{item.method}</span></td>
                          <td className="p-4 font-bold tracking-wider">{item.number}</td>
                          <td className="p-4 font-black text-emerald-400">{item.amount}</td>
                          <td className="p-4">
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-bold text-[10px]">
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            <button onClick={() => handleAction('withdraw', item.id, 'approve')} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg font-bold transition shadow-sm active:scale-95">পেইড (Paid)</button>
                            <button onClick={() => handleAction('withdraw', item.id, 'reject')} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg font-bold transition active:scale-95">বাতিল</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

    </div>
  );
}
