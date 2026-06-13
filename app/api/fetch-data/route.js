import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request) {
  try {
    // ১. ইউআরএল প্যারামিটার থেকে ওয়ার্কারের UID রিসিভ করা (যেমন: /api/fetch-data?uid=uid_884732)
    const { searchParams } = new URL(request.url);
    const workerUid = searchParams.get('uid');

    if (!workerUid) {
      return NextResponse.json({ error: 'uid_required' }, { status: 400 });
    }

    // ২. এনভায়রনমেন্ট ভেরিয়েবল থেকে গুগল শিটের ক্রেডেনশিয়ালস নেওয়া
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    // ৩. গুগল অথেনটিকেশন ক্লায়েন্ট সেটআপ
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ৪. গুগল শিটের 'Work_Submissions' (কাজের হিস্ট্রি) ট্যাব থেকে ডাটা রিড করা
    const workResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Work_Submissions!A2:I', // A=তারিখ, B=কাজের নাম, C=UID, H=স্ট্যাটাস, I=টাকা
    });

    const allWorkRows = workResponse.data.values || [];
    
    // নির্দিষ্ট ওয়ার্কারের UID অনুযায়ী কাজের হিস্ট্রি ফিল্টার করা
    const workerHistory = allWorkRows
      .filter(row => row[2] && row[2].trim() === workerUid.trim())
      .map(row => ({
        date: row[0] || '',
        taskName: row[1] || '',
        status: row[7] || 'Pending',
        price: row[8] || '0'
      }));

    // ৫. গুগল শিটের 'Withdraw_Requests' (উইথড্র হিস্ট্রি) ট্যাব থেকে ডাটা রিড করা
    const withdrawResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Withdraw_Requests!A2:F', // A=তারিখ, B=মেথড, C=নাম্বার, D=পরিমাণ, E=UID, F=স্ট্যাটাস
    });

    const allWithdrawRows = withdrawResponse.data.values || [];

    // নির্দিষ্ট ওয়ার্কারের UID অনুযায়ী উইথড্র হিস্ট্রি ফিল্টার করা
    const workerWithdraws = allWithdrawRows
      .filter(row => row[4] && row[4].trim() === workerUid.trim())
      .map(row => ({
        date: row[0] || '',
        method: row[1] || '',
        number: row[2] || '',
        amount: row[3] || '0',
        status: row[5] || 'Pending'
      }));

    // ৬. ফিল্টার করা কাজের ও উইথড্রর সমস্ত রেকর্ড একসাথে ফ্রন্টঅ্যান্ডে পাঠানো
    return NextResponse.json({
      success: true,
      history: workerHistory,
      withdraws: workerWithdraws
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch Data API Error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
