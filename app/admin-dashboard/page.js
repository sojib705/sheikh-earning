'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [submissions, setSubmissions] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);

  // ইউজার তৈরির ফর্মের স্টেট (State)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  // ১. গুগল শিট থেকে সব ডাটা রিয়েল-টাইমে লোড করার ফাংশন
  const loadAdminData = async () => {
    try {
      setLoading(true);
      // এখানে আপনার তৈরি করা fetch-data বা ডাটা ফেচিং এপিআই কানেক্ট হবে
      
      // ডামি ডাটা (টেস্ট করার সুবিধার্থে):
      setSubmissions([
        { row: 2, date: '2026-06-14 02:30', task: '0F-2FA-HOTMAIL', uid: 'uid_884732', status: 'Pending', price: '১০৳' },
        { row: 3, date: '2026-06-14 01:15', task: '0F-2FA-HOTMAIL', uid: 'uid_110293', status: 'Approved', price: '১০৳' }
      ]);
      setWithdraws([
        { row: 2, date: '2026-06-14 11:00', method: 'বিকাশ', number: '01823315984', amount: '৫০০৳', status: 'Pending' }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // ২. বাটনে ক্লিক করলে গুগল শিটে ডাটা পাঠানোর মেইন লজিক (Approve/Reject/Paid)
  const handleAdminAction = async (tabName, rowNumber, statusText) => {
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabName: tabName,       
          rowNumber: rowNumber,   
          newStatus: statusText   
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`গুগল শিটের ${rowNumber} নম্বর লাইনে সফলভাবে "${statusText}" লেখা হয়েছে!`);
        loadAdminData(); 
      } else {
        alert('Action ফেইল হয়েছে, আবার চেষ্টা করুন।');
      }
    } catch (error) {
      console.error(error);
      alert('সার্ভার এরর!');
    }
  };

  // ৩. নতুন ইউজার অ্যাকাউন্ট তৈরি করে গুগল শিটে পাঠানোর লজিক
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        alert(`সফলভাবে অ্যাকাউন্ট তৈরি হয়েছে!\nইউজার UID: ${data.uid}`);
        setFormData({ name: '', email: '', password: '' }); // ফর্ম ফাঁকা করা
      } else {
        alert(data.error || 'অ্যাকাউন্ট তৈরি করা যায়নি।');
      }
    } catch (error) {
      alert('নেটওয়ার্ক বা সার্ভার এরর!');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-12">
      <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg">
        <h1 className="font-black text-base uppercase tracking-wider text-violet-400">Sheikh Earning Admin</h1>
        <span className="bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold">প্রধান অ্যাডমিন</span>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* ৩টি ট্যাব বাটন */}
        <div className="flex flex-wrap gap-3 bg-slate-800 p-1.5 rounded-2xl w-full max-w-xl border border-slate-700/50">
          <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${activeTab === 'tasks' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>
            ওয়ার্কারদের কাজ ({submissions.length})
          </button>
          <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${activeTab === 'withdraw' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>
            উইথড্র রিকোয়েস্ট ({withdraws.length})
          </button>
          <button onClick={() => setActiveTab('create_user')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${activeTab === 'create_user' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>
            ➕ ইউজার তৈরি করুন
          </button>
        </div>

        {loading && activeTab !== 'create_user' ? (
          <div className="text-center py-12 text-slate-400 font-bold text-sm">শিট থেকে ডাটা চেক করা হচ্ছে...</div>
        ) : (
          <>
            {/* কাজের টেবিল */}
            {activeTab === 'tasks' && (
              <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-700/30 border-b border-slate-700 text-slate-400 font-bold uppercase">
                        <th className="p-4">ইউজার UID</th>
                        <th className="p-4">কাজের নাম</th>
                        <th className="p-4">টাকা</th>
                        <th className="p-4">স্ট্যাটাস</th>
                        <th className="p-4 text-center">সিদ্ধান্ত (শিটে যা লেখা হবে)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-300">
                      {submissions.map((item) => (
                        <tr key={item.row} className="hover:bg-slate-700/20">
                          <td className="p-4 font-bold text-violet-400">{item.uid}</td>
                          <td className="p-4 font-bold">{item.task}</td>
                          <td className="p-4 font-black text-emerald-400">{item.price}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            {item.status === 'Pending' ? (
                              <>
                                <button onClick={() => handleAdminAction('Work_Submissions', item.row, 'Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition">Approve</button>
                                <button onClick={() => handleAdminAction('Work_Submissions', item.row, 'Reject')} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-bold transition">Reject</button>
                              </>
                            ) : (
                              <span className="text-slate-500 italic">রিভিউ সম্পন্ন</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* উইথড্র টেবিল */}
            {activeTab === 'withdraw' && (
              <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-700/30 border-b border-slate-700 text-slate-400 font-bold uppercase">
                        <th className="p-4">ইউজার UID</th>
                        <th className="p-4">মেথড</th>
                        <th className="p-4">নাম্বার</th>
                        <th className="p-4">পরিমাণ</th>
                        <th className="p-4">স্ট্যাটাস</th>
                        <th className="p-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-300">
                      {withdraws.map((item) => (
                        <tr key={item.row} className="hover:bg-slate-700/20">
                          <td className="p-4 font-bold text-violet-400">{item.uid}</td>
                          <td className="p-4 font-bold">{item.method}</td>
                          <td className="p-4 tracking-wider">{item.number}</td>
                          <td className="p-4 font-black text-emerald-400">{item.amount}</td>
                          <td className="p-4"><span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg font-bold">{item.status}</span></td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            {item.status === 'Pending' ? (
                              <>
                                <button onClick={() => handleAdminAction('Withdraw_Requests', item.row, 'Paid')} className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg font-bold transition">পেইড (Paid)</button>
                                <button onClick={() => handleAdminAction('Withdraw_Requests', item.row, 'Cancelled')} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg font-bold transition">বাতিল</button>
                              </>
                            ) : (
                              <span className="text-slate-500 italic">পেমেন্ট সম্পন্ন</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ইউজার অ্যাকাউন্ট তৈরির নতুন ফর্ম */}
            {activeTab === 'create_user' && (
              <div className="max-w-md bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-6 space-y-4 mx-auto md:mx-0">
                <h2 className="text-sm font-black uppercase text-violet-400 tracking-wide">নতুন ওয়ার্কার অ্যাকাউন্ট তৈরি করুন</h2>
                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">ওয়ার্কারের নাম</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="যেমন: MD Sojib" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">জিমেইল অ্যাকাউন্ট</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="example@gmail.com" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">লগইন পাসওয়ার্ড</label>
                    <input type="text" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="একটি স্ট্রং পাসওয়ার্ড দিন" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500" />
                  </div>
                  <button type="submit" disabled={creating} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-3.5 rounded-xl tracking-wider uppercase transition shadow-lg">
                    {creating ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Create Account 🚀'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
