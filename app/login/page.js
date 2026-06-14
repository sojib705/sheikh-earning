'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ড্যাশবোর্ডে রিডাইরেক্ট করার জন্য

export default function Login() {
  const [formData, setFormData] = useState({ gmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false);
    setErrorMsg('');
    setLoading(true);

    try {
      // 🚀 এখানে আপনার আসল এপিআই (api/login-action/route.js) কানেক্ট করা হলো
      const response = await fetch('/api/login-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmail: formData.gmail,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`স্বাগতম, ${data.user.name}! লগইন সফল হয়েছে।`);
        
        // ইউজারের ডাটা ব্রাউজারের লোকাল স্টোরেজে সেভ করা (যাতে ড্যাশবোর্ড রিড করতে পারে)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // সফল হলে সরাসরি ড্যাশবোর্ড পেজে নিয়ে যাবে
        router.push('/dashboard');
      } else {
        // ব্যাকএন্ড থেকে আসা এরর অনুযায়ী মেসেজ সেট করা
        if (data.error === 'invalid_credentials') {
          setErrorMsg('ভুল জিমেইল অথবা পাসওয়ার্ড দিয়েছেন!');
        } else if (data.error === 'empty_fields') {
          setErrorMsg('দয়া করে সবগুলো বক্স পূরণ করুন।');
        } else {
          setErrorMsg('সার্ভারে সমস্যা হচ্ছে, আবার চেষ্টা করুন।');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('নেটওয়ার্ক এরর! ইন্টারনেট কানেকশন চেক করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-body min-h-screen bg-slate-50 flex items-center justify-center p-4">
      
      <div className="login-container bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 transform transition-all duration-300 hover:shadow-2xl">
        
        {/* Headings */}
        <h2 className="text-2xl font-black text-slate-800 text-center mb-1">
          ওয়ার্কার লগইন
        </h2>
        <p className="login-subtitle text-slate-400 text-xs font-medium text-center mb-6">
          আপনার অ্যাকাউন্ট তথ্য দিয়ে প্রবেশ করুন
        </p>

        {/* ⚠️ এরর মেসেজ দেখানোর সুন্দর বক্স (যদি লগইন ফেইল হয়) */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-xl text-xs font-bold text-center mb-4">
            <i className="fa-solid fa-triangle-exclamation mr-1"></i> {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form space-y-5">
          
          {/* Email Input Group */}
          <div className="input-group flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <i className="fa-solid fa-envelope text-blue-600"></i> জিমেইল অ্যাকাউন্ট
            </label>
            <input 
              type="email" 
              name="gmail" 
              value={formData.gmail}
              onChange={handleChange}
              placeholder="example@gmail.com" 
              required 
              autoComplete="off"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
          </div>
          
          {/* Password Input Group */}
          <div className="input-group flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <i className="fa-solid fa-lock text-blue-600"></i> পাসওয়ার্ড
            </label>
            <input 
              type="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="******" 
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="submit-login-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>যাচাই করা হচ্ছে... <i className="fa-solid fa-spinner animate-spin"></i></>
            ) : (
              <>লগইন করুন <i className="fa-solid fa-right-to-bracket"></i></>
            )}
          </button>
          
        </form>

        {/* Divider Line */}
        <div className="my-6 border-t border-slate-100"></div>

        {/* Admin Contact WhatsApp Button */}
        <div className="admin-contact-notice bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center">
          <div className="text-emerald-600 text-xl mb-2">
            <i className="fa-solid fa-circle-exclamation"></i>
          </div>
          <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4">
            আপনার কি কাজের অ্যাকাউন্ট নেই? নতুন অ্যাকাউন্টের জন্য অনুগ্রহ করে আমাদের অফিশিয়াল অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
          
          <a 
            href="https://wa.me/8801823315984?text=Hello%20Admin,%20I%20want%20to%20create%20a%20new%20worker%20account%20on%20Sheikh%20Earning." 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-md shadow-emerald-100 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i> CONTACT ADMIN VIA WHATSAPP
          </a>
        </div>
        
      </div>

    </div>
  );
}
