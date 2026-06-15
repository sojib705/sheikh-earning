'use client';

import { useState, useEffect } from 'react';

export default function WorkerWithdrawPage() {
  const [withdraws, setWithdraws] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ফর্ম স্টেট
  const [method, setMethod] = useState('bkash');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');

  // গুগল শিট থেকে ডাটা ও কারেন্ট ব্যালেন্স লোড করার ফাংশন
  const loadWithdrawData = async () => {
    try {
      setLoading(true);
      const savedEmail = localStorage.getItem('workerEmail');
      if (!savedEmail) return;

      // ১. ব্যালেন্স সিঙ্ক করার জন্য মেম্বার ডাটা রিড করা
      const resData = await fetch('/api/fetch-data', { method: 'GET' });
      const data = await resData.json();
      
      if (data && data.workers) {
        const current = data.workers.find(
          (w) => w.email?.trim().toLowerCase() === savedEmail.trim().toLowerCase()
        );
        if (current) {
          setCurrentBalance(Number(current.balance) || 0);
        }
      }

      // ২. উইথড্র রিকোয়েস্ট ট্যাব থেকে ডাটা রিড করা
      const resAdmin = await fetch('/api/admin-action', { method: 'GET' });
      const adminData = await resAdmin.json();
      
      if (!adminData.error && adminData.withdraws) {
        // কেবল এই নির্দিষ্ট ইউজারের ইমেইল বা ইউজার আইডির সাথে মিলিয়ে ডাটা ফিল্টার হবে
        const workerEmailLower = savedEmail.trim().toLowerCase();
        const myWithdraws = adminData.withdraws.filter(
          (item) => item.uid?.trim().toLowerCase() === workerEmailLower || item.workerEmail?.trim().toLowerCase() === workerEmailLower
        );
        setWithdraws(myWithdraws);
      }
    } catch (err) {
      console.error('Withdraw page data sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawData();
  }, []);

  // 🚀 টাকা তোলার রিকোয়েস্ট গুগল শিটে পাঠানোর লজিক
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const savedEmail = localStorage.getItem('workerEmail') || 'unknown';
    const requestAmount = Number(amount);

    // 🔒 লাইভ সিকিউরিটি গার্ড লক
    if (requestAmount > currentBalance) {
      alert('⚠️ আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই বস!');
      return;
    }
    if (requestAmount < 10) {
      alert('⚠️ সর্বনিম্ন উইথড্র ১০ টাকা ভাই!');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabName: 'Withdraw_Requests',
          rowNumber: Date.now(), 
          newStatus: 'Pending',
          actionType: 'SUBMIT_WITHDRAW_REQUEST', // ব্যাকএন্ডে অ্যাপেন্ড করার কাস্টম হুক
          payload: [
            savedEmail,
            method,
            number.trim(),
            requestAmount + '৳',
            new Date().toLocaleDateString('bn-BD'),
            'Pending'
          ]
        })
      });

      alert('🎉 পেমেন্ট রিকোয়েস্ট সফলভাবে অ্যাডমিন প্যানেলে পাঠানো হয়েছে!');
      setNumber('');
      setAmount('');
      loadWithdrawData(); // ডাটা ও নতুন ব্যালেন্স ইনস্ট্যান্ট রিলোড করা
    } catch (err) {
      alert('রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-bold">উইথড্র পোর্টাল ও হিস্ট্রি সিঙ্ক হচ্ছে...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto text-xs animate-in fade-in duration-200">
      
      {/* 💳 বামপাশে: টাকা তোলার ফর্ম */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl h-fit">
        <h3 className="text-xs font-black uppercase text-violet-400 tracking-wider mb-4">💰 টাকা উত্তোলনের ফর্ম</h3>
        
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          
          {/* পেমেন্ট মেথড */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">পেমেন্ট মেথড সিলেক্ট করুন</label>
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-bold focus:outline-none focus:border-violet-500"
            >
              <option value="bkash">বিকাশ (Personal)</option>
              <option value="nagad">নগদ (Personal)</option>
              <option value="roket">রকেট (Personal)</option>
            </select>
          </div>

          {/* নাম্বার ইনপুট */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">আপনার পার্সোনাল অ্যাকাউন্ট নাম্বার</label>
            <input 
              type="tel" 
              required 
              maxLength="11"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="017XXXXXXXX" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-mono tracking-wider focus:outline-none focus:border-violet-500" 
            />
          </div>

          {/* টাকার পরিমাণ */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">টাকার পরিমাণ (টাকা ৳)</label>
            <input 
              type="number" 
              required 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="সর্বনিম্ন ১০ টাকা" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-mono font-black focus:outline-none focus:border-violet-500" 
            />
            <p className="text-[10px] text-slate-500 font-bold mt-1">আপনার উইথড্রযোগ্য ব্যালেন্স: {currentBalance}৳</p>
          </div>

          {/* সাবমিট বাটন (ব্যালেন্সের চেয়ে অ্যামাউন্ট বেশি হলে অটো ডিজেবল থাকবে) */}
          <button 
            type="submit" 
            disabled={submitting || !amount || Number(amount) > currentBalance || Number(amount) <= 0}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black py-4 rounded-xl uppercase tracking-wider transition active:scale-95 shadow-lg"
          >
            {submitting ? 'প্রসেস হচ্ছে...' : Number(amount) > currentBalance ? '❌ পর্যাপ্ত ব্যালেন্স নেই' : 'উইথড্র রিকোয়েস্ট পাঠান ➔'}
          </button>
        </form>
      </div>

      {/* 📝 ডানপাশে: পেমেন্ট হিস্ট্রি টেবিল */}
      <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden h-fit shadow-2xl">
        <div className="p-4 bg-slate-800/20 border-b border-slate-800 font-black text-slate-400 uppercase tracking-wider">আপনার জেনারেট করা পেমেন্ট হিস্ট্রি</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="p-4">তারিখ</th>
                <th className="p-4">মেথড</th>
                <th className="p-4">নাম্বার</th>
                <th className="p-4">পরিমাণ</th>
                <th className="p-4 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {withdraws.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-600 font-bold uppercase tracking-wide">আপনি আগে কোনো টাকা উত্তোলন করেননি বস!</td></tr>
              ) : withdraws.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-950/40 transition">
                  <td className="p-4 font-mono font-bold text-slate-400">{item.date || new Date().toLocaleDateString('bn-BD')}</td>
                  <td className="p-4 uppercase font-black text-indigo-400">{item.method}</td>
                  <td className="p-4 tracking-wider font-mono text-slate-200">{item.number}</td>
                  <td className="p-4 font-black text-emerald-400 text-sm">{item.amount}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${
                      item.status === 'Paid' 
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                        : item.status === 'Cancelled'
                        ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' 
                        : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
