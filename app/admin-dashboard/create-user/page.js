'use client';

import { useState, useEffect } from 'react';
import styles from './create-user.module.css'; // 🎨 নতুন ডিজাইন ফাইল ইমপোর্ট করা হলো

export default function AdminCreateUserPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

  // ডাটাবেজ থেকে লাইভ ইউজার লিস্ট লোড করা
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      if (data.success && data.workers) {
        setUsers(data.workers.filter(w => w.uid && w.uid.trim() !== ''));
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // নতুন ওয়ার্কার তৈরি করার ফাংশন
  const handleCreateUserSubmit = async (e) => {
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
        alert(`🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!\nUID: ${data.uid}\nName: ${formData.name}`);
        setFormData({ name: '', email: '', password: '' });
        fetchUsers(); 
      } else {
        alert(data.error || '⚠️ অ্যাকাউন্ট তৈরি করা যায়নি।');
      }
    } catch (error) {
      alert('সার্ভার এরর! অ্যাকাউন্ট ক্রিয়েশন ব্যর্থ হয়েছে।');
    } finally {
      setCreating(false);
    }
  };

  // ইউজার এডিট ফাংশন
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'EDIT_USER_DETAILS',
          uid: editingUser.uid,
          newName: editForm.name,
          newEmail: editForm.email,
          newPassword: editForm.password
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ ইউজারের তথ্য সফলভাবে পরিবর্তন করা হয়েছে!');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      alert('আপডেট করতে সমস্যা হয়েছে!');
    }
  };

  // ইউজার ডিলিট ফাংশন
  const handleDeleteUser = async (uid, name) => {
    const confirmDelete = confirm(`⚠️ আপনি কি নিশ্চিত যে "${name}"-কে চিরতরে ডিলিট করতে চান?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'DELETE_USER', uid: uid })
      });
      const data = await response.json();
      if (data.success) {
        alert('🗑️ ইউজারকে ডাটাবেজ থেকে মুছে ফেলা হয়েছে!');
        fetchUsers();
      }
    } catch (err) {
      alert('ডিলিট করতে সমস্যা হয়েছে!');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.uid?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.mainContainer}>
      
      {/* ⬅️ বাম পাশ: ফর্ম */}
      <div className={styles.formSection}>
        <div className="border-b border-slate-800 pb-3 mb-5">
          <h2 className="text-sm font-black uppercase text-violet-400 tracking-wide">➕ নতুন ওয়ার্কার তৈরি করুন</h2>
        </div>

        <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">পুরো নাম (Full Name)</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="যেমন: মোঃ সজিব" className={styles.inputField} />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">ইমেইল (Email)</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="worker@gmail.com" className={styles.inputField} />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">পাসওয়ার্ড (Password)</label>
            <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="একটি স্ট্রং পাসওয়ার্ড দিন" className={styles.inputField} />
          </div>
          <button type="submit" disabled={creating} className={styles.submitBtn}>
            {creating ? 'ডাটাবেজে যুক্ত হচ্ছে...' : 'Create Account 🚀'}
          </button>
        </form>
      </div>

      {/* ➡️ ডান পাশ: ইউজার লিস্ট */}
      <div className={styles.listSection}>
        <div className="p-5 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase text-indigo-400">👥 নিবন্ধিত ইউজার লিস্ট</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="🔍 খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button onClick={fetchUsers} className="bg-slate-950 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800">
              🔄 রিফ্রেশ
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {loadingUsers ? (
            <div className="text-center text-slate-500 text-xs font-bold py-10">ইউজার ডাটা লোড হচ্ছে...</div>
          ) : filteredUsers.map((user, idx) => (
            <div key={idx} className={styles.userCard}>
              <div className="flex-1">
                <span className="bg-violet-500/10 text-violet-400 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold">{user.uid}</span>
                <h3 className="text-slate-100 font-bold text-sm mt-1">{user.name}</h3>
                <p className="text-slate-500 text-[11px] font-mono">E: {user.email} | P: {user.password}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingUser(user); setEditForm({ name: user.name, email: user.email, password: user.password }); }} className="bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-4 py-2 rounded-xl text-[11px] font-bold">✏️ Edit</button>
                <button onClick={() => handleDeleteUser(user.uid, user.name)} className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-4 py-2 rounded-xl text-[11px] font-bold">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
