'use client';

import { useState, useEffect } from 'react';

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // এডিট মডাল স্টেটসমূহ
  const [selectedWorker, setSelectedWorker] = useState(null); 
  const [editForm, setEditForm] = useState({ amountToAdd: '', email: '', password: '' });

  // গুগল শিটের Users ট্যাব থেকে সমস্ত ওয়ার্কারের ডাটা লোড করা
  const loadWorkersData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      
      if (!data.error) {
        // নোট: যদি এপিআই থেকে সরাসরি লাইভ শিটের ওয়ার্কার লিস্ট আসে তবে সেটা সেট হবে, 
        // ব্যাকআপ হিসেবে ৩টি ডেমো অ্যাকাউন্ট দিয়ে স্ট্রাকচার লক করে দেওয়া হলো
        setWorkers(data.workers || [
          { uid: 'uid_884732', name: 'Sojib Sheikh', email: 'sojib@gmail.com', password: 'pass123', totalIncome: 1250, weeklyIncome: 350, monthlyIncome: 980, joinedDate: '06/01' },
          { uid: 'uid_992143', name: 'Rahat Khan', email: 'rahat@gmail.com', password: 'rahat9900', totalIncome: 450, weeklyIncome: 120, monthlyIncome: 450, joinedDate: '06/10' },
          { uid: 'uid_112045', name: 'Asif Iqbal', email: 'asif@gmail.com', password: 'asif#secure', totalIncome: 2300, weeklyIncome: 850, monthlyIncome: 1950, joinedDate: '05/25' }
        ]);
      }
    } catch (err) {
      console.error('Workers page load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkersData();
  }, []);

  // 💾 ওয়ার্কারের ব্যালেন্স ও প্রোফাইল আপডেট সেভ করার লজিক
  const handleSaveWorkerChanges = async (e) => {
    e.preventDefault();
    
    const addedMoney = Number(editForm.amountToAdd) || 0;
    
    // ফ্রন্টএন্ডে ইনস্ট্যান্ট স্টেট আপডেট
    const updatedWorkers = workers.map(w => {
      if (w.uid === selectedWorker.uid) {
        return {
          ...w,
          email: editForm.email || w.email,
          password: editForm.password || w.password,
          totalIncome: w.totalIncome + addedMoney,
          monthlyIncome: w.monthlyIncome + addedMoney,
          weeklyIncome: w.weeklyIncome + addedMoney
        };
      }
      return w;
    });

    try {
      // গুগল শিটে নতুন ব্যালেন্স ও ডাটা সিঙ্ক করার জন্য রিকোয়েস্ট পাঠানো
      await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'UPDATE_WORKER_PROFILE',
          uid: selectedWorker.uid,
          addedMoney,
          email: editForm.email,
          password: editForm.password
        })
      });

      setWorkers(updatedWorkers);
      alert(`🎉 ${selectedWorker.name}-এর প্রোফাইল ও ব্যালেন্স সফলভাবে আপডেট হয়েছে!`);
      setSelectedWorker(null);
      setEditForm({ amountToAdd: '', email: '', password: '' });
    } catch (err) {
      alert('সার্ভারে সেভ করতে সমস্যা হয়েছে!');
    }
  };

  // 🔍 টাইপ করার সাথে সাথে লাইভ ফিল্টারিং মেকানিজম
  const filteredWorkers = workers.filter(worker => 
    worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    worker.uid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-16 text-slate-500 font-bold tracking-wider uppercase">গুগল শিট থেকে ওয়ার্কার ডাটাবেজ লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* 🔍 সার্চ বার কন্ট্রোল */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl max-w-sm flex items-center gap-2.5 shadow-md">
        <span className="text-slate-500 text-sm">🔍</span>
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          placeholder="নাম, ইমেইল অথবা UID লিখে লাইভ ফিল্টার করুন..." 
          className="w-full bg-transparent text-white focus:outline-none font-medium text-xs placeholder-slate-600" 
        />
      </div>

      {/* 👥 ওয়ার্কার্স মাস্টার টেবিল প্যানেল */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-800/20 border-b border-slate-800 font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
          <span>👥 নিবন্ধিত ওয়ার্কার্স তালিকা ({filteredWorkers.length})</span>
          <button onClick={loadWorkersData} className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-xl font-bold">🔄 রিফ্রেশ লিস্ট</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="p-4">UID / মেম্বার নাম</th>
                <th className="p-4">লগইন ক্রেডেনশিয়াল</th>
                <th className="p-4 text-center">সর্বমোট ইনকাম</th>
                <th className="p-4 text-center">চলতি মাস</th>
                <th className="p-4 text-center">এই সপ্তাহ</th>
                <th className="p-4 text-center">মডিফাই</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {filteredWorkers.map((worker) => (
                <tr key={worker.uid} className="hover:bg-slate-950/40 transition">
                  <td className="p-4">
                    <div className="font-mono font-black text-violet-400 text-[10px]">{worker.uid}</div>
                    <div className="text-slate-200 font-bold text-sm mt-0.5">{worker.name}</div>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px] space-y-0.5">
                    <div>M: <span className="text-slate-300">{worker.email}</span></div>
                    <div>P: <span className="text-slate-500">{worker.password}</span></div>
                  </td>
                  <td className="p-4 text-center font-black text-emerald-400 text-sm">{worker.totalIncome}৳</td>
                  <td className="p-4 text-center font-black text-indigo-400">{worker.monthlyIncome}৳</td>
                  <td className="p-4 text-center font-black text-violet-400">{worker.weeklyIncome}৳</td>
                  <td className="p-4 text-center">
                    <button 
                      type="button" 
                      onClick={() => { 
                        setSelectedWorker(worker); 
                        setEditForm({ amountToAdd: '', email: worker.email, password: worker.password }); 
                      }} 
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-3 py-2 rounded-xl font-black shadow-md transition active:scale-95"
                    >
                      Edit User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⚙️ মেগা মডাল পপ-আপ: ব্যালেন্স ও প্রোফাইল মডিফায়ার উইন্ডো */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide">⚙️ প্রোফাইল ও ব্যালেন্স মডিফায়ার</h3>
                <p className="text-[10px] text-violet-400 font-mono font-bold mt-0.5">{selectedWorker.name} ({selectedWorker.uid})</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedWorker(null)} 
                className="text-slate-400 font-bold bg-slate-950 border border-slate-800/80 px-2.5 py-1 rounded-xl text-[10px]"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveWorkerChanges} className="space-y-4 text-xs">
              
              {/* ব্যালেন্স অ্যাড ইনপুট */}
              <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                <label className="text-emerald-400 font-black block text-[10px] uppercase tracking-wider">💰 ব্যালেন্স যোগ করুন (৳)</label>
                <input 
                  type="number" 
                  placeholder="যেমন: ৫০ বা ১০০" 
                  value={editForm.amountToAdd} 
                  onChange={e => setEditForm({...editForm, amountToAdd: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-400 font-black text-sm focus:outline-none focus:border-emerald-500" 
                />
              </div>

              {/* জিমেইল এডিট */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">মেম্বার জিমেইল এড্রেস</label>
                <input 
                  type="email" 
                  required 
                  value={editForm.email} 
                  onChange={e => setEditForm({...editForm, email: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none" 
                />
              </div>

              {/* পাসওয়ার্ড এডিট */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">লগইন পাসওয়ার্ড</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.password} 
                  onChange={e => setEditForm({...editForm, password: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-mono focus:outline-none" 
                />
              </div>

              {/* কন্ট্রোল বাটন */}
              <div className="flex gap-3 pt-2 font-black">
                <button type="button" onClick={() => setSelectedWorker(null)} className="flex-1 bg-slate-800 text-slate-300 py-3.5 rounded-xl hover:bg-slate-750 transition">বাতিল</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl shadow-xl shadow-emerald-600/10 transition uppercase tracking-wide">Save Changes 💾</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
