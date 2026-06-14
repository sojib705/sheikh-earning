'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  // ১. ইউজার বা ওয়ার্কার ডাটা স্টেট
  const [user, setUser] = useState({
    name: 'Sojib Sheikh',
    uid: 'uid_884732',
    gmail: 'sojib@gmail.com',
    role: 'worker'
  });

  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);

  // ২. লাইভ এভেইলেবল কাজের ডাটা স্টেট (Published_Tasks থেকে আসবে)
  const [availableTasks, setAvailableTasks] = useState([
    { id: 'TASK_1', title: '0F-2FA-HOTMAIL/OUTLOOK', description: 'কুকি ফাইলসহ এবং অল এক্সেস মেল সাবমিট করতে হবে।', price: '১০৳', limit: '100', fields: 'UID-PASS-2FA-COOKIE', date: '06/15' }
  ]);

  // ৩. ওয়ার্কারের একটিভ টাস্ক এবং ১৫ মিনিটের টাইমার হ্যান্ডলিং স্টেট
  const [activeTask, setActiveTask] = useState(null); // যে কাজটির ওপর প্রসেস চলছে
  const [taskStep, setTaskStep] = useState('list'); // list -> details -> working
  const [timeLeft, setTimeLeft] = useState(900); // ১৫ মিনিট = ৯০০ সেকেন্ড

  // ৪. ডায়নামিক সাবমিশন এবং উইথড্র স্টেট
  const [submissionForm, setSubmissionForm] = useState({ uid: '', password: '', two_fa: '', mail_access: '', cookie: '' });
  const [withdrawData, setWithdrawData] = useState({ method: 'বিকাশ', number: '', amount: '' });
  const [history, setHistory] = useState([]);

  // ⏱️ ১৫ মিনিটের কাউন্টডাউন টাইমার মেকানিজম
  useEffect(() => {
    if (taskStep !== 'working' || timeLeft <= 0) {
      if (timeLeft === 0 && taskStep === 'working') {
        alert('⌛ ১৫ মিনিট সময় শেষ! আপনার এই কাজটি স্বয়ংক্রিয়ভাবে বাতিল করা হলো।');
        handleCancelWork();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [taskStep, timeLeft]);

  // সময়কে মিনিটে এবং সেকেন্ডে রূপান্তর করার হেল্পার ফাংশন
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 🚀 কাজ শুরু (Start Work) করার ১ম ধাপ
  const handleStartWorkClick = (task) => {
    setActiveTask(task);
    setTaskStep('details');
  };

  // 🔒 কাজ কনফার্ম (Confirm Work) করার ২য় ধাপ (লিমিট লক ও টাইমার স্টার্ট)
  const handleConfirmWork = async () => {
    setLoading(true);
    // এখানে পরবর্তীতে লিমিট ১ কমানোর এপিআই কানেক্ট হবে
    setTimeLeft(900); // ৯০০ সেকেন্ডে টাইমার রিসেট করা
    setTaskStep('working');
    setLoading(false);
  };

  // ❌ কাজ বাতিল (Cancel Work / Back Button) করার ফাংশন
  const handleCancelWork = () => {
    setTaskStep('list');
    setActiveTask(null);
    setTimeLeft(900);
    setSubmissionForm({ uid: '', password: '', two_fa: '', mail_access: '', cookie: '' });
  };

  // 📤 কাজ ফাইনাল সাবমিট করার ফাংশন (শিটে ডাটা যাবে)
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // টিকমার্ক অনুযায়ী ফরমেটেড সাবমিশন ডাটা তৈরি করা
    const proofTextParts = [];
    const fields = activeTask.fields.split('-');
    if (fields.includes('UID')) proofTextParts.push(`UID: ${submissionForm.uid}`);
    if (fields.includes('PASS')) proofTextParts.push(`PASS: ${submissionForm.password}`);
    if (fields.includes('2FA')) proofTextParts.push(`2FA: ${submissionForm.two_fa}`);
    if (fields.includes('MAIL_ACCESS')) proofTextParts.push(`MAIL: ${submissionForm.mail_access}`);
    if (fields.includes('COOKIE')) proofTextParts.push(`COOKIE: ${submissionForm.cookie}`);

    console.log('Submitting payload:', {
      uid: user.uid,
      taskName: activeTask.title,
      price: activeTask.price,
      proof: proofTextParts.join(' | ')
    });

    alert('🎉 অভিনন্দন! কাজটি সফলভাবে সম্পূর্ণ করে সাবমিট করা হয়েছে। অ্যাডমিন প্যানেলে জমা হয়েছে।');
    handleCancelWork();
    setLoading(false);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    alert('💰 উইথড্র রিকোয়েস্ট সফলভাবে গুগল শিটে পাঠানো হয়েছে!');
    setWithdrawData({ method: 'বিকাশ', number: '', amount: '' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans antialiased selection:bg-violet-500/30 touch-manipulation">
      
      {/* 🔝 মোবাইল ও পিসি রেসপন্সিভ টপ হেডার (জুম প্রুফ) */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3.5 flex items-center justify-between shadow-xl max-w-md mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/20">
            SE
          </div>
          <span className="font-black tracking-wider bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent text-sm">SHEIKH EARNING</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800/80 px-3 py-1.5 rounded-xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-black text-slate-300 tracking-wide uppercase">{user.name.split(' ')[0]}</span>
        </div>
      </header>

      {/* 📦 মেইন কনটেইনার এরিয়া */}
      <main className="max-w-md mx-auto p-4 pt-5 space-y-5">

        {/* 🏠 ট্যাব ১: হোমপেজ / ডায়নামিক কাজের মেকানিজম */}
        {currentPage === 'home' && (
          <div className="space-y-5">
            
            {/* ক) কাজের মেইন এভেইলেবল তালিকা উইন্ডো */}
            {taskStep === 'list' && (
              <>
                <h2 className="text-sm font-black uppercase text-violet-400 tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-bolt text-amber-500 animate-bounce"></i> আজকের এভেইলেবল কাজ
                </h2>

                <div className="space-y-3.5">
                  {availableTasks.map((task) => (
                    <div key={task.id} className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800/70 p-5 rounded-3xl shadow-xl flex items-center justify-between gap-3 hover:border-violet-500/40 transition-all duration-300">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-xs text-slate-100 tracking-wide">{task.title}</h3>
                          <span className="bg-violet-500/10 text-violet-400 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-violet-500/20">{task.date}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] font-medium leading-relaxed line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleStartWorkClick(task)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-[11px] px-4 py-2.5 rounded-xl shadow-md tracking-wide transition active:scale-95"
                      >
                        {task.price}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* খ) Start Work বাটনে চাপ দেওয়ার পর ডিটেইলস উইন্ডো (ধাপ ২) */}
            {taskStep === 'details' && activeTask && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
                <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                  <div>
                    <h2 className="text-xs font-black text-violet-400 uppercase tracking-wide">{activeTask.title}</h2>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">পোস্ট ডেট: {activeTask.date} | টাস্ক লিমিট: {activeTask.limit} জন</p>
                  </div>
                  <div className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">{activeTask.price}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">কাজের বিবরণ (Description):</span>
                  <p className="text-slate-300 text-[11px] font-medium leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800/50">{activeTask.description}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider block">রিকোয়ার্ড সাবমিশন ফরম্যাট (Format):</span>
                  <div className="text-slate-300 text-[11px] font-bold font-mono tracking-wider bg-slate-950/80 px-3.5 py-2.5 rounded-xl border border-slate-800/40">
                    Format : {activeTask.fields.split('-').join(' - ')}
                  </div>
                </div>

                <div className="flex gap-3 pt-2 text-[11px] font-black">
                  <button onClick={handleCancelWork} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl transition active:scale-95">
                    <i className="fa-solid fa-rotate-left mr-1"></i> Cancel Work
                  </button>
                  <button onClick={handleConfirmWork} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg transition active:scale-95">
                    Confirm Work 🚀
                  </button>
                </div>
              </div>
            )}

            {/* গ) Confirm করার পর ১৫ মিনিটের লাইভ টাইমার এবং ডায়নামিক ইনপুট ফর্ম (ধাপ ৩) */}
            {taskStep === 'working' && activeTask && (
              <div className="space-y-4">
                {/* লাইভ কাউন্টডাউন টাইমার বক্স */}
                <div className="bg-gradient-to-r from-rose-600/20 to-amber-600/20 border border-rose-500/30 p-4 rounded-2xl flex items-center justify-between shadow-inner">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-rose-400 uppercase tracking-wide">⏳ কাজ জমা দেওয়ার সময়</h4>
                    <p className="text-[10px] text-slate-400 font-medium">১৫ মিনিটের ভেতর সঠিক ডাটা সাবমিট করুন</p>
                  </div>
                  <div className="text-base font-mono font-black text-rose-400 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-rose-500/20 tracking-widest animate-pulse">
                    {formatTimer(timeLeft)}
                  </div>
                </div>

                {/* ডায়নামিক ইনপুট বক্স সমূহ (অ্যাডমিনের রিকোয়ার্ড ফিল্ড ফিল্টারিং) */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                  <form onSubmit={handleTaskSubmit} className="space-y-4.5">
                    <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">সাবমিশন ফর্ম ({activeTask.title})</h3>
                    
                    {activeTask.fields.split('-').includes('UID') && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide"><i className="fa-solid fa-fingerprint text-violet-500 mr-1"></i> UID / অ্যাকাউন্ট আইডি</label>
                        <input type="text" placeholder="UID বা ইউজার আইডি লিখুন" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-medium" value={submissionForm.uid} onChange={e => setSubmissionForm({...submissionForm, uid: e.target.value})} />
                      </div>
                    )}

                    {activeTask.fields.split('-').includes('PASS') && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide"><i className="fa-solid fa-key text-violet-500 mr-1"></i> অ্যাকাউন্টের পাসওয়ার্ড</label>
                        <input type="text" placeholder="পাসওয়ার্ড লিখুন" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-medium" value={submissionForm.password} onChange={e => setSubmissionForm({...submissionForm, password: e.target.value})} />
                      </div>
                    )}

                    {activeTask.fields.split('-').includes('2FA') && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide"><i className="fa-solid fa-shield-keyhole text-violet-500 mr-1"></i> 2FA কোড / কি (Key)</label>
                        <input type="text" placeholder="2FA সিক্রেট বা কি কোড দিন" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-medium" value={submissionForm.two_fa} onChange={e => setSubmissionForm({...submissionForm, two_fa: e.target.value})} />
                      </div>
                    )}

                    {activeTask.fields.split('-').includes('MAIL_ACCESS') && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide"><i className="fa-solid fa-envelope-open text-violet-500 mr-1"></i> মেইল এক্সেস পাসওয়ার্ড</label>
                        <input type="text" placeholder="Mail Access Password" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-medium" value={submissionForm.mail_access} onChange={e => setSubmissionForm({...submissionForm, mail_access: e.target.value})} />
                      </div>
                    )}

                    {activeTask.fields.split('-').includes('COOKIE') && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide"><i className="fa-solid fa-cookie-bite text-violet-500 mr-1"></i> কুকি ডাটা (Cookie Text)</label>
                        <textarea rows="4" placeholder="সম্পূর্ণ কুকি কোডটি এখানে সঠিকভাবে পেস্ট করুন..." required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-medium resize-none font-mono tracking-tight" value={submissionForm.cookie} onChange={e => setSubmissionForm({...submissionForm, cookie: e.target.value})}></textarea>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2 text-[11px] font-black">
                      <button type="button" onClick={handleCancelWork} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-xl transition">
                        <i className="fa-solid fa-arrow-left mr-1"></i> Cancel Work
                      </button>
                      <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3.5 rounded-xl shadow-lg font-black transition tracking-wider uppercase">
                        {loading ? 'জমা হচ্ছে...' : 'কাজ সাবমিট করুন ➔'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 📊 ট্যাব ২: কাজের হিস্ট্রি */}
        {currentPage === 'history' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase text-violet-400 tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left"></i> আপনার কাজের হিস্ট্রি
            </h2>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400 font-bold uppercase">
                      <th className="p-3.5">তারিখ</th>
                      <th className="p-3.5">কাজের নাম</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5 text-right">টাকা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                    {history.length === 0 ? (
                      <tr><td colSpan="4" className="p-4 text-center text-slate-500">এখনো কোনো কাজের রিপোর্ট নেই</td></tr>
                    ) : history.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-800/20">
                        <td className="p-3.5 text-slate-500">{item.date}</td>
                        <td className="p-3.5 font-bold text-violet-400">{item.task}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{item.status}</span>
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-200">{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 💰 ট্যাব ৩: উইথড্র সিস্টেম */}
        {currentPage === 'withdraw' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase text-violet-400 tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-wallet"></i> টাকা উত্তোলন (Withdraw)
            </h2>
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">পেমেন্ট মেথড সিলেক্ট করুন</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-bold" value={withdrawData.method} onChange={e => setWithdrawData({...withdrawData, method: e.target.value})}>
                    <option value="বিকাশ">বিকাশ (Personal)</option>
                    <option value="নগদ">নগদ (Personal)</option>
                    <option value="রকেট">রকেট (Personal)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">অ্যাকাউন্ট নাম্বার</label>
                  <input type="number" required placeholder="01XXXXXXXXX" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-medium" value={withdrawData.number} onChange={e => setWithdrawData({...withdrawData, number: e.target.value})} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">টাকার পরিমাণ (সর্বনিম্ন ৫০৳)</label>
                  <input type="number" min="50" required placeholder="৳৫০ বা তার বেশি" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 font-bold" value={withdrawData.amount} onChange={e => setWithdrawData({...withdrawData, amount: e.target.value})} />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl tracking-wide uppercase shadow-lg transition">উইথড্র রিকোয়েস্ট পাঠান ➔</button>
              </form>
            </div>
          </div>
        )}

        {/* 👤 ট্যাব ৪: প্রোফাইল */}
        {currentPage === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase text-violet-400 tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-user-gear"></i> আপনার প্রোফাইল
            </h2>
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-xl mx-auto shadow-xl shadow-indigo-500/10">
                <i className="fa-solid fa-user-check"></i>
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-100 tracking-wide">{user.name}</h3>
                <p className="text-violet-400 text-[10px] font-mono font-bold tracking-widest mt-0.5">{user.uid}</p>
              </div>
              
              <div className="text-left bg-slate-950 border border-slate-800/60 p-4 rounded-2xl text-[11px] font-medium text-slate-400 space-y-3">
                <p className="flex justify-between border-b border-slate-900 pb-2"><span>জিমেইল অ্যাকাউন্ট:</span> <span className="text-slate-200 font-bold">{user.gmail}</span></p>
                <p className="flex justify-between border-b border-slate-900 pb-2"><span>অ্যাকাউন্ট স্ট্যাটাস:</span> <span className="text-emerald-400 font-bold">সক্রিয় ওয়ার্কার</span></p>
                <p className="flex justify-between"><span>কাজের সময়সীমা লক:</span> <span className="text-rose-400 font-bold">১৫ মিনিট ফিক্সড</span></p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 📱 নো-জুম পিসি ও মোবাইল রেসপন্সিভ বটম নেভিগেশন বার */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 shadow-2xl px-3 py-2 flex justify-around max-w-md mx-auto z-50 rounded-t-2xl">
        <button onClick={() => { if(taskStep !== 'working' || confirm('একটিভ কাজটি বাতিল করে হোমে ফিরবেন?')) { handleCancelWork(); setCurrentPage('home'); } }} className={`flex flex-col items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${currentPage === 'home' ? 'text-violet-400 font-black scale-105' : 'text-slate-500 font-bold'}`}>
          <i className="fa-solid fa-house text-base"></i>
          <span className="text-[9px] tracking-wide">হোম</span>
        </button>
        <button onClick={() => { if(taskStep !== 'working' || confirm('একটিভ কাজটি বাতিল করে হিস্ট্রিতে যাবেন?')) { handleCancelWork(); setCurrentPage('history'); } }} className={`flex flex-col items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${currentPage === 'history' ? 'text-violet-400 font-black scale-105' : 'text-slate-500 font-bold'}`}>
          <i className="fa-solid fa-clock-rotate-left text-base"></i>
          <span className="text-[9px] tracking-wide">হিস্ট্রি</span>
        </button>
        <button onClick={() => { if(taskStep !== 'working' || confirm('একটিভ কাজটি বাতিল করে উইথড্রতে যাবেন?')) { handleCancelWork(); setCurrentPage('withdraw'); } }} className={`flex flex-col items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${currentPage === 'withdraw' ? 'text-violet-400 font-black scale-105' : 'text-slate-500 font-bold'}`}>
          <i className="fa-solid fa-wallet text-base"></i>
          <span className="text-[9px] tracking-wide">উইথড্র</span>
        </button>
        <button onClick={() => { if(taskStep !== 'working' || confirm('একটিভ কাজটি বাতিল করে প্রোফাইলে যাবেন?')) { handleCancelWork(); setCurrentPage('profile'); } }} className={`flex flex-col items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${currentPage === 'profile' ? 'text-violet-400 font-black scale-105' : 'text-slate-500 font-bold'}`}>
          <i className="fa-solid fa-user text-base"></i>
          <span className="text-[9px] tracking-wide">প্রোফাইল</span>
        </button>
      </nav>

    </div>
  );
}
