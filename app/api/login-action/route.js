import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// 🔒 গুগল শিট অথেনটিকেশন ক্লায়েন্ট সেটআপ
async function getSheetsClient() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Users ট্যাব থেকে UID, Name, Email, Password ডাটা তুলে আনা
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A2:D',
    });
    const rows = response.data.values || [];

    // ওয়ার্কারের দেওয়া ইনপুট থেকে অতিরিক্ত স্পেস বা বড় হাতের অক্ষর ট্রিম করা
    const inputEmail = email?.trim().toLowerCase();
    const inputPassword = password?.trim();

    // গুগল শিটের ডাটার সাথে নিখুঁতভাবে মেলানোর লজিক
    const matchedUser = rows.find(row => {
      const dbEmail = row[2]?.trim().toLowerCase();
      const dbPassword = row[3]?.trim();
      return dbEmail === inputEmail && dbPassword === inputPassword;
    });

    if (matchedUser) {
      return NextResponse.json({
        success: true,
        user: {
          uid: matchedUser[0],
          name: matchedUser[1],
          email: matchedUser[2]
        }
      });
    } else {
      return NextResponse.json({ success: false, message: 'invalid_credentials' }, { status: 400 });
    }

  } catch (error) {
    console.error('Worker Login Action API Error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
