'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // ইউজার মেইন লিংকে (your-site.com) ঢুকলে তাকে অটোমেটিক লগইন পেজে রিডাইরেক্ট করবে
    const savedEmail = localStorage.getItem('workerEmail');
    if (savedEmail) {
      router.push('/home'); // লগইন থাকলে ড্যাশবোর্ডে যাবে
    } else {
      router.push('/login'); // লগইন না থাকলে সোজা লগইন পেজে যাবে
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-500 flex flex-col items-center justify-center font-sans text-xs uppercase tracking-widest">
      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      লোডিং হচ্ছে...
    </div>
  );
}
