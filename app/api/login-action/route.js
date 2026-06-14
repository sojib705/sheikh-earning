import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // এখানে আমরা 'gmail' অথবা 'email' যেকোনোটাকেই রিসিভ করার ব্যবস্থা করলাম
    const input_gmail = (body.gmail || body.email || '').trim();
    const input_password = (body.password || '').trim();

    if (!input_gmail || !input_password) {
      return NextResponse.json({ error: 'empty_fields' }, { status: 400 });
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const pKey = process.env.GOOGLE_PRIVATE_KEY;
    const privateKey = pKey ? pKey.replace(/\\n/g, '\n') : '';
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ট্যাব থেকে ডাটা রিড করা
    const range = 'Users!A2:F'; 
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    let login_success = false;
    let user_data = null;

    if (rows && rows.length > 0) {
      for (const row of rows) {
        // row[2] হলো Email, row[3] হলো Password (আপনার নতুন Users শিট অনুযায়ী)
        const sheet_gmail = row[2] ? row[2].trim() : '';
        const sheet_password = row[3] ? row[3].trim() : '';

        if (sheet_gmail.toLowerCase() === input_gmail.toLowerCase() && sheet_password === input_password) {
          login_success = true;
          user_data = {
            uid: row[0] || '',
            name: row[1] || '',
            gmail: sheet_gmail,
            balance: row[4] || '0',
            role: 'worker'
          };
          break;
        }
      }
    }

    if (login_success) {
      return NextResponse.json({ success: true, user: user_data }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

  } catch (error) {
    console.error('Google Sheet API Error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
