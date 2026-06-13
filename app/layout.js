export const metadata = {
  title: 'Sheikh Earning - সহজে কাজ করুন, বিশ্বস্ততার সাথে আয় করুন',
  description: 'সহজে কাজ করুন, বিশ্বস্ততার সাথে প্রতি মুহূর্তে আয় করুন।',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* আগের পিএইচপি ফাইলের Head সেকশনের FontAwesome লিংক */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body>
        {/* এখানে আপনার includes/header.php এর ডিজাইন বসতে পারে */}
        
        <main>{children}</main> {/* এই লাইনের কারণে সব পেজ অটোমেটিক লেআউট পেয়ে যাবে */}
        
        {/* এখানে আপনার includes/footer.php এর ডিজাইন বসতে পারে */}
      </body>
    </html>
  );
            }
