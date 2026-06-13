'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  // মোবাইলের জন্য মেনু অন/অফ করার স্টেট
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm transition-all duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 🎯 বাম পাশে: লোগো এবং নাম */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md shadow-blue-200 transform group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-briefcase text-sm"></i>
            </div>
            <span className="font-black text-slate-800 text-lg tracking-wider uppercase group-hover:text-blue-600 transition-colors">
              Sheikh Earning
            </span>
          </Link>

          {/* 💻 ডান পাশে: কম্পিউটার বা বড় স্ক্রিনের জন্য নেভিগেশন মেনু */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">হোম</Link>
            <Link href="/dashboard" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">ড্যাশবোর্ড</Link>
            <Link href="/admin-dashboard" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">অ্যাডমিন প্যানেল</Link>
            
            {/* লগইন বাটন */}
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md shadow-blue-100 hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
            >
              로그인 <i className="fa-solid fa-right-to-bracket text-[10px]"></i> লগইন করুন
            </Link>
          </div>

          {/* 📱 রেসপন্সিভ মোবাইল মেনু বাটন (হ্যামবার্গার আইকন) */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-slate-500 hover:text-slate-800 focus:outline-none p-2 rounded-xl bg-slate-50 border border-slate-100 transition-all"
            >
              <i className={`fa-solid ${isOpen ? 'fa-xmark text-lg' : 'fa-bars text-base'} w-5 h-5 flex items-center justify-center`}></i>
            </button>
          </div>

        </div>
      </div>

      {/* 📱 মোবাইল স্ক্রিনের জন্য ড্রপডাউন মেনু (বাটনে ক্লিক করলে অন হবে) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-50 px-4 pt-2 pb-4 space-y-2 shadow-inner animate-fadeIn">
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl hover:text-blue-600 transition-all"
          >
            <i className="fa-solid fa-house mr-2 text-xs"></i> হোম
          </Link>
          <Link 
            href="/dashboard" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl hover:text-blue-600 transition-all"
          >
            <i className="fa-solid fa-table-columns mr-2 text-xs"></i> ড্যাশবোর্ড
          </Link>
          <Link 
            href="/admin-dashboard" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl hover:text-blue-600 transition-all"
          >
            <i className="fa-solid fa-user-shield mr-2 text-xs"></i> অ্যাডমিন প্যানেল
          </Link>
          
          <div className="pt-2">
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <i className="fa-solid fa-right-to-bracket text-xs"></i> লগইন করুন
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
