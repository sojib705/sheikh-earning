/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // এখানে আপনি চাইলে আপনার নিজস্ব কোনো কাস্টম কালার বা থিম ব্র্যান্ডিং কোড যোগ করতে পারেন
    },
  },
  plugins: [],
}
