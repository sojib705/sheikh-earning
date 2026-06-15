'use client';

import { useState, useEffect } from 'react';

export default function AdminWithdrawPage() {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);

  // গুগল শিটের Withdraw_Requests কলাম থেকে ডাটা তুলে আনা
  const loadWithdrawRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      
      if (!data.error) {
        setWithdraws(data.withdraws || []);
      }
    } catch (err) {
      console.error('Withdraw page load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawRequests();
  }, []);

  // 💸 উইথড্রয়াল অ্যাকশন কন্ট্রোল লজিক (Paid / Cancelled)
  const handleWithdrawAction = async (rowNumber, statusText) => {
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tabName: 'Withdraw_Requests', 
          rowNumber: rowNumber, 
          newStatus: statusText 
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`🎉 পেমেন্ট রিকোয়েস্ট সফলভাবে "${statusText}" মার্ক করা হয়েছে!`);
        loadWithdrawRequests(); // ডাটা রিফ্রেশ করা
      }
    } catch (error) {
      alert('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 font-bold tracking-wider uppercase">গুগল শিট থেকে উইথড্র ডাটা সিঙ্ক হচ্ছে...</div>;
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in duration-200">
      
      {/* টেবিল হেডার */}
      <div className="p-4 bg-slate-800/20 border-b border-slate-800 font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
        <span>💰 ওয়ার্কারদের উইথড্র রিকোয়েস্ট ম্যানেজমেন্ট প্যানেল</span>
        <div className="flex items-center gap-3">
          <span className="bg-slate-950 px-2.5 py-1 rounded-lg text-indigo-400 font-mono font-bold text-[10px]">
            {withdraws.filter(w => !w.status || w.status === 'Pending').length} Pending
          </span>
          <button 
            onClick={loadWithdrawRequests} 
            className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-bold transition text-[10px]"
          >
            🔄 রিফ্রেশ ডাটা
          </button>
        </div>
      </div>

      {/* রিয়াল লাইভ উইথড্র টেবিল */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-wider">
              <th className="p-4">ইউজার UID / ইমেইল</th>
              <th className="p-4">পেমেন্ট মেথড</th>
              <th className="p-4">অ্যাকাউন্ট নাম্বার</th>
              <th className="p-4">টাকার পরিমাণ</th>
              <th className="p-4">কারেন্ট স্ট্যাটাস</th>
              <th className="p-4 text-center">অ্যাকশন বাটন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
            {withdraws.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-600 font-bold uppercase tracking-wide">
                  কোনো উইথড্র রিকোয়েস্ট পাওয়া যায়নি বস!
                </td>
              </tr>
            ) : (
              withdraws.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-950/20 transition">
                  <td className="p-4 font-mono font-bold text-violet-400">{item.uid}</td>
                  <td className="p-4 uppercase font-black text-indigo-400 text-[10px]">{item.method}</td>
                  <td className="p-4 font-mono font-bold text-slate-200 tracking-wide">{item.number}</td>
                  <td className="p-4 font-black text-emerald-400 text-sm">{item.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${
                      item.status === 'Paid' 
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                        : item.status === 'Cancelled'
                        ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' 
                        : 'bg-amber-500/5 text-amber-400 border-amber-500/20 animate-pulse'
                    }`}>
                      {item.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    {(!item.status || item.status === 'Pending') ? (
                      <>
                        <button 
                          type="button" 
                          onClick={() => handleWithdrawAction(item.row || (idx + 2), 'Paid')} 
                          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl shadow-md transition active:scale-95"
                        >
                          Paid ✓
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleWithdrawAction(item.row || (idx + 2), 'Cancelled')} 
                          className="bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 px-3 py-1.5 rounded-xl font-bold transition border border-slate-700/50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-500 italic font-bold text-[10px]">পেমেন্ট ক্লোজড</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
