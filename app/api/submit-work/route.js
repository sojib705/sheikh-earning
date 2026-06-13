import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    // ১. ফ্রন্টএন্ড কাজের ফর্ম থেকে আসা সমস্ত ডাটা রিসিভ করা
    const body = await request.json();
    const { task_name, price, uid, password, two_fa, mail_access, cookie } = body;

    // অবশ্যই পূরণ করতে হবে এমন ফিল্ডগুলো চেক করা
    if (!uid || !password || !cookie) {
      return NextResponse.json({ error: 'required_fields_missing' }, { status: 400 });
    }

    // ২. এনভায়রনমেন্ট ভেরিয়েবল থেকে গুগল শিটের সিক্রেট কি ও আইডি নেওয়া
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    // ৩. গুগল অথেনটিকেশন ক্লায়েন্ট রেডি করা
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ৪. বাংলাদেশ সময় (Dhaka Time Zone) অনুযায়ী তারিখ ও সময় বের করা
    const dateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    
    // ৫. গুগল শিটের 'Work_Submissions' ট্যাবে ডাটা এক ক্লিকে পাঠিয়ে দেওয়া
    // কলামের সিরিয়াল: তারিখ ও সময়, কাজের নাম, ইউজার UID, পাসওয়ার্ড, 2FA, মেইল এক্সেস, কুকি, স্ট্যাটাস, টাকা
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Work_Submissions!A2',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          dateTime, 
          task_name || '0F-2FA-HOTMAIL', 
          uid.trim(), 
          password.trim(), 
          two_fa ? two_fa.trim() : '', 
          mail_access ? mail_access.trim() : '', 
          cookie.trim(), 
          'Pending', // নতুন কাজের স্ট্যাটাস ডিফল্টভাবে Pending থাকবে
          price || '10'
        ]],
      },
    });

    // সফলভাবে জমা হলে ফ্রন্টএন্ডে সাকসেস মেসেজ পাঠানো
    return NextResponse.json({ success: true, message: 'Work submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Submit Work API Error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
