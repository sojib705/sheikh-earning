/** @type {import('next').Config} */
const nextConfig = {
  reactStrictMode: true, // এটি আপনার কোডের কোনো ভুল বা বাগ থাকলে তা দ্রুত ধরতে সাহায্য করবে
  
  // যদি ভবিষ্যতে আপনি গুগল ড্রাইভ বা অন্য কোনো অনলাইন লিংক থেকে ইমেজ (যেমন: ইউজার প্রোফাইল পিকচার) শো করাতে চান
  images: {
    domains: ['drive.google.com', 'lh3.googleusercontent.com'], 
  },

  // কোনো কারণে Vercel-এ বিল্ড দেওয়ার সময় ছোটখাটো ওয়ার্নিং বা লিন্ট এরর ইগনোর করার জন্য (বিল্ড ফাস্ট করার ট্রিক)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
