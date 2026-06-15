'use client';

import { useState, useEffect } from 'react';

export default function AdminCreateUserPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  
  // ডানদিকের প্যানেলের জন্য স্টেট
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // এডিট মডালের জন্য স্টেট
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

  // 📥 ডাটাবেজ থেকে লাইভ ইউজার লিস্ট লোড করা
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      if (data.success && data.workers) {
        // ডিলিট হওয়া ফাঁকা রো গুলো ফিল্টার করে বাদ দেওয়া
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

  // 🚀 নতুন ওয়ার্কার তৈরি করার ফাংশন (আপনার API কল)
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
        fetchUsers(); // নতুন ইউজার তৈরি হলে লিস্ট রিফ্রেশ হবে
      } else {
        alert(data.error || '⚠️ অ্যাকাউন্ট তৈরি করা যায়নি।');
      }
    } catch (error) {
      alert('সার্ভার এরর! অ্যাকাউন্ট ক্রিয়েশন ব্যর্থ হয়েছে।');
    } finally {
      setCreating(false);
    }
  };

  // ✏️ ইউজার এডিট সেভ করার ফাংশন
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

  // 🗑️ ইউজার চিরতরে ডিলিট করার ফাংশন
  const handleDeleteUser = async (uid, name) => {
    const confirmDelete = confirm(`⚠️ আপনি কি নিশ্চিত যে "${name}"-কে চিরতরে ডিলিট করতে চান? এই কাজ আর ফেরানো যাবে না!`);
    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'DELETE_USER', uid: uid })
      });
      const data = await response.json();
      if (data.success) {
        alert('🗑️ ইউজারকে ডাটাবেজ থেকে চিরতরে মুছে ফেলা হয়েছে!');
        fetchUsers();
      }
    } catch (err) {
      alert('ডিলিট করতে সমস্যা হয়েছে!');
    }
  };

  // লাইভ সার্চ ফিল্টার
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.uid?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      
      {/* ⬅️ বাম পাশ: নতুন ইউজার তৈরির ফর্ম (আপনার স্কেচ অনুযায়ী) */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
        <div className="border-b border-slate-800 pb-3 mb-5">
          <h2 className="text-sm font-black uppercase text-violet-400 tracking-wide flex items-center gap-2">
            ➕ নতুন ওয়ার্কার তৈরি করুন
          </h2>
          <p className="text-[10px] text-slate-500 mt-1">গুগল শিট ডাটাবেজে ম্যানুয়াল এন্ট্রি</p>
        </div>

        <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">পুরো নাম (Full Name)</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="যেমন: মোঃ সজিব" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">ইমেইল (Email)</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="worker@gmail.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">পাসওয়ার্ড (Password)</label>
            <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="একটি স্ট্রং পাসওয়ার্ড দিন" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-violet-500" />
          </div>
          <button type="submit" disabled={creating} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black py-4 rounded-xl uppercase tracking-wider transition active:scale-95 shadow-lg mt-2">
            {creating ? 'ডাটাবেজে যুক্ত হচ্ছে...' : 'Create Account 🚀'}
          </button>
        </form>
      </div>

      {/* ➡️ ডান পাশ: ইউজার লিস্ট ও কন্ট্রোল প্যানেল */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        
        {/* লিস্ট হেডার, সার্চ ও রিফ্রেশ */}
        <div className="p-5 bg-slate-800/30 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h2 className="text-sm font-black uppercase text-indigo-400">👥 নিবন্ধিত ইউজার লিস্ট</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="🔍 নাম, ইমেইল বা UID খুঁজুন..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button onClick={fetchUsers} className="bg-slate-950 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition">
              🔄 রিফ্রেশ
            </button>
          </div>
        </div>

        {/* ইউজার টেবিল */}
        <div className="overflow-y-auto flex-1 p-2">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-full text-slate-500 text-xs font-bold animate-pulse">ইউজার ডাটা লোড হচ্ছে...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex justify-center items-center h-full text-slate-500 text-xs font-bold">কোনো ইউজার পাওয়া যায়নি!</div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-slate-700 transition group">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-violet-500/10 text-violet-400 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold">{user.uid}</span>
                      <span className="text-emerald-400 font-black text-xs">৳ {user.totalIncome || 0} ব্যালেন্স</span>
                    </div>
                    <h3 className="text-slate-100 font-bold text-sm">{user.name}</h3>
                    <p className="text-slate-500 text-[11px] font-mono mt-0.5">E: {user.email} | P: {user.password}</p>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => { setEditingUser(user); setEditForm({ name: user.name, email: user.email, password: user.password }); }} 
                      className="flex-1 sm:flex-none bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white px-4 py-2 rounded-xl text-[11px] font-bold transition border border-indigo-500/20"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.uid, user.name)} 
                      className="flex-1 sm:flex-none bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white px-4 py-2 rounded-xl text-[11px] font-bold transition border border-rose-500/20"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ⚙️ এডিট মডাল (পপ-আপ) */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-xs font-black text-indigo-400 uppercase border-b border-slate-800 pb-2">✏️ ইউজার ইনফো এডিট করুন</h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">নাম পরিবর্তন</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">ইমেইল পরিবর্তন</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">পাসওয়ার্ড পরিবর্তন</label>
                <input type="text" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none" />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition">বাতিল</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black transition">Save 💾</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
