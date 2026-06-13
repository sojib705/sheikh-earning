import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    // ১. ফ্রন্টএন্ড উইথড্র ফর্ম থেকে আসা ডাটা রিসিভ করা
    const body = await request.json();
    const { method, number, amount, uid } = body;

    // ফিল্ডগুলো ঠিকঠাক পূরণ করা হয়েছে কিনা চেক করা
    if (!method || !number || !amount || !uid) {
      return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
    }

    // সর্বনিম্ন উইথড্র লিমিট ৫০ টাকা চেক করা
    if (parseInt(amount) < 50) {
      return NextResponse.json({ error: 'minimum_amount_50' }, { status: 400 });
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

    // ৫. গুগল শিটের 'Withdraw_Requests' ট্যাবে ডাটা অ্যাপেন্ড (জমা) করা
    // কলামের সিরিয়াল: তারিখ ও সময়, পেমেন্ট মেথড, অ্যাকাউন্ট নাম্বার, টাকার পরিমাণ, ওয়ার্কার UID, স্ট্যাটাস
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Withdraw_Requests!A2',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          dateTime, 
          method, 
          number.trim(), 
          amount.toString(), 
          uid.trim(), 
          'Pending' // নতুন উইথড্র রিকোয়েস্ট ডিফল্টভাবে Pending থাকবে
        ]],
      },
    });

    // সফলভাবে শিটে জমা হলে ফ্রন্টএন্ডে সাকসেস মেসেজ ব্যাক করা
    return NextResponse.json({ success: true, message: 'Withdraw request sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Withdraw API Error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
