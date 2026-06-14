import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    // ১. ফর্ম থেকে আসা জিমেইল ও পাসওয়ার্ড রিসিভ করা
    const body = await request.json();
    const { gmail, password } = body;

    const input_gmail = gmail ? gmail.trim() : '';
    const input_password = password ? password.trim() : '';

    if (!input_gmail || !input_password) {
      return NextResponse.json({ error: 'empty_fields' }, { status: 400 });
    }

    // ২. Vercel এনভায়রনমেন্ট ভেরিয়েবল থেকে ডাটা নেওয়া
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const pKey = process.env.GOOGLE_PRIVATE_KEY;
    const privateKey = pKey && pKey.startsWith('{') ? JSON.parse(pKey).privateKey : pKey;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    // ৩. গুগল অথেনটিকেশন ক্লায়েন্ট সেটআপ
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ৪. গুগল শিটের 'Users' ট্যাব থেকে ডাটা রিড করা (সঠিক রেঞ্জ)
    const range = 'Users!A2:F'; // A=UID, B=Name, C=Email, D=Password, E=Balance, F=Join_Date
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    let login_success = false;
    let user_data = null;

    if (rows && rows.length > 0) {
      for (const row of rows) {
        // আপনার নতুন 'Users' শিটের কলাম অনুযায়ী সঠিক ইনডেক্স সেট করা হলো
        const sheet_uid = row[0] ? row[0].trim() : '';
        const sheet_name = row[1] ? row[1].trim() : '';
        const sheet_gmail = row[2] ? row[2].trim() : '';
        const sheet_password = row[3] ? row[3].trim() : '';
        const sheet_balance = row[4] ? row[4].trim() : '0';

        // জিমেইল এবং পাসওয়ার্ড ম্যাচিং চেক
        if (sheet_gmail.toLowerCase() === input_gmail.toLowerCase() && sheet_password === input_password) {
          login_success = true;
          user_data = {
            uid: sheet_uid,
            name: sheet_name,
            gmail: sheet_gmail,
            balance: sheet_balance,
            role: 'worker'
          };
          break;
        }
      }
    }

    // ৫. কন্ডিশন অনুযায়ী রেসপন্স ব্যাক করা
    if (login_success) {
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
