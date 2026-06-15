'use client';

import { useState, useEffect } from 'react';
import styles from './workers.module.css'; // 🎨 নতুন ডিজাইন ফাইল কানেক্ট করা হলো

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedWorker, setSelectedWorker] = useState(null); 
  const [editForm, setEditForm] = useState({ amountToAdd: '', email: '', password: '' });

  const loadWorkersData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      
      if (!data.error) {
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

  const handleSaveWorkerChanges = async (e) => {
    e.preventDefault();
    const addedMoney = Number(editForm.amountToAdd) || 0;
    
    const updatedWorkers = workers.map(w => {
      if (w.uid === selectedWorker.uid) {
        return {
          ...w,
          email: editForm.email || w.email,
          password: editForm.password || w.password,
          totalIncome: w.totalIncome + addedMoney,
          monthlyIncome: (w.monthlyIncome || 0) + addedMoney,
          weeklyIncome: (w.weeklyIncome || 0) + addedMoney
        };
      }
      return w;
    });

    try {
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

  const filteredWorkers = workers.filter(worker => 
    worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    worker.uid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-16 text-slate-500 font-bold tracking-wider uppercase text-xs">গুগল শিট থেকে ওয়ার্কার ডাটাবেজ লোড হচ্ছে...</div>;
  }

  return (
    <div className={styles.mainContainer}>
      
      {/* 🔍 সার্চ বার */}
      <div className={styles.searchBox}>
        <span className="text-slate-500 text-sm">🔍</span>
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          placeholder="নাম, ইমেইল অথবা UID লিখে লাইভ ফিল্টার করুন..." 
          className={styles.searchInput} 
        />
      </div>

      {/* 👥 ওয়ার্কার্স মাস্টার টেবিল */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <span>👥 নিবন্ধিত ওয়ার্কার্স তালিকা ({filteredWorkers.length})</span>
          <button onClick={loadWorkersData} className={styles.btnRefresh}>🔄 রিফ্রেশ লিস্ট</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th className={styles.tableCell}>UID / মেম্বার নাম</th>
                <th className={styles.tableCell}>লগইন ক্রেডেনশিয়াল</th>
                <th className={`${styles.tableCell} text-center`}>সর্বমোট ইনকাম</th>
                <th className={`${styles.tableCell} text-center`}>চলতি মাস</th>
                <th className={`${styles.tableCell} text-center`}>এই সপ্তাহ</th>
                <th className={`${styles.tableCell} text-center`}>মডিফাই</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filteredWorkers.map((worker) => (
                <tr key={worker.uid} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className="font-mono font-black text-violet-400 text-[10px]">{worker.uid}</div>
                    <div className="text-slate-200 font-bold text-sm mt-0.5">{worker.name}</div>
                  </td>
                  <td className={`${styles.tableCell} text-slate-400 font-mono text-[11px] space-y-0.5`}>
                    <div>M: <span className="text-slate-300">{worker.email}</span></div>
                    <div>P: <span className="text-slate-500">{worker.password}</span></div>
                  </td>
                  <td className={`${styles.tableCell} text-center font-black text-emerald-400 text-sm`}>{worker.totalIncome}৳</td>
                  <td className={`${styles.tableCell} text-center font-black text-indigo-400 text-xs`}>{worker.monthlyIncome || 0}৳</td>
                  <td className={`${styles.tableCell} text-center font-black text-violet-400 text-xs`}>{worker.weeklyIncome || 0}৳</td>
                  <td className={`${styles.tableCell} text-center`}>
                    <button 
                      type="button" 
                      onClick={() => { 
                        setSelectedWorker(worker); 
                        setEditForm({ amountToAdd: '', email: worker.email, password: worker.password }); 
                      }} 
                      className={styles.btnEdit}
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

      {/* ⚙️ মডাল পপ-আপ: ব্যালেন্স ও প্রোফাইল মডিফায়ার */}
      {selectedWorker && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            
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
              
              <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                <label className="text-emerald-400 font-black block text-[10px] uppercase tracking-wider">💰 ব্যালেন্স যোগ করুন (৳)</label>
                <input 
                  type="number" 
                  placeholder="যেমন: ৫০ বা ১০০" 
                  value={editForm.amountToAdd} 
                  onChange={e => setEditForm({...editForm, amountToAdd: e.target.value})} 
                  className={styles.modalInputBalance} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">মেম্বার জিমেইল এড্রেস</label>
                <input 
                  type="email" 
                  required 
                  value={editForm.email} 
                  onChange={e => setEditForm({...editForm, email: e.target.value})} 
                  className={styles.modalInput} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">লগইন পাসওয়ার্ড</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.password} 
                  onChange={e => setEditForm({...editForm, password: e.target.value})} 
                  className={`${styles.modalInput} font-mono`} 
                />
              </div>

              <div className="flex gap-3 pt-2 font-black">
                <button type="button" onClick={() => setSelectedWorker(null)} className={styles.btnCancel}>বাতিল</button>
                <button type="submit" className={styles.btnSave}>Save Changes 💾</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
