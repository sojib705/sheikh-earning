'use client';

import { useState, useEffect } from 'react';
import styles from './withdraw.module.css'; // 🎨 নতুন ডিজাইন ফাইল কানেক্ট

export default function WorkerWithdrawPage() {
  const [withdraws, setWithdraws] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [method, setMethod] = useState('bkash');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');

  // 📥 ডাটাবেজ থেকে লাইভ ডাটা লোড (এপিআই এবং ব্যালেন্স লক ফিক্সড)
  const loadWithdrawData = async () => {
    try {
      setLoading(true);
      const savedEmail = localStorage.getItem('workerEmail');
      if (!savedEmail) return;

      // নতুন সেন্ট্রাল এপিআই থেকে ডাটা সিঙ্ক
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      
      if (data.success) {
        // ১. ব্যালেন্স ফিক্স: totalIncome ব্যবহার করা হলো
        const current = data.workers?.find(
          (w) => w.email?.trim().toLowerCase() === savedEmail.trim().toLowerCase()
        );
        if (current) {
          setCurrentBalance(Number(current.totalIncome) || 0); 
        }

        // ২. উইথড্র ডাটা ফিল্টার
        if (data.withdraws) {
          const myWithdraws = data.withdraws.filter(
            (item) => item.uid?.trim().toLowerCase() === savedEmail.trim().toLowerCase()
          );
          setWithdraws(myWithdraws);
        }
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

  // 🚀 টাকা তোলার রিকোয়েস্ট অ্যাডমিন প্যানেলে পাঠানো
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const savedEmail = localStorage.getItem('workerEmail');
    const requestAmount = Number(amount);

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
          actionType: 'SUBMIT_WITHDRAW_REQUEST', 
          payload: {
            email: savedEmail,
            method: method,
            number: number.trim(),
            amount: requestAmount,
            date: new Date().toLocaleDateString('bn-BD')
          }
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('🎉 পেমেন্ট রিকোয়েস্ট সফলভাবে অ্যাডমিন প্যানেলে পাঠানো হয়েছে!');
        setNumber('');
        setAmount('');
        loadWithdrawData(); // ব্যালেন্স রিলোড
      } else {
        alert('⚠️ সার্ভার এরর! রিকোয়েস্ট যায়নি।');
      }
    } catch (err) {
      alert('রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-wider text-xs animate-pulse">উইথড্র পোর্টাল সিঙ্ক হচ্ছে...</div>;
  }

  return (
    <div className={styles.mainContainer}>
      
      {/* 💳 বামপাশে: টাকা তোলার ফর্ম */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionHeader}>💰 টাকা উত্তোলনের ফর্ম</h3>
        
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">পেমেন্ট মেথড সিলেক্ট করুন</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={styles.inputField}>
              <option value="bkash">বিকাশ (Personal)</option>
              <option value="nagad">নগদ (Personal)</option>
              <option value="roket">রকেট (Personal)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold">আপনার পার্সোনাল অ্যাকাউন্ট নাম্বার</label>
            <input type="tel" required maxLength="11" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="017XXXXXXXX" className={styles.inputField} />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold">টাকার পরিমাণ (টাকা ৳)</label>
            <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="সর্বনিম্ন ১০ টাকা" className={styles.inputField} />
            <p className="text-[10px] text-slate-500 font-bold mt-1">উইথড্রযোগ্য ব্যালেন্স: {currentBalance}৳</p>
          </div>

          <button type="submit" disabled={submitting || !amount || Number(amount) > currentBalance || Number(amount) <= 0} className={styles.submitBtn}>
            {submitting ? 'প্রসেস হচ্ছে...' : Number(amount) > currentBalance ? '❌ পর্যাপ্ত ব্যালেন্স নেই' : 'উইথড্র রিকোয়েস্ট পাঠান ➔'}
          </button>
        </form>
      </div>

      {/* 📝 ডানপাশে: পেমেন্ট হিস্ট্রি টেবিল */}
      <div className={styles.historySection}>
        <div className={styles.tableHeader}>আপনার পেমেন্ট হিস্ট্রি</div>
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th className={styles.tableCell}>তারিখ</th>
                <th className={styles.tableCell}>মেথড</th>
                <th className={styles.tableCell}>নাম্বার</th>
                <th className={styles.tableCell}>পরিমাণ</th>
                <th className={`${styles.tableCell} text-center`}>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {withdraws.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-600 font-bold uppercase tracking-wide text-[10px]">আপনি আগে কোনো টাকা উত্তোলন করেননি!</td></tr>
              ) : withdraws.map((item, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td className={`${styles.tableCell} font-mono font-bold text-slate-400 text-xs`}>{item.date || new Date().toLocaleDateString('bn-BD')}</td>
                  <td className={`${styles.tableCell} uppercase font-black text-indigo-400 text-xs`}>{item.method}</td>
                  <td className={`${styles.tableCell} tracking-wider font-mono text-slate-200 text-xs`}>{item.number}</td>
                  <td className={`${styles.tableCell} font-black text-emerald-400 text-sm`}>{item.amount}</td>
                  <td className={`${styles.tableCell} text-center`}>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${
                      item.status === 'Paid' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 
                      item.status === 'Cancelled' ? 'bg-rose-500/5 text-rose-400 border-rose-500/20' : 
                      'bg-amber-500/5 text-amber-400 border-amber-500/20'
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
