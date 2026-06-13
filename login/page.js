'use client';

import { useState } from 'react';

export default function Login() {
  const [formData, setFormData] = useState({ gmail: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // এখানে পরবর্তীতে আমরা Next.js API-এর (api/login-action/route.js) সাথে লগইন লজিক কানেক্ট করব
    console.log('Submitting login data:', formData);
  };

  return (
    <div className="public-body min-h-screen bg-slate-50 flex items-center justify-center p-4">
      
      <div className="login-container bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 transform transition-all duration-300 hover:shadow-2xl">
        
        {/* Headings */}
        <h2 className="text-2xl font-black text-slate-800 text-center mb-1">
          ওয়ার্কার লগইন
        </h2>
        <p className="login-subtitle text-slate-400 text-xs font-medium text-center mb-8">
          আপনার অ্যাকাউন্ট তথ্য দিয়ে প্রবেশ করুন
        </p>

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
            className="submit-login-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            লগইন করুন <i className="fa-solid fa-right-to-bracket"></i>
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
