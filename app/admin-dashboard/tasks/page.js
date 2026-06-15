'use client';

import { useState, useEffect } from 'react';

export default function AdminTasksPage() {
  const [publishedTasks, setPublishedTasks] = useState([]); 
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // কাজের পোস্ট করার ফর্ম স্টেট
  const [taskForm, setTaskForm] = useState({ title: '', description: '', price: '', limit: '' });
  const [publishing, setPublishing] = useState(false);

  // গুগল শিট থেকে ডাটা রিফ্রেশ করার লোকাল ইঞ্জিন
  const loadTasksAndReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      
      if (!data.error) {
        setSubmissions(data.submissions || []);
        setPublishedTasks(data.publishedTasks || []); 
      }
    } catch (err) {
      console.error('Tasks page load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasksAndReports();
  }, []);

  // 🚀 নতুন ফেসবুক আইডি কাজ শিটে পাবলিশ করার লজিক
  const handlePublishTask = async (e) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'PUBLISH_TASK',
          taskData: { 
            title: taskForm.title,
            description: taskForm.description,
            price: taskForm.price,
            limit: taskForm.limit,
            formatFields: ['UID', 'PASSWORD', '2FA', 'MAIL', 'COOKIE']
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('🚀 নতুন কাজ সফলভাবে গুগল শিটে পাবলিশ হয়েছে!');
        setTaskForm({ title: '', description: '', price: '', limit: '' });
        loadTasksAndReports(); 
      }
    } catch (err) {
      alert('কাজ পাবলিশ করতে সমস্যা হয়েছে!');
    } finally {
      setPublishing(false);
    }
  };

  // 🗑️ একটিভ কাজ ডিলিট করার লজিক
  const handleDeleteTask = async (row) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই কাজটি চিরতরে ডিলিট করতে চান?')) return;
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'DELETE_TASK', row })
      });
      const data = await response.json();
      if (data.success) {
        alert('কাজটি সফলভাবে ডিলিট করা হয়েছে!');
        loadTasksAndReports();
      }
    } catch (err) {
      alert('ডিলিট করা যায়নি!');
    }
  };

  // 📝 ওয়ার্কার সাবমিশন রিপোর্ট রিভিউ অ্যাকশন (Approve/Reject)
  const handleAdminAction = async (tabName, rowNumber, statusText) => {
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabName, rowNumber, newStatus: statusText })
      });
      const data = await response.json();
      if (data.success) {
        alert(`সফলভাবে "${statusText}" আপডেট করা হয়েছে!`);
        loadTasksAndReports();
      }
    } catch (error) {
      alert('স্ট্যাটাস আপডেট করা যায়নি!');
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500 font-bold tracking-wider uppercase">গুগল শিট থেকে কাজের ডাটা লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 📢 উপরের অংশ: নতুন কাজ পোস্ট এবং এক্টিভ লিস্ট গ্রিড */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ক) কাজের পোস্ট ফর্ম */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl h-fit">
          <h3 className="text-xs font-black uppercase text-violet-400 tracking-wider mb-4">📢 নতুন কাজের পোস্ট করুন</h3>
          <form onSubmit={handlePublishTask} className="space-y-4">
            <input type="text" required placeholder="কাজের শিরোনাম" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500 font-medium" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" required placeholder="রেট ৳" value={taskForm.price} onChange={e => setTaskForm({...taskForm, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500" />
              <input type="number" required placeholder="লিমিট" value={taskForm.limit} onChange={e => setTaskForm({...taskForm, limit: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500" />
            </div>
            <textarea required placeholder="কাজের বিবরণ বা নিয়মাবলী..." value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 h-24 text-white focus:outline-none focus:border-violet-500 resize-none" />
            <button type="submit" disabled={publishing} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black py-4 rounded-xl uppercase tracking-wider transition active:scale-95 shadow-lg shadow-indigo-600/10">
              {publishing ? 'পাবলিশ হচ্ছে...' : 'পাবলিশ জব পোস্ট 🚀'}
            </button>
          </form>
        </div>

        {/* খ) এক্টিভ কাজের তালিকা টেবিল */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden h-fit shadow-2xl">
          <div className="p-4 bg-slate-800/20 border-b border-slate-800 font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
            <span>রানিং কাজের তালিকা (লাইভ গুগল শিট সিরিয়াল)</span>
            <span className="bg-slate-950 px-2.5 py-1 rounded-lg text-amber-400 font-mono font-bold text-[10px]">{publishedTasks.length} Active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                  <th className="p-4">তারিখ</th>
                  <th className="p-4">কাজের নাম</th>
                  <th className="p-4">রেট</th>
                  <th className="p-4">লিমিট বাকি</th>
                  <th className="p-4 text-center">কন্ট্রোল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                {publishedTasks.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-600 font-bold uppercase">কোনো একটিভ কাজ পাওয়া যায়নি!</td></tr>
                ) : publishedTasks.map((task) => (
                  <tr key={task.row} className="hover:bg-slate-950/40 transition">
                    <td className="p-4 font-mono font-bold text-amber-400">{task.date}</td>
                    <td className="p-4 font-bold text-slate-200">{task.title}</td>
                    <td className="p-4 font-black text-emerald-400">{task.price}৳</td>
                    <td className="p-4 font-bold text-slate-400">{task.limit} টি</td>
                    <td className="p-4 text-center">
                      <button type="button" onClick={() => handleDeleteTask(task.row)} className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 rounded-xl font-black transition border border-rose-500/10">✕ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 📝 নিচের অংশ: ওয়ার্কারদের সাবমিট করা রিপোর্ট তালিকা */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-800/20 border-b border-slate-800 font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
          <span>ওয়ার্কারদের সাবমিট করা ফেসবুক আইডি রিপোর্ট তালিকা</span>
          <button onClick={loadTasksAndReports} className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-800 transition">🔄 রিফ্রেশ রিপোর্ট</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="p-4">ইউজার UID / ইমেইল</th>
                <th className="p-4">কাজের ক্যাটাগরি</th>
                <th className="p-4">টাকার পরিমাণ</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-center">অ্যাকশন কন্ট্রোল</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {submissions.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-600 font-bold">কোনো কাজের সাবমিশন রিপোর্ট এভেলেবল নেই</td></tr>
              ) : submissions.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-950/20">
                  <td className="p-4 font-mono font-bold text-violet-400">{item.uid}</td>
                  <td className="p-4 font-bold text-slate-200">{item.task}</td>
                  <td className="p-4 font-black text-emerald-400">{item.price}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      item.status === 'Approved' 
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                        : item.status === 'Reject' || item.status === 'Rejected'
                        ? 'bg-rose-500/5 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    {(!item.status || item.status === 'Pending') ? (
                      <>
                        <button type="button" onClick={() => handleAdminAction('Work_Submissions', item.row || (idx + 2), 'Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-black shadow-md transition active:scale-95">Approve</button>
                        <button type="button" onClick={() => handleAdminAction('Work_Submissions', item.row || (idx + 2), 'Reject')} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl font-black shadow-md transition active:scale-95">Reject</button>
                      </>
                    ) : <span className="text-slate-500 italic font-bold">রিভিউ সম্পন্ন</span>}
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
