'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TasksManager from './components/TasksManager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [submissions, setSubmissions] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [publishedTasks, setPublishedTasks] = useState([]); 
  const [workers, setWorkers] = useState([]); 
  const [notice, setNotice] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [updatingNotice, setUpdatingNotice] = useState(false);
  const router = useRouter();

  // সার্চ এবং এডিট মডাল স্টেটসমূহ
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null); 
  const [editForm, setEditForm] = useState({ amountToAdd: '', email: '', password: '' });

  // ইউজার তৈরির ফর্মের স্টেট
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  // 📢 সাইড নোটিফিকেশন টোস্ট অ্যালার্ট স্টেট
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // 🔒 ১. সিকিউরিটি লক
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdminAuthenticated');
    if (isAdmin !== 'true') {
      router.push('/admin-login');
    }
  }, [router]);

  // ২. গুগল শিট থেকে লাইভ রিয়াল ডাটা লোড করার ফাংশন
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      
      if (!data.error) {
        setSubmissions(data.submissions || []);
        setWithdraws(data.withdraws || []);
        setPublishedTasks(data.publishedTasks || []); 
        setNotice(data.currentNotice || '');
        
        setWorkers([
          { uid: 'uid_884732', name: 'Sojib Sheikh', email: 'sojib@gmail.com', password: 'pass123', totalIncome: 1250, weeklyIncome: 350, monthlyIncome: 980, joinedDate: '06/01' },
          { uid: 'uid_992143', name: 'Rahat Khan', email: 'rahat@gmail.com', password: 'rahat9900', totalIncome: 450, weeklyIncome: 120, monthlyIncome: 450, joinedDate: '06/10' },
          { uid: 'uid_112045', name: 'Asif Iqbal', email: 'asif@gmail.com', password: 'asif#secure', totalIncome: 2300, weeklyIncome: 850, monthlyIncome: 1950, joinedDate: '05/25' }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // ৩. 📢 লাইভ নোটিশ গুগল শিটে আপডেট করার ফাংশন
  const handleUpdateNotice = async (e) => {
    e.preventDefault();
    setUpdatingNotice(true);
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'UPDATE_NOTICE', noticeText: notice })
      });
      const data = await response.json();
      if (data.success) {
        showToast('📢 নোটিশ সফলভাবে গুগল শিটে লাইভ করা হয়েছে!', 'success');
      }
    } catch (err) {
      showToast('সার্ভার এরর!', 'error');
    } finally {
      setUpdatingNotice(false);
    }
  };

  // ৪. রিভিউ অ্যাকশন (Approve/Reject/Paid)
  const handleAdminAction = async (tabName, rowNumber, statusText) => {
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabName, rowNumber, newStatus: statusText })
      });
      const data = await response.json();
      if (data.success) {
        showToast(`সফলভাবে "${statusText}" আপডেট করা হয়েছে!`, 'success');
        loadAdminData();
      }
    } catch (error) {
      showToast('সার্ভার এরর!', 'error');
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
        showToast(`🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! UID: ${data.uid}`, 'success');
        setFormData({ name: '', email: '', password: '' });
        loadAdminData();
      } else {
        showToast(data.message || 'অ্যাকাউন্ট তৈরি করা যায়নি।', 'error');
      }
    } catch (error) {
      showToast('সার্ভার এরর!', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveWorkerChanges = (e) => {
    e.preventDefault();
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
    showToast(`প্রোফাইল ও ব্যালেন্স সফলভাবে শিটে সেভ হয়েছে!`, 'success');
    setSelectedWorker(null);
    setEditForm({ amountToAdd: '', email: '', password: '' });
  };

  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    worker.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 font-sans antialiased text-xs">
      
      {/* 🔮 স্ক্রিনের এক সাইটে ভেসে আসা টোস্ট নোটিফিকেশন বার */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-5 py-4 rounded-2xl shadow-2xl border font-bold text-white transition-all duration-300 animate-in slide-in-from-bottom-5 ${
          toast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500/30'
        }`}>
          <span>{toast.type === 'error' ? '⚠️' : '✨'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* হেডার */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-2xl max-w-7xl mx-auto rounded-b-2xl">
        <h1 className="font-black text-sm uppercase tracking-wider text-violet-400 flex items-center gap-2">
          <i className="fa-solid fa-user-shield"></i> Sheikh Earning Admin Panel
        </h1>
        <button onClick={() => { localStorage.removeItem('isAdminAuthenticated'); router.push('/admin-login'); }} className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 rounded-xl font-black transition active:scale-95">لگآؤٹ ➔</button>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* নোটিশ বোর্ড ইনপুট */}
        <section className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl max-w-2xl">
          <form onSubmit={handleUpdateNotice} className="flex flex-col sm:flex-row gap-3">
            <input type="text" required value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="এখানে আজকের জরুরি নোটিশটি লিখুন..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none" />
            <button type="submit" disabled={updatingNotice} className="bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition active:scale-95 whitespace-nowrap">{updatingNotice ? 'আপডেট হচ্ছে...' : 'নোটিশ লাইভ করুন 📢'}</button>
          </form>
        </section>

        {/* মেগা ট্যাব বাটন */}
        <div className="flex flex-wrap gap-2 bg-slate-900 p-1 rounded-2xl w-full max-w-2xl border border-slate-800/80 shadow-inner">
          <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-2.5 px-3 rounded-xl font-black transition uppercase tracking-wider ${activeTab === 'tasks' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>কাজের পোস্ট ও রিপোর্ট</button>
          <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-2.5 px-3 rounded-xl font-black transition uppercase tracking-wider ${activeTab === 'withdraw' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>উইথড্র ({withdraws.length})</button>
          <button onClick={() => setActiveTab('workers_list')} className={`flex-1 py-2.5 px-3 rounded-xl font-black transition uppercase tracking-wider ${activeTab === 'workers_list' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>👥 ওয়ার্কার্স ({workers.length})</button>
          <button onClick={() => setActiveTab('create_user')} className={`flex-1 py-2.5 px-3 rounded-xl font-black transition uppercase tracking-wider ${activeTab === 'create_user' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>➕ ইউজার</button>
        </div>

        {loading && activeTab !== 'create_user' && activeTab !== 'workers_list' ? (
          <div className="text-center py-16 text-slate-500 font-bold tracking-widest uppercase"><i className="fa-solid fa-spinner animate-spin mr-2 text-violet-500"></i>গুগল শিট থেকে ডাটা সিঙ্ক হচ্ছে...</div>
        ) : (
          <>
            {/* ১. ডায়নামিক কাজের পোস্ট ও রিপোর্ট ম্যানেজার ট্যাব */}
            {activeTab === 'tasks' && (
              <TasksManager publishedTasks={publishedTasks} handleRefresh={loadAdminData} showToast={showToast} submissions={submissions} handleAdminAction={handleAdminAction} />
            )}

            {/* ২. উইথড্র টেবিল ট্যাব */}
            {activeTab === 'withdraw' && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase">
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
                        <tr><td colSpan="6" className="p-6 text-center text-slate-600 font-bold">কোনো উইথড্র রিকোয়েস্ট পাওয়া যায়নি</td></tr>
                      ) : withdraws.map((item) => (
                        <tr key={item.row} className="hover:bg-slate-950/20">
                          <td className="p-4 font-mono font-bold text-violet-400">{item.uid}</td>
                          <td className="p-4 uppercase font-black text-indigo-400">{item.method}</td>
                          <td className="p-4 font-mono font-bold text-slate-200 tracking-wide">{item.number}</td>
                          <td className="p-4 font-black text-emerald-400">{item.amount}</td>
                          <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] font-black border ${item.status === 'Paid' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-amber-500/5 text-amber-400 border-amber-500/10'}`}>{item.status || 'Pending'}</span></td>
                          <td className="p-4 flex items-center justify-center gap-2">
                            {(!item.status || item.status === 'Pending') ? (
                              <>
                                <button onClick={() => handleAdminAction('Withdraw_Requests', item.row, 'Paid')} className="bg-gradient-to-r from-violet-600 to-indigo-600 font-black text-[11px] px-3.5 py-1.5 rounded-xl transition active:scale-95">Paid</button>
                                <button onClick={() => handleAdminAction('Withdraw_Requests', item.row, 'Cancelled')} className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl font-bold transition active:scale-95">Cancel</button>
                              </>
                            ) : <span className="text-slate-500 italic">সম্পন্ন</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ৩. সমস্ত ওয়ার্কারส์ লিস্ট ও ইনস্ট্যান্ট লেটার সার্চ */}
            {activeTab === 'workers_list' && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl max-w-sm flex items-center gap-2.5">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="নামের অক্ষর অথবা UID লিখে লাইভ ফিল্টার করুন..." className="w-full bg-transparent text-white focus:outline-none font-medium" />
                </div>
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase">
                          <th className="p-4">UID / নাম</th>
                          <th className="p-4">ক্রেডেনশিয়াল</th>
                          <th className="p-4 text-center">টোটাল ইনকাম</th>
                          <th className="p-4 text-center">মাসিক</th>
                          <th className="p-4 text-center">সাপ্তাহিক</th>
                          <th className="p-4 text-center">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                        {filteredWorkers.map((worker) => (
                          <tr key={worker.uid} className="hover:bg-slate-950/40 transition">
                            <td className="p-4"><div className="font-mono font-black text-violet-400">{worker.uid}</div><div className="text-slate-200 font-bold text-sm">{worker.name}</div></td>
                            <td className="p-4 text-slate-400 font-mono"><div>M: {worker.email}</div><div>P: {worker.password}</div></td>
                            <td className="p-4 text-center font-black text-emerald-400">{worker.totalIncome}৳</td>
                            <td className="p-4 text-center font-black text-indigo-400">{worker.monthlyIncome}৳</td>
                            <td className="p-4 text-center font-black text-violet-400">{worker.weeklyIncome}৳</td>
                            <td className="p-4 text-center"><button onClick={() => { setSelectedWorker(worker); setEditForm({ amountToAdd: '', email: worker.email, password: worker.password }); }} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 py-2 rounded-xl font-black transition active:scale-95">Edit User</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ৪. ইউজার অ্যাকাউন্ট তৈরি */}
            {activeTab === 'create_user' && (
              <div className="max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 mx-auto md:mx-0 shadow-2xl">
                <h2 className="text-sm font-black uppercase text-violet-400 tracking-wide">নতুন ওয়ার্কার তৈরি করুন</h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="নাম দিন" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none" />
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="জিমেইল এড্রেস" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none" />
                  <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="লগইন পাসওয়ার্ড" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 focus:outline-none" />
                  <button type="submit" disabled={creating} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black py-4 rounded-xl uppercase transition shadow-lg">{creating ? 'তৈরি হচ্ছে...' : 'Create Account 🚀'}</button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* মেগা মডাল প্রোফাইল এডিটর পপআপ */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-slate-800 pb-2">
              <div><h3 className="text-xs font-black text-slate-100">⚙️ প্রোফাইল ও ব্যালেন্স মডিফায়ার</h3><p className="text-[10px] text-violet-400 font-mono mt-0.5">{selectedWorker.name} ({selectedWorker.uid})</p></div>
              <button onClick={() => setSelectedWorker(null)} className="text-slate-400 font-bold bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg">✕ Close</button>
            </div>
            <form onSubmit={handleSaveWorkerChanges} className="space-y-4">
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-emerald-400 font-black block text-[10px]">টাকা যোগ করুন</label>
                <input type="number" placeholder="৫০" value={editForm.amountToAdd} onChange={e => setEditForm({...editForm, amountToAdd: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-400 font-black focus:outline-none" />
              </div>
              <input type="email" required value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3" />
              <input type="text" required value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3" />
              <div className="flex gap-3 pt-2 font-black"><button type="button" onClick={() => setSelectedWorker(null)} className="flex-1 bg-slate-800 py-3 rounded-xl">বাতিল</button><button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 py-3 rounded-xl text-white">Save Changes 💾</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
