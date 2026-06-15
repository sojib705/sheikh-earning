'use client';

import { useState, useEffect } from 'react';

export default function WorkerHomePage() {
  const [tasks, setTasks] = useState([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  // 🎯 ডায়নামিক ওয়ার্ক সাবমিশন মডাল স্টেটসমূহ
  const [selectedTask, setSelectedWorkerTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // ১৫ মিনিট = ৯০০ সেকেন্ড
  const [fields, setFields] = useState({ uid: '', password: '', tfa: '', mail: '', cookie: '' });
  const [errors, setErrors] = useState({ uid: '', password: '', tfa: '', mail: '', cookie: '' });
  const [submitting, setSubmitting] = useState(false);

  // লাইভ ডাটা লোড (নোটিশ এবং একটিভ কাজ)
  const loadHomeData = async () => {
    try {
      const response = await fetch('/api/admin-action', { method: 'GET' });
      const data = await response.json();
      if (!data.error) {
        setTasks(data.publishedTasks || []);
        setNotice(data.currentNotice || 'আজকের কোনো জরুরি নোটিশ নেই।');
      }
    } catch (err) {
      console.error('Home data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  // 🕒 ১৫ মিনিটের লাইভ কাউন্টডাউন টাইমার মেকানিজম (মডাল ওপেন হলে চালু হবে)
  useEffect(() => {
    if (!selectedTask) return;
    if (timeLeft <= 0) {
      alert('⚠️ সময় শেষ! ফরমটি লক হয়ে গেছে। আবার চেষ্টা করুন।');
      setSelectedWorkerTask(null);
      return;
    }
    const timer = setInterval(() => { setTimeLeft(prev => prev - 1); }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, selectedTask]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 🔍 ইনপুট ক্যারেক্টার ও ডুপ্লিকেট লাইভ ভ্যালিডেটর
  const handleLiveFieldCheck = async (fieldName, value) => {
    setFields(prev => ({ ...prev, [fieldName]: value }));

    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'CHECK_DUPLICATE_SUBMISSION', fieldName, value })
      });
      const data = await response.json();
      
      setErrors(prev => ({
        ...prev,
        [fieldName]: data.message || '' // সার্ভার থেকে আসা লাল ওয়ার্নিং মেসেজ বসবে
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // 🚀 কাজ ফাইনাল সাবমিট করার লজিক (গুগল শিটের Work_Submissions-এ যাবে)
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const workerEmail = localStorage.getItem('workerEmail') || 'unknown@mail.com';
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabName: 'Work_Submissions',
          rowNumber: Date.now(), // ইউনিক আইডি বা ট্র্যাকিং টাইম
          newStatus: 'Pending',
          // আমরা সরাসরি অ্যাপেন্ড করতে ডাটা পাঠাব ব্যাকএন্ডের কাস্টম স্ট্রাকচারে
          actionType: 'SUBMIT_WORKER_JOB', 
          payload: [
            fields.uid,
            selectedTask.title,
            fields.password,
            fields.tfa,
            fields.mail,
            fields.cookie,
            new Date().toLocaleDateString('bn-BD'),
            'Pending'
          ]
        })
      });
      
      alert('🎉 আপনার কাজ সফলভাবে সাবমিট হয়েছে বস! অ্যাডমিন চেক করে পে করে দেবে।');
      setSelectedWorkerTask(null);
      setFields({ uid: '', password: '', tfa: '', mail: '', cookie: '' });
    } catch (err) {
      alert('সাবমিট করতে সমস্যা হয়েছে!');
    } finally {
      setSubmitting(false);
    }
  };

  const hasErrors = Object.values(errors).some(x => x !== '') || !fields.uid || !fields.password || !fields.tfa || !fields.mail || !fields.cookie;

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-bold">লাইভ ডাটা লোড হচ্ছে ভাই...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs animate-in fade-in duration-200">
      
      {/* 📢 ১. ডায়নামিক অ্যানিমেটেড নোটিশ বোর্ড */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 shadow-md">
        <div className="bg-amber-500 text-slate-950 p-2 rounded-xl font-black text-center animate-bounce">📢</div>
        <div className="overflow-hidden w-full">
          <p className="text-amber-400 font-black tracking-wide uppercase text-[10px] mb-0.5">জরুরি নোটিশ বোর্ড:</p>
          <div className="text-slate-200 font-bold text-[11px] whitespace-nowrap animate-marquee">{notice}</div>
        </div>
      </div>

      {/* 📋 ২. গুগল শিট রানিং টাস্ক এরিয়া */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-violet-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-violet-500 rounded-full animate-ping"></span>
          আজকের এভেলেবল কাজের তালিকা
        </h2>

        {tasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 font-bold uppercase">
            আজকে নতুন কোনো কাজ পাবলিশ করা হয়নি বস! একটু পরে আবার চেক করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div key={task.row} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition duration-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-slate-950 border border-slate-800 text-amber-400 px-2.5 py-1 rounded-lg font-mono font-bold text-[10px]">{task.date}</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl font-black text-sm">{task.price}৳</span>
                  </div>
                  <h3 className="text-slate-100 font-black text-sm tracking-wide">{task.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">{task.description}</p>
                </div>
                
                <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
                  <span className="text-slate-500 font-bold">লিমিট বাকি: {task.limit} টি</span>
                  <button 
                    onClick={() => {
                      setSelectedWorkerTask(task);
                      setTimeLeft(900); // নতুন করে ১৫ মিনিট রিসেট
                    }}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black px-4 py-2.5 rounded-xl uppercase transition active:scale-95 shadow-md shadow-indigo-600/10"
                  >
                    কাজ করুন ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔮 মেগা ডায়নামিক পপ-আপ মডাল (কাজ সাবমিট করার উইন্ডো) */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 my-auto">
            
            {/* মডাল হেডার ও টাইমার */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide">📥 কাজের ডাটা সাবমিট ফরম</h3>
                <p className="text-[10px] text-violet-400 font-bold mt-0.5">{selectedTask.title}</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-mono font-black text-amber-400 animate-pulse">
                ⏰ {formatTime(timeLeft)}
              </div>
            </div>

            {/* ৫টি ডেডিকেটেড সিকিউর বক্স */}
            <form onSubmit={handleTaskSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">১. UID / USER</label>
                <input type="text" required value={fields.uid} onChange={e => handleLiveFieldCheck('uid', e.target.value)} placeholder="ফেসবুক আইডি ইউআইডি দিন" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-violet-500" />
                {errors.uid && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.uid}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">২. PASSWORD</label>
                <input type="text" required value={fields.password} onChange={e => handleLiveFieldCheck('password', e.target.value)} placeholder="আইডির পাসওয়ার্ড লিখুন" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-violet-500" />
                {errors.password && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">৩. 2FA SECRET KEY (১৬/৩২ অক্ষর লক)</label>
                <input type="text" required value={fields.tfa} onChange={e => handleLiveFieldCheck('tfa', e.target.value)} placeholder="যেমন: JBSWY3DPEHPK3PXP" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none font-mono uppercase tracking-wider text-violet-400" />
                {errors.tfa && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.tfa}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">৪. MAIL ACCESS (৩টি পাইপ '|' আবশ্যক)</label>
                <input type="text" required value={fields.mail} onChange={e => handleLiveFieldCheck('mail', e.target.value)} placeholder="CalebPatel4419gp@hotmail.com|7sL##Hcv3*..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none text-[11px]" />
                {errors.mail && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.mail}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">৫. COOKIE DATA</label>
                <input type="text" required value={fields.cookie} onChange={e => handleLiveFieldCheck('cookie', e.target.value)} placeholder="ফেসবুক আইডি কুকি পেস্ট করুন" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none font-mono" />
                {errors.cookie && <p className="text-rose-500 font-bold text-[10px] mt-1">{errors.cookie}</p>}
              </div>

              {/* অ্যাকশন বাটন */}
              <div className="flex gap-3 pt-2 font-black">
                <button 
                  type="button" 
                  onClick={() => setSelectedWorkerTask(null)} 
                  className="flex-1 bg-slate-800 text-slate-300 py-3.5 rounded-xl transition hover:bg-slate-700"
                >
                  বাতিল
                </button>
                <button 
                  type="submit" 
                  disabled={hasErrors || submitting}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white py-3.5 rounded-xl shadow-xl transition uppercase tracking-wide"
                >
                  {submitting ? 'সাবমিট হচ্ছে...' : 'জব সাবমিট 🚀'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
