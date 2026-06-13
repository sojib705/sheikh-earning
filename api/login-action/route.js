import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    // ১. ফর্ম বা ক্লায়েন্ট থেকে আসা জিমেইল ও পাসওয়ার্ড রিসিভ করা
    const body = await request.json();
    const { gmail, password } = body;

    const input_gmail = gmail ? gmail.trim() : '';
    const input_password = password ? password.trim() : '';

    if (!input_gmail || !input_password) {
      return NextResponse.json({ error: 'empty_fields' }, { status: 400 });
    }

    // ২. Vercel এনভায়রনমেন্ট ভেরিয়েবল (Environment Variables) থেকে ডাটা নেওয়া
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // গুগল প্রাইভেট কি-এর নতুন লাইন বা স্পেসের সমস্যা এড়াতে JSON পার্সিং লজিক
    const pKey = process.env.GOOGLE_PRIVATE_KEY;
    const privateKey = pKey && pKey.startsWith('{') ? JSON.parse(pKey).privateKey : pKey;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    // ৩. গুগল অথেনটিকেশন (Google Auth) ক্লায়েন্ট সেটআপ
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey?.replace(/\\n/g, '\n'), // লাইন ব্রেক বা এন্টার ঠিক করার জন্য
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ৪. গুগল শিটের 'User_Database' ট্যাব থেকে ডাটা রিড করা
    const range = 'User_Database!A2:E'; // A=Name, B=Gmail, C=Password, D=UID, E=Status
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    let login_success = false;
    let user_data = null;
    let isDisabled = false;

    if (rows && rows.length > 0) {
      for (const row of rows) {
        const sheet_gmail = row[1] ? row[1].trim() : '';
        const sheet_password = row[2] ? row[2].trim() : '';

        // জিমেইল এবং পাসওয়ার্ড ম্যাচিং (Case-insensitive Gmail check)
        if (sheet_gmail.toLowerCase() === input_gmail.toLowerCase() && sheet_password === input_password) {
          
          // ইউজার যদি অ্যাডমিন দ্বারা ব্লক বা ইনঅ্যাক্টিভ থাকে (কলাম E)
          const sheet_status = row[4] ? row[4].trim().toLowerCase() : 'active';
          if (sheet_status === 'blocked' || sheet_status === 'inactive') {
            isDisabled = true;
            break;
          }

          login_success = true;
          user_data = {
            name: row[0] ? row[0] : 'ওয়ার্কার',
            gmail: sheet_gmail,
            uid: row[3] ? row[3] : '0000',
            role: 'worker'
          };
          break;
        }
      }
    }

    // ৫. ভিন্ন ভিন্ন কন্ডিশন অনুযায়ী রেসপন্স ব্যাক করা
    if (isDisabled) {
      return NextResponse.json({ error: 'account_disabled' }, { status: 403 });
    }

    if (login_success) {
      // সাকসেস হলে ইউজারের সব ডাটা ফ্রন্টএন্ডে পাঠিয়ে দেওয়া
      return NextResponse.json({ 
        success: true, 
        user: user_data 
      }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

  } catch (error) {
    console.error('Google Sheet API Error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
