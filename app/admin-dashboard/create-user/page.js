'use client';

import { useState } from 'react';

export default function AdminCreateUserPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);

  // 🚀 নতুন ওয়ার্কার অ্যাকাউন্ট তৈরি করে গুগল শিটে পাঠানোর লজিক
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
        alert(`🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে বস!\nUID: ${data.uid}\nName: ${formData.name}`);
        setFormData({ name: '', email: '', password: '' }); // ফর্ম ক্লিয়ার করা
      } else {
        alert(data.message || '⚠️ অ্যাকাউন্ট তৈরি করা যায়নি। জিমেইলটি আগে ব্যবহার হয়েছে কি না চেক করুন।');
      }
    } catch (error) {
      console.error('Create user error:', error);
      alert('সার্ভার এরর! অ্যাকাউন্ট ক্রিয়েশন রিকোয়েস্ট ব্যর্থ হয়েছে।');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 mx-auto md:mx-0 shadow-2xl text-xs animate-in fade-in duration-200">
      
      {/* হেডার টেক্সট */}
      <div className="border-b border-slate-800 pb-2">
        <h2 className="text-sm font-black uppercase text-violet-400 tracking-wide flex items-center gap-2">
          ➕ নতুন ওয়ার্কার অ্যাকাউন্ট তৈরি করুন
        </h2>
        <p className="text-[10px] text-slate-500 mt-0.5">গুগল শিট ডাটাবেজে নতুন মেম্বার মেকার প্যানেল</p>
      </div>

      {/* নতুন ইউজার ক্রিয়েশন ফর্ম */}
      <form onSubmit={handleCreateUserSubmit} className="space-y-4">
        
        {/* ওয়ার্কারের নাম */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold">১. ওয়ার্কারের পুরো নাম (Full Name)</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            placeholder="যেমন: মোঃ সজিব" 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500 font-medium placeholder-slate-700" 
          />
        </div>

        {/* ওয়ার্কারের ইমেইল */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold">২. ওয়ার্কারের বৈধ জিমেইল (Email Address)</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            placeholder="worker@gmail.com" 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-violet-500 font-medium placeholder-slate-700" 
          />
        </div>

        {/* লগইন পাসওয়ার্ড */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold">৩. ড্যাশবোর্ড লগইন পাসওয়ার্ড (Password)</label>
          <input 
            type="text" 
            required 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            placeholder="একটি স্ট্রং পাসওয়ার্ড দিন" 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-mono focus:outline-none focus:border-violet-500 placeholder-slate-700" 
          />
        </div>

        {/* সাবমিট বোতাম */}
        <button 
          type="submit" 
          disabled={creating || !formData.name || !formData.email || !formData.password} 
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black py-4 rounded-xl uppercase tracking-wider transition active:scale-95 shadow-xl shadow-indigo-600/10 mt-2"
        >
          {creating ? 'ডাটাবেজে যুক্ত হচ্ছে...' : 'Create Worker Account 🚀'}
        </button>

      </form>

      {/* কুইক গাইড */}
      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-500 leading-relaxed font-medium">
        💡 <span className="font-bold text-slate-400">অ্যাডমিন টিপস:</span> এখানে অ্যাকাউন্ট তৈরি করার সাথে সাথে ইউজারের জন্য একটি ডায়নামিক ইউনিক UID (যেমন: `uid_738492`) অটো জেনারেট হবে এবং মেম্বার তার অ্যাকাউন্ট লগইন করে সাথে সাথে কাজ শুরু করতে পারবে।
      </div>

    </div>
  );
}
