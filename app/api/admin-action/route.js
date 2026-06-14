import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    const body = await request.json();
    const { tabName, rowNumber, newStatus } = body; // কোন ট্যাব, কত নম্বর লাইন, এবং কী লিখতে হবে

    if (!tabName || !rowNumber || !newStatus) {
      return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // কোন কলাম আপডেট হবে তা ঠিক করা (Work_Submissions এর H কলাম বা Withdraw_Requests এর F কলাম)
    const column = tabName === 'Work_Submissions' ? 'H' : 'F';
    const range = `${tabName}!${column}${rowNumber}`; // যেমন: Work_Submissions!H5

    // গুগল শিটে নতুন স্ট্যাটাসটি লিখে দেওয়া
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStatus]], // আপনি ওখান থেকে যা লিখে পাঠাবেন (Approved/Rejected/Paid) হুবহু ওটা বসবে
      },
    });

    return NextResponse.json({ success: true, message: 'Status updated in Google Sheet!' }, { status: 200 });

  } catch (error) {
    console.error('Admin Action API Error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
