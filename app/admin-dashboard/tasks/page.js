'use client';

import { useState, useEffect } from 'react';
import styles from './tasks.module.css'; // 🎨 নতুন ডিজাইন ফাইল কানেক্ট করা হলো

export default function AdminTasksPage() {
  const [publishedTasks, setPublishedTasks] = useState([]); 
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [taskForm, setTaskForm] = useState({ title: '', description: '', price: '', limit: '' });
  const [publishing, setPublishing] = useState(false);

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
    <div className={styles.mainContainer}>
      
      <div className={styles.gridContainer}>
        
        {/* ক) কাজের পোস্ট ফর্ম */}
        <div className={styles.formCard}>
          <h3 className="text-xs font-black uppercase text-violet-400 tracking-wider mb-4">📢 নতুন কাজের পোস্ট করুন</h3>
          <form onSubmit={handlePublishTask} className="space-y-4 text-xs">
            <input type="text" required placeholder="কাজের শিরোনাম" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className={styles.inputField} />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" required placeholder="রেট ৳" value={taskForm.price} onChange={e => setTaskForm({...taskForm, price: e.target.value})} className={styles.inputField} />
              <input type="number" required placeholder="লিমিট" value={taskForm.limit} onChange={e => setTaskForm({...taskForm, limit: e.target.value})} className={styles.inputField} />
            </div>
            <textarea required placeholder="কাজের বিবরণ বা নিয়মাবলী..." value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className={`${styles.inputField} h-24 resize-none`} />
            <button type="submit" disabled={publishing} className={styles.submitBtn}>
              {publishing ? 'পাবলিশ হচ্ছে...' : 'পাবলিশ জব পোস্ট 🚀'}
            </button>
          </form>
        </div>

        {/* খ) এক্টিভ কাজের তালিকা টেবিল */}
        <div className={styles.activeTasksCard}>
          <div className={styles.cardHeader}>
            <span>রানিং কাজের তালিকা (লাইভ গুগল শিট সিরিয়াল)</span>
            <span className={styles.activeBadge}>{publishedTasks.length} Active</span>
          </div>
          <div className="overflow-x-auto">
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.tableCell}>তারিখ</th>
                  <th className={styles.tableCell}>কাজের নাম</th>
                  <th className={styles.tableCell}>রেট</th>
                  <th className={styles.tableCell}>লিমিট বাকি</th>
                  <th className={`${styles.tableCell} text-center`}>কন্ট্রোল</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {publishedTasks.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-slate-600 font-bold uppercase text-xs">কোনো একটিভ কাজ পাওয়া যায়নি!</td></tr>
                ) : publishedTasks.map((task) => (
                  <tr key={task.row} className={styles.tableRow}>
                    <td className={`${styles.tableCell} font-mono font-bold text-amber-400 text-xs`}>{task.date}</td>
                    <td className={`${styles.tableCell} font-bold text-slate-200 text-xs`}>{task.title}</td>
                    <td className={`${styles.tableCell} font-black text-emerald-400 text-xs`}>{task.price}৳</td>
                    <td className={`${styles.tableCell} font-bold text-slate-400 text-xs`}>{task.limit} টি</td>
                    <td className={`${styles.tableCell} text-center`}>
                      <button type="button" onClick={() => handleDeleteTask(task.row)} className={styles.btnDelete}>✕ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 📝 নিচের অংশ: ওয়ার্কারদের সাবমিট করা রিপোর্ট তালিকা */}
      <div className={styles.reportCard}>
        <div className={styles.cardHeader}>
          <span>ওয়ার্কারদের সাবমিট করা ফেসবুক আইডি রিপোর্ট তালিকা</span>
          <button onClick={loadTasksAndReports} className={styles.btnRefresh}>🔄 রিফ্রেশ রিপোর্ট</button>
        </div>
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th className={styles.tableCell}>ইউজার UID / ইমেইল</th>
                <th className={styles.tableCell}>কাজের ক্যাটাগরি</th>
                <th className={styles.tableCell}>টাকার পরিমাণ</th>
                <th className={styles.tableCell}>স্ট্যাটাস</th>
                <th className={`${styles.tableCell} text-center`}>অ্যাকশন কন্ট্রোল</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {submissions.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-600 font-bold text-xs">কোনো কাজের সাবমিশন রিপোর্ট এভেলেবল নেই</td></tr>
              ) : submissions.map((item, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td className={`${styles.tableCell} font-mono font-bold text-violet-400 text-xs`}>{item.uid}</td>
                  <td className={`${styles.tableCell} font-bold text-slate-200 text-xs`}>{item.task}</td>
                  <td className={`${styles.tableCell} font-black text-emerald-400 text-xs`}>{item.price}</td>
                  <td className={styles.tableCell}>
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
                  <td className={`${styles.tableCell} flex items-center justify-center gap-2`}>
                    {(!item.status || item.status === 'Pending') ? (
                      <>
                        <button type="button" onClick={() => handleAdminAction('Work_Submissions', item.row || (idx + 2), 'Approved')} className={styles.btnApprove}>Approve</button>
                        <button type="button" onClick={() => handleAdminAction('Work_Submissions', item.row || (idx + 2), 'Reject')} className={styles.btnReject}>Reject</button>
                      </>
                    ) : <span className="text-slate-500 italic font-bold text-xs">রিভিউ সম্পন্ন</span>}
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
