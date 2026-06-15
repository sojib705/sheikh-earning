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

    // Users ট্যাব থেকে A, B, C কলামের ডাটা তুলে আনা (Name, Email, Password)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A2:C',
    });
    const rows = response.data.values || [];

    // ইনপুট ডাটা ট্রিম ও লোয়ারকেস করা
    const inputEmail = email?.trim().toLowerCase();
    const inputPassword = password?.trim();

    // 🎯 [কলাম ফিক্সড লজিক]: আপনার শিট অনুযায়ী B কলাম (row[1]) ইমেইল এবং C কলাম (row[2]) পাসওয়ার্ড
    const matchedUser = rows.find(row => {
      const dbEmail = row[1]?.trim().toLowerCase(); // B কলাম
      const dbPassword = row[2]?.trim();            // C কলাম
      return dbEmail === inputEmail && dbPassword === inputPassword;
    });

    if (matchedUser) {
      return NextResponse.json({
        success: true,
        user: {
          uid: 'UID_' + Math.floor(100000 + Math.random() * 900000), // ব্যাকআপ UID জেনারেটর
          name: matchedUser[0], // A কলাম (Name)
          email: matchedUser[1] // B কলাম (Email)
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
