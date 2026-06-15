'use client';

export default function AdminDashboardLanding() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-slate-900/20 border border-slate-800/60 rounded-3xl p-8 animate-in fade-in duration-300">
      <div className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-xl shadow-indigo-600/10 mb-4 select-none">
        👑
      </div>
      <h2 className="text-slate-100 font-black text-sm uppercase tracking-wider mb-1.5">
        স্বাগতম মাস্টার প্যানেল!
      </h2>
      <p className="text-slate-500 font-medium max-w-xs leading-relaxed text-[11px]">
        আপনার আর্নিং ওয়েবসাইটের ডাটাবেজ এবং কন্ট্রোল সিস্টেম সম্পূর্ণরূপে লাইভ আছে। ওপরের ট্যাব বাটনগুলো ব্যবহার করে কাজ পরিচালনা করুন বস।
      </p>
    </div>
  );
}
