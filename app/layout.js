import './globals.css'; 

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
        
        {/* 🚀 এই জাদুকরী সিডিএন (CDN) লাইনটি যোগ করা হলো */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <main>{children}</main> 
      </body>
    </html>
  );
}
