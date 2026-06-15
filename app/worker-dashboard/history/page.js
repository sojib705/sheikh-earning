'use client';

import { useState, useEffect } from 'react';

export default function WorkerHistoryPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // অল, পেন্ডিং, অ্যাপ্রুভড, রিজেক্টেড ফিল্টার স্টেট

  // গুগল শিটের Work_Submissions ট্যাব থেকে এই নির্দিষ্ট ওয়ার্কারের ডাটা রিড করা
  const loadWorkerHistory = async () => {
    try {
      setLoading(true);
      const savedEmail = localStorage.getItem('workerEmail');
      if (!savedEmail) return;

      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      
      if (!data.error && data.submissions) {
        // 🎯 [মোস্ট ক্রিশিয়াল ফিল্টার]: আপনার এপিআই-তে থাকা UID বা মেম্বার ইমেইলের সাথে ম্যাচ করে ডাটা আলাদা করা
        // এখানে ওয়ার্কারের সাবমিশন লিস্ট থেকে কেবল কারেন্ট ইউজারের কাজগুলো ফিল্টার হবে
        // (যদি আপনার শিটে ইমেইল কলাম থাকে, তবে ইমেইল দিয়ে; নতুবা অ্যাকাউন্ট UID দিয়ে ম্যাচ করবে)
        const workerEmailLower = savedEmail.trim().toLowerCase();
        
        // এখানে কারেন্ট ওয়ার্কারের ডাটা ফিল্টার করা হচ্ছে
        const mySubmissions = data.submissions.filter(
          (item) => item.uid?.trim().toLowerCase() === workerEmailLower || item.workerEmail?.trim().toLowerCase() === workerEmailLower
        );
        
        setSubmissions(mySubmissions);
      }
    } catch (err) {
      console.error('History data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerHistory();
  }, []);

  // কুইক ফিল্টারিং লজিক (ট্যাব বাটনে চাপ দিলে ইনস্ট্যান্ট ফিল্টার হবে)
  const filteredSubmissions = submissions.filter((item) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return !item.status || item.status === 'Pending';
    if (filterStatus === 'approved') return item.status === 'Approved';
    if (filterStatus === 'rejected') return item.status === 'Reject' || item.status === 'Rejected';
    return true;
  });

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-bold">আপনার কাজের হিস্ট্রি সিঙ্ক হচ্ছে ভাই...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs animate-in fade-in duration-200">
      
      {/* 📊 হেডার সামারি কার্ড বোর্ড */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">মোট সাবমিট</span>
          <span className="font-mono font-black text-base text-violet-400">{submissions.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">অ্যাপ্রুভড (Paid)</span>
          <span className="font-mono font-black text-base text-emerald-400">
            {submissions.filter(s => s.status === 'Approved').length}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">রিজেক্টেড</span>
          <span className="font-mono font-black text-base text-rose-400">
            {submissions.filter(s => s.status === 'Reject' || s.status === 'Rejected').length}
          </span>
        </div>
      </div>

      {/* 🎛️ সাব-ফিল্টার কন্ট্রোল বাটন */}
      <div className="flex gap-2 bg-slate-900 p-1 rounded-xl w-full max-w-sm border border-slate-800">
        <button onClick={() => setFilterStatus('all')} className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold tracking-wide transition ${filterStatus === 'all' ? 'bg-slate-800 text-white font-black shadow-md' : 'text-slate-400'}`}>All</button>
        <button onClick={() => setFilterStatus('pending')} className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold tracking-wide transition ${filterStatus === 'pending' ? 'bg-amber-500/10 text-amber-400 font-black' : 'text-slate-400'}`}>Pending</button>
        <button onClick={() => setFilterStatus('approved')} className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold tracking-wide transition ${filterStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 font-black' : 'text-slate-400'}`}>Approved</button>
        <button onClick={() => setFilterStatus('rejected')} className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold tracking-wide transition ${filterStatus === 'rejected' ? 'bg-rose-500/10 text-rose-400 font-black' : 'text-slate-400'}`}>Rejected</button>
      </div>

      {/* 📝 হিস্ট্রি মেইন মাস্টার টেবিল */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-800/20 border-b border-slate-800 font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
          <span>আপনার ব্যক্তিগত কাজের ইতিহাস</span>
          <button onClick={loadWorkerHistory} className="bg-slate-950 border border-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-bold transition">🔄 রিফ্রেশ ডাটা</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                <th className="p-4">কাজের বিবরণ / টাইটেল</th>
                <th className="p-4 text-center">ইনকাম রেট</th>
                <th className="p-4 text-center">রিভিউ রিপোর্ট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-600 font-bold uppercase tracking-wide">
                    {filterStatus === 'all' ? 'আপনি এখনো কোনো কাজ সাবমিট করেননি বস!' : 'এই ক্যাটাগরিতে কোনো কাজের রেকর্ড নেই ভাই!'}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/40 transition">
                    <td className="p-4 space-y-0.5">
                      <div className="text-slate-200 font-bold text-[12px]">{item.task}</div>
                      <div className="text-[10px] text-slate-500 font-mono">UID: {item.uid || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-center font-black text-emerald-400 text-sm">{item.price}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase border tracking-wider inline-block ${
                        item.status === 'Approved' 
                          ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-md shadow-emerald-500/[0.02]' 
                          : item.status === 'Reject' || item.status === 'Rejected'
                          ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' 
                          : 'bg-amber-500/5 text-amber-400 border-amber-500/20 animate-pulse'
                      }`}>
                        {item.status === 'Approved' ? '✓ Approved' : item.status === 'Reject' || item.status === 'Rejected' ? '✕ Rejected' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
