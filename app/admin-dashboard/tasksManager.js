'use client';
import { useState } from 'react';

export default function TasksManager({ publishedTasks, handleRefresh, showToast }) {
  const [taskForm, setTaskForm] = useState({ title: '', description: '', price: '', limit: '' });
  const [loading, setLoading] = useState(false);

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'PUBLISH_TASK',
          taskData: { ...taskForm, formatFields: ['UID', 'PASSWORD', '2FA', 'MAIL', 'COOKIE'] }
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('🚀 নতুন কাজ সফলভাবে সিরিয়াল অনুযায়ী পাবলিশ হয়েছে!', 'success');
        setTaskForm({ title: '', description: '', price: '', limit: '' });
        handleRefresh(); // রিয়েল-টাইমে পেজ রিফ্রেশ করে শিটের ডাটা আনা
      }
    } catch (err) {
      showToast('সার্ভার এরর!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই কাজটি ডিলিট করতে চান?')) return;
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'DELETE_TASK', row })
      });
      const data = await response.json();
      if (data.success) {
        showToast('কাজটি সফলভাবে ডিলিট করা হয়েছে!', 'success');
        handleRefresh(); // রিয়েল-টাইমে রিমুভ করে দেওয়া
      }
    } catch (err) {
      showToast('ডিলিট করা যায়নি।', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
      
      {/* নতুন কাজ পোস্ট করার ফর্ম */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl h-fit">
        <h3 className="text-xs font-black uppercase text-violet-400 tracking-wider mb-4">📢 নতুন কাজের পোস্ট করুন</h3>
        <form onSubmit={handlePublish} className="space-y-4">
          <input type="text" required placeholder="কাজের শিরোনাম (যেমন: Facebook ID Buy)" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500" />
          <input type="number" required placeholder="কাজের রেট/টাকা (যেমন: ১৫)" value={taskForm.price} onChange={e => setTaskForm({...taskForm, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500" />
          <input type="number" required placeholder="কাজের লিমিট / আইডি সংখ্যা (যেমন: ১০০)" value={taskForm.limit} onChange={e => setTaskForm({...taskForm, limit: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500" />
          <textarea required placeholder="কাজের নিয়মাবলী লিখুন..." value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 h-24 text-white focus:outline-none focus:border-violet-500" />
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black py-3.5 rounded-xl uppercase tracking-wider transition active:scale-95">
            {loading ? 'পাবলিশ হচ্ছে...' : 'পাবলিশ জব পোস্ট 🚀'}
          </button>
        </form>
      </div>

      {/* রানিং কাজের তালিকা নিয়ন্ত্রণ টেবিল (এখানে কোনো ডেমো ডাটা থাকবে না) */}
      <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden h-fit">
        <div className="p-4 bg-slate-800/20 border-b border-slate-800 font-black text-slate-400 uppercase tracking-wider">রানিং কাজের তালিকা (লাইভ গুগল শিট)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                <th className="p-4">তারিখ</th>
                <th className="p-4">কাজের নাম</th>
                <th className="p-4">রেট</th>
                <th className="p-4">লিমিট</th>
                <th className="p-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {!publishedTasks || publishedTasks.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-600 font-bold uppercase tracking-wide">কোনো একটিভ কাজ নেই! অ্যাডমিন প্যানেল থেকে পোস্ট করুন।</td></tr>
              ) : publishedTasks.map((task) => (
                <tr key={task.row} className="hover:bg-slate-900/40 transition">
                  <td className="p-4 font-mono font-bold text-amber-400">{task.date}</td>
                  <td className="p-4 font-bold text-slate-200">{task.title}</td>
                  <td className="p-4 font-black text-emerald-400">{task.price}৳</td>
                  <td className="p-4 font-bold text-slate-400">{task.limit} টি</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(task.row)} className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 rounded-xl font-black transition active:scale-95">
                      ✕ Delete
                    </button>
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
