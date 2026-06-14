import './globals.css';
import Script from 'next/script'; // 🚀 Next.js-এর স্ক্রিপ্ট হ্যান্ডলার ইমপোর্ট করা হলো

export const metadata = {
  title: 'Sheikh Earning - সহজে কাজ করুন, বিশ্বস্ততার সাথে আয় করুন',
  description: 'সহজে কাজ করুন, বিশ্বস্ততার সাথে প্রতি মুহূর্তে আয় করুন।',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* FontAwesome আইকনগুলোর জন্য লিংক */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body>
        <main>{children}</main>

        {/* 🚀 Next.js-এর নিয়ম অনুযায়ী Tailwind CDN যুক্ত করা হলো, যা হাইড্রেশন এরর দেবে না */}
        <Script 
          src="https://cdn.tailwindcss.com" 
          strategy="beforeInteractive" 
        />
      </body>
    </html>
  );
}
