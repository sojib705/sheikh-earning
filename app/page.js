import Link from 'next/link';

export default function Home() {
  return (
    <div className="public-body min-h-screen bg-slate-50 flex items-center justify-center p-4">
      
      <div className="welcome-container bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-slate-100 transform transition-all duration-300 hover:scale-[1.02]">
        
        {/* Welcome Logo with UI/UX Glow Effect */}
        <div className="welcome-logo w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 text-white text-3xl animate-bounce">
          <i className="fa-solid fa-briefcase"></i>
        </div>
        
        {/* Website Title */}
        <h1 className="text-2xl font-black text-slate-800 tracking-wider mb-3">
          SHEIKH EARNING
        </h1>
        
        {/* Subtitle / Description */}
        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
          সহজে কাজ করুন, বিশ্বস্ততার সাথে প্রতি মুহূর্তে আয় করুন।
        </p>
        
        {/* Modern Start Work Button with Smooth Hover Animation */}
        <Link 
          href="/login" 
          className="start-work-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          START WORK 
          <i className="fa-solid fa-arrow-right-long transition-transform duration-200 group-hover:translate-x-1"></i>
        </Link>
        
      </div>

    </div>
  );
}
