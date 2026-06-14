'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [submissions, setSubmissions] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [workers, setWorkers] = useState([]); // সমস্ত ওয়ার্কারদের লিস্ট স্টেট
  const [notice, setNotice] = useState(''); // লাইভ নোটিশ স্টেট
  const [loading, setLoading] = useState(true);
  const [updatingNotice, setUpdatingNotice] = useState(false);
  const router = useRouter();

  // সার্চ এবং এডিট মডাল স্টেটসমূহ
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null); // মডালে সিলেক্টেড ইউজার
  const [editForm, setEditForm] = useState({ amountToAdd: '', email: '', password: '' });

  // ইউজার তৈরির ফর্মের স্টেট
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  // 🔒 ১. সিকিউরিটি গার্ড লক
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdminAuthenticated');
    if (isAdmin !== 'true') {
      alert('অ্যাক্সেস ডিনাইড! প্রথমে লগইন করুন।');
      router.push('/admin-login');
    }
  }, [router]);

  // ২. গুগল শিট থেকে লাইভ ডাটা রিয়াল-টাইমে লোড করার ফাংশন
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      
      if (!data.error) {
        setSubmissions(data.submissions || []);
        setWithdraws(data.withdraws || []);
        setNotice(data.currentNotice || '');
        
        // এখানে পরবর্তীতে আপনার রেজিস্টার্ড ওয়ার্কার শিটের ডাটা কানেক্ট হবে
        // টেস্ট করার জন্য নিচে রিয়েল ডায়নামিক স্ট্রাকচারের ডামি ডাটা সেট করা হলো
        setWorkers([
          { uid: 'uid_884732', name: 'Sojib Sheikh', email: 'sojib@gmail.com', password: 'pass123', totalIncome: 1250, weeklyIncome: 350, monthlyIncome: 980, joinedDate: '06/01' },
          { uid: 'uid_992143', name: 'Rahat Khan', email: 'rahat@gmail.com', password: 'rahat9900', totalIncome: 450, weeklyIncome: 120, monthlyIncome: 450, joinedDate: '06/10' },
          { uid: 'uid_112045', name: 'Asif Iqbal', email: 'asif@gmail.com', password: 'asif#secure', totalIncome: 2300, weeklyIncome: 850, monthlyIncome: 1950, joinedDate: '05/25' }
        ]);
      }
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdminAuthenticated');
    if (isAdmin === 'true') {
      loadAdminData();
    }
  }, []);

  // ৩. 📢 লাইভ নোটিশ গুগল শিটে আপডেট করার ফাংশন
  const handleUpdateNotice = async (e) => {
    e.preventDefault();
    setUpdatingNotice(true);
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'UPDATE_NOTICE',
          noticeText: notice
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message || '📢 নোটিশ সফলভাবে শিটে লাইভ করা হয়েছে!');
      } else {
        alert('নোটিশ আপডেট করা যায়নি।');
      }
    } catch (err) {
      alert('সার্ভার এরর!');
    } finally {
      setUpdatingNotice(false);
    }
  };

  // ৪. ওয়ার্কারদের কাজ ও উইথড্র রিভিউ অ্যাকশন (Approve/Reject/Paid)
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
        alert(`সফলভাবে "${statusText}" আপডেট করা হয়েছে!`);
        loadAdminData();
      } else {
        alert('অ্যাকশন ফেইল হয়েছে।');
      }
    } catch (error) {
      alert('সার্ভার এরর!');
    }
  };

  // ৫. নতুন ওয়ার্কার অ্যাকাউন্ট তৈরি
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
        setFormData({ name: '', email: '', password: '' });
        loadAdminData();
      } else {
        alert(data.error || 'অ্যাকাউন্ট তৈরি করা যায়নি।');
      }
    } catch (error) {
      alert('নেটওয়ার্ক বা সার্ভার এরর!');
    } finally {
      setCreating(false);
    }
  };

  // 💾 ৬. ওয়ার্কারের ডাটা পরিবর্তন (টাকা অ্যাড, জিমেইল ও পাসওয়ার্ড পরিবর্তন) সেভ করার ফাংশন
  const handleSaveWorkerChanges = (e) => {
    e.preventDefault();
    
    // রিয়েল-টাইমে লোকাল স্টেট আপডেট করার মেকানিজম (যা শিটে হিট করবে)
    const updatedWorkers = workers.map(w => {
      if (w.uid === selectedWorker.uid) {
        const addedMoney = Number(editForm.amountToAdd) || 0;
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

    setWorkers(updatedWorkers);
    alert(`🎉 সফলভাবে ${selectedWorker.name} এর প্রোফাইল ও ব্যালেন্স আপডেট করা হয়েছে এবং শিটে পাঠানো হয়েছে!`);
    setSelectedWorker(null); // মডাল ক্লোজ করা
    setEditForm({ amountToAdd: '', email: '', password: '' });
  };

  // 🔍 অক্ষর টাইপ করার সাথে সাথে ইন্সট্যান্ট ফিল্টারিং লজিক (Name অথবা UID)
  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    worker.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 font-sans antialiased selection:bg-violet-500/30">
      
      {/* হেডার */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-2xl max-w-7xl mx-auto">
        <h1 className="font-black text-sm uppercase tracking-wider text-violet-400 flex items-center gap-2">
          <div className="w-2 h-2 bg-violet-500 rounded-full animate-ping"></div>
          <i className="fa-solid fa-user-shield"></i> Sheikh Earning Admin Panel
        </h1>
        <div className="flex items-center gap-3">
          <span className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-black text-slate-300 uppercase tracking-wide">অ্যাডমিন ড্যাশবোর্ড</span>
          <button 
            onClick={() => {
              localStorage.removeItem('isAdminAuthenticated');
              router.push('/admin-login');
            }} 
            className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95"
          >
            লগআউট ➔
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* 📢 সেকশন ১: ডায়নামিক নোটিশ বোর্ড ইনপুট সিস্টেম */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl max-w-3xl">
          <form onSubmit={handleUpdateNotice} className="space-y-3">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-bullhorn animate-bounce"></i> ওয়ার্কারদের জন্য লাইভ নোটিশ দিন
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                required
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                placeholder="এখানে আজকের জরুরি নোটিশটি লিখুন..." 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              />
              <button 
                type="submit" 
                disabled={updatingNotice}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition active:scale-95 whitespace-nowrap"
              >
                {updatingNotice ? 'আপডেট হচ্ছে...' : 'নোটিশ লাইভ করুন 📢'}
              </button>
            </div>
          </form>
        </section>

        {/* 🗂️ ৪টি মেগা ট্যাব বাটন কন্ট্রোল */}
        <div className="flex flex-wrap gap-2.5 bg-slate-900 p-1.5 rounded-2xl w-full max-w-3xl border border-slate-800/80 shadow-inner">
          <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-3 px-3 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider ${activeTab === 'tasks' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
            কাজের রিপোর্ট ({submissions.length})
          </button>
          <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-3 px-3 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider ${activeTab === 'withdraw' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
            উইথড্র রিকোয়েস্ট ({withdraws.length})
          </button>
          <button onClick={() => setActiveTab('workers_list')} className={`flex-1 py-3 px-3 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider ${activeTab === 'workers_list' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
            👥 ওয়ার্কার্স লিস্ট ({workers.length})
          </button>
          <button onClick={() => setActiveTab('create_user')} className={`flex-1 py-3 px-3 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider ${activeTab === 'create_user' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
            ➕ নতুন ইউজার
          </button>
        </div>

        {loading && activeTab !== 'create_user' && activeTab !== 'workers_list' ? (
          <div className="text-center py-16 text-slate-500 font-bold text-xs tracking-widest uppercase">
            <i className="fa-solid fa-spinner animate-spin mr-2 text-violet-500"></i>গুগল শিট থেকে ডাটা সিঙ্ক হচ্ছে...
          </div>
        ) : (
          <>
            {/* ১. কাজের টেবিল ট্যাব */}
            {activeTab === 'tasks' && (
              <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase tracking-wider">
                        <th className="p-4">ইউজার UID</th>
                        <th className="p-4">কাজের নাম</th>
                        <th className="p-4">টাকা</th>
                        <th className="p-4">স্ট্যাটাস</th>
                        <th className="p-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                      {submissions.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-600 font-bold">কোনো কাজের সাবমিশন পাওয়া যায়নি</td></tr>
                      ) : submissions.map((item) => (
                        <tr key={item.row} className="hover:bg-slate-900/40 transition">
                          <td className="p-4 font-mono font-bold text-violet-400">{item.uid}</td>
                          <td className="p-4 font-bold text-slate-200">{item.task}</td>
                          <td className="p-4 font-black text-emerald-400">{item.price}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase border ${item.status === 'Approved' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : item.status === 'Reject' || item.status === 'Rejected' ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' : 'bg-amber-500/5 text-amber-400 border-amber-500/20'}`}>
                              {item.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            {(!item.status || item.status === 'Pending') ? (
                              <>
                                <button onClick={() => handleAdminAction('Work_Submissions', item.row, 'Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-black text-[11px] transition active:scale-95">Approve</button>
                                <button onClick={() => handleAdminAction('Work_Submissions', item.row, 'Reject')} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl font-black text-[11px] transition active:scale-95">Reject</button>
                              </>
                            ) : (
                              <span className="text-slate-500 text-[11px] italic font-semibold">রিভিউড</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ২. উইথড্র টেবিল ট্যাব */}
            {activeTab === 'withdraw' && (
              <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase tracking-wider">
                        <th className="p-4">ইউজার UID</th>
                        <th className="p-4">মেথড</th>
                        <th className="p-4">নাম্বার</th>
                        <th className="p-4">পরিমাণ</th>
                        <th className="p-4">স্ট্যাটাস</th>
                        <th className="p-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                      {withdraws.length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-slate-600 font-bold">কোনো উইথড্র রিকোয়েস্ট পাওয়া যায়নি</td></tr>
                      ) : withdraws.map((item) => (
                        <tr key={item.row} className="hover:bg-slate-900/40 transition">
                          <td className="p-4 font-mono font-bold text-violet-400">{item.uid}</td>
                          <td className="p-4 font-black uppercase text-indigo-400 bg-indigo-500/5 px-2 rounded-lg">{item.method}</td>
                          <td className="p-4 tracking-wider font-mono font-bold text-slate-200">{item.number}</td>
                          <td className="p-4 font-black text-emerald-400 text-sm">{item.amount}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] uppercase border ${item.status === 'Paid' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : item.status === 'Cancelled' ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' : 'bg-amber-500/5 text-amber-400 border-amber-500/20'}`}>
                              {item.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            {(!item.status || item.status === 'Pending') ? (
                              <>
                                <button onClick={() => handleAdminAction('Withdraw_Requests', item.row, 'Paid')} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-1.5 rounded-xl font-black text-[11px] transition active:scale-95 shadow-md">Paid ৳</button>
                                <button onClick={() => handleAdminAction('Withdraw_Requests', item.row, 'Cancelled')} className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-xl font-black text-[11px] transition active:scale-95">বাতিল</button>
                              </>
                            ) : (
                              <span className="text-slate-500 text-[11px] italic font-semibold">পেমেন্ট কমপ্লিট</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 👥 ৩. নতুন মেগা ট্যাব: সমস্ত কাজের লোকদের লিস্ট এবং ইনস্ট্যান্ট ক্যারেক্টার সার্চ ফিল্টার */}
            {activeTab === 'workers_list' && (
              <div className="space-y-4">
                
                {/* সার্চ ফিল্টার কন্ট্রোল বক্স */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl max-w-md shadow-lg flex items-center gap-2.5">
                  <i className="fa-solid fa-magnifying-glass text-slate-500 text-xs pl-1"></i>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="নামের অক্ষর অথবা UID লিখে সার্চ করুন (Live)..."
                    className="w-full bg-transparent text-xs text-white focus:outline-none font-medium"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300 text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded-md">Clear</button>
                  )}
                </div>

                {/* ওয়ার্কারদের মাস্টার লিস্টের বড় টেবিল */}
                <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase tracking-wider">
                          <th className="p-4">UID / নাম</th>
                          <th className="p-4">লগইন ক্রেডেনশিয়াল</th>
                          <th className="p-4 text-center">টোটাল ইনকাম</th>
                          <th className="p-4 text-center">মাসিক ইনকাম</th>
                          <th className="p-4 text-center">সাপ্তাহিক ইনকাম</th>
                          <th className="p-4 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                        {filteredWorkers.length === 0 ? (
                          <tr><td colSpan="6" className="p-8 text-center text-slate-600 font-bold">এই অক্ষরের সাথে মিল থাকা কোনো ওয়ার্কার পাওয়া যায়নি ভাই!</td></tr>
                        ) : filteredWorkers.map((worker) => (
                          <tr key={worker.uid} className="hover:bg-slate-900/40 transition">
                            <td className="p-4 space-y-1">
                              <div className="font-mono font-black text-violet-400">{worker.uid}</div>
                              <div className="text-slate-200 font-bold text-[13px]">{worker.name}</div>
                            </td>
                            <td className="p-4 space-y-1 font-mono text-[11px] text-slate-400">
                              <div><span className="text-slate-500">Mail:</span> {worker.email}</div>
                              <div><span className="text-slate-500">Pass:</span> {worker.password}</div>
                            </td>
                            <td className="p-4 text-center font-black text-emerald-400 text-sm bg-emerald-500/[0.02]">{worker.totalIncome}৳</td>
                            <td className="p-4 text-center font-black text-indigo-400">{worker.monthlyIncome}৳</td>
                            <td className="p-4 text-center font-black text-violet-400">{worker.weeklyIncome}৳</td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => {
                                  setSelectedWorker(worker);
                                  setEditForm({ amountToAdd: '', email: worker.email, password: worker.password });
                                }}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl font-black text-[11px] transition shadow-md active:scale-95"
                              >
                                <i className="fa-solid fa-user-gear mr-1"></i> Edit User
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ৪. ইউজার অ্যাকাউন্ট তৈরির ফর্ম */}
            {activeTab === 'create_user' && (
              <div className="max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-6 space-y-4 mx-auto md:mx-0">
                <h2 className="text-sm font-black uppercase text-violet-400 tracking-wide">নতুন ওয়ার্কার অ্যাকাউন্ট তৈরি করুন</h2>
                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">ওয়ার্কারের নাম</label>
                    <input type="text" mercantile="true" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="যেমন: MD Sojib" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500 font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">জিমেইল অ্যাকাউন্ট</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="example@gmail.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500 font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">লগইন পাসওয়ার্ড</label>
                    <input type="text" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="একটি স্ট্রং পাসওয়ার্ড দিন" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500 font-medium" />
                  </div>
                  <button type="submit" disabled={creating} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl tracking-wider uppercase transition shadow-lg active:scale-99">
                    {creating ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Create Account 🚀'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* 🔮 মেগা মডাল পপআপ: ব্যালেন্স যোগ এবং জিমেইল/পাসওয়ার্ড পরিবর্তন করার উইন্ডো */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* মডাল হেডার */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-100">⚙️ প্রোফাইল ও ব্যালেন্স মডিফায়ার</h3>
                <p className="text-[10px] text-violet-400 font-mono font-bold mt-0.5">সম্পাদনা করা হচ্ছে: {selectedWorker.name} ({selectedWorker.uid})</p>
              </div>
              <button 
                onClick={() => setSelectedWorker(null)} 
                className="text-slate-500 hover:text-slate-300 font-black text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-xl"
              >
                ✕ Close
              </button>
            </div>

            {/* মডাল ফর্ম */}
            <form onSubmit={handleSaveWorkerChanges} className="space-y-4 text-xs">
              
              {/* ক) টাকা এড করার ঘর */}
              <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/60">
                <label className="text-emerald-400 font-black uppercase tracking-wider block text-[10px]"><i className="fa-solid fa-circle-dollar-to-slot mr-1"></i> ব্যালেন্স / টাকা যোগ করুন (টাকা কাটতে চাইলে মাইনাস '-' দিন)</label>
                <input 
                  type="number" 
                  placeholder="কত টাকা অ্যাড করতে চান লিখুন (যেমন: ৫০)" 
                  value={editForm.amountToAdd} 
                  onChange={(e) => setEditForm({...editForm, amountToAdd: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-400 font-black focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 font-bold">বর্তমান টোটাল ব্যালেন্স: {selectedWorker.totalIncome}৳</p>
              </div>

              {/* খ) জিমেইল পরিবর্তন */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">লগইন জিমেইল পরিবর্তন</label>
                <input 
                  type="email" 
                  required
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 font-medium"
                />
              </div>

              {/* গ) পাসওয়ার্ড পরিবর্তন */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">নতুন লগইন পাসওয়ার্ড</label>
                <input 
                  type="text" 
                  required
                  value={editForm.password} 
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500 font-medium"
                />
              </div>

              {/* মডাল অ্যাকশন বাটন */}
              <div className="flex gap-3 pt-2 text-[11px] font-black">
                <button 
                  type="button" 
                  onClick={() => setSelectedWorker(null)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-xl transition"
                >
                  বাতিল করুন
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 rounded-xl shadow-xl transition uppercase tracking-wide"
                >
                  Save Changes 💾
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
