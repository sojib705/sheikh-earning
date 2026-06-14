import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'সবগুলো বক্স পূরণ করুন' }, { status: 400 });
    }

    // ১. একটি ইউনিক ইউজার UID তৈরি করা (যেমন: uid_847329)
    const randomUID = `uid_${Math.floor(100000 + Math.random() * 900000)}`;
    
    // ২. বর্তমান তারিখ ও সময় নেওয়া (Join Date)
    const joinDate = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ৩. গুগল শিটের 'Users' ট্যাবে নতুন লাইনে ডাটা পুশ করা
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Users!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[randomUID, name, email, password, 0, joinDate]], // শুরুতে ব্যালেন্স ০ টাকা
      },
    });

    return NextResponse.json({ success: true, uid: randomUID }, { status: 200 });

  } catch (error) {
    console.error('Create User API Error:', error);
    return NextResponse.json({ error: 'সার্ভার এরর!' }, { status: 500 });
  }
      }
