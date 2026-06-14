import './globals.css'; // 🚀 এই লাইনটিই আপনার ভাঙা ডিজাইনকে ১ সেকেন্ডে প্রিমিয়াম বানাবে!

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
        {/* এখানে আপনার হেডার/মেনু ডিজাইন বসাতে পারেন */}
        
        <main>{children}</main> 
        
        {/* এখানে আপনার ফুটার ডিজাইন বসাতে পারেন */}
      </body>
    </html>
  );
}
