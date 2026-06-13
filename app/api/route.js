import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request) {
  try {
    // 1. ইউআরএল থেকে ওয়ার্কারের UID ডিটেক্ট করা (যেমন: /api/fetch-data?uid=uid_884732)
    const { searchParams } = new URL(request.url);
    const workerUid = searchParams.get('uid');

    if (!workerUid) {
      return NextResponse.json({ error: 'uid_required' }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 2. গুগল শিটের 'Work_Submissions' (কাজের হিস্ট্রি) ট্যাব থেকে ডাটা রিড করা
    // কলাম বিন্যাস: A=তারিখ, B=কাজের নাম, C=UID, D=পাসওয়ার্ড, E=2FA, F=মেইল, G=কুকি, H=স্ট্যাটাস, I=টাকা
    const workResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Work_Submissions!A2:I',
    });

    const allWorkRows = workResponse.data.values || [];
    
    // শুধু এই নির্দিষ্ট ওয়ার্কারের কাজের হিস্ট্রি ফিল্টার করে আলাদা করা
    const workerHistory = allWorkRows
      .filter(row => row[2] && row[2].trim() === workerUid.trim())
      .map(row => ({
        date: row[0] || '',
        taskName: row[1] || '',
        status: row[7] || 'Pending',
        price: row[8] || '0'
      }));

    // 3. গুগল শিটের 'Withdraw_Requests' (উইথড্র হিস্ট্রি) ট্যাব থেকে ডাটা রিড করা
    // কলাম বিন্যাস: A=তারিখ, B=মেথড, C=নাম্বার, D=পরিমাণ, E=UID, F=স্ট্যাটাস
    const withdrawResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Withdraw_Requests!A2:F',
    });

    const allWithdrawRows = withdrawResponse.data.values || [];

    // শুধু এই নির্দিষ্ট ওয়ার্কারের উইথড্র হিস্ট্রি ফিল্টার করা
    const workerWithdraws = allWithdrawRows
      .filter(row => row[4] && row[4].trim() === workerUid.trim())
      .map(row => ({
        date: row[0] || '',
        method: row[1] || '',
        number: row[2] || '',
        amount: row[3] || '0',
        status: row[5] || 'Pending'
      }));

    // 4. ফিল্টার করা সব ডাটা একসাথে ফ্রنتএন্ড ড্যাশবোর্ডে রেসপন্স পাঠানো
    return NextResponse.json({
      success: true,
      history: workerHistory,
      withdraws: workerWithdraws
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch Data Error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
