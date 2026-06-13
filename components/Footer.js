'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 mt-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        
        {/* 🎯 বাম পাশে: ব্র্যান্ড নাম এবং কপিরাইট */}
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-800 tracking-wider uppercase">
            SHEIKH EARNING
          </p>
          <p className="text-xs font-semibold text-slate-400">
            &copy; {currentYear} All Rights Reserved. সহজে কাজ করুন, বিশ্বস্ততার সাথে আয় করুন।
          </p>
        </div>

        {/* 🔗 ডান পাশে: প্রয়োজনীয় কুইক লিংক এবং সোশ্যাল আইকন */}
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
          <div className="flex items-center gap-5 text-xs font-bold text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">হোম</Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors">লগইন</Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">ড্যাশবোর্ড</Link>
          </div>

          {/* 📱 অফিশিয়াল সাপোর্ট বাটন (হোয়াটসঅ্যাপ) */}
          <a 
            href="https://wa.me/8801823315984" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 text-xs font-bold px-3 py-2 rounded-xl border border-slate-100 hover:border-emerald-100 transition-all active:scale-95"
          >
            <i className="fa-brands fa-whatsapp text-sm text-emerald-500"></i> হেল্পলাইন
          </a>
        </div>

      </div>
    </footer>
  );
}
