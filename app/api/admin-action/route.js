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

// 📥 ১. GET মেথড: রিয়াল ডাটা ড্যাশবোর্ডে পাঠানো
export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // 🆕 ক) Users ট্যাব থেকে ইউজার লিস্ট রিড করা (যাতে উইথড্র পেজে ব্যালেন্স পায়)
    const resUsers = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Users!A2:F' });
    const userRows = resUsers.data.values || [];
    const workers = userRows.map((row, index) => ({
      row: index + 2,
      uid: row[0] || '',
      name: row[1] || '',
      email: row[2] || '',
      password: row[3] || '',
      totalIncome: Number(row[4]) || 0, // আপনার শিটের Balance কলাম
      joinedDate: row[5] || '',
    }));

    // খ) কাজের সাবমিশন রিড করা (Work_Submissions)
    const resSubmissions = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Work_Submissions!A2:H' });
    const subRows = resSubmissions.data.values || [];
    const submissions = subRows.map((row) => ({
      uid: row[0] || 'N/A', 
      task: row[1] || 'N/A', 
      price: row[2] || '0৳', 
      status: row[7] || 'Pending',
    }));

    // গ) উইথড্র রিকোয়েস্ট রিড করা (Withdraw_Requests)
    const resWithdraws = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Withdraw_Requests!A2:F' });
    const withdrawRows = resWithdraws.data.values || [];
    const withdraws = withdrawRows.map((row, index) => ({
      row: index + 2, 
      uid: row[0] || 'N/A', 
      method: row[1] || 'N/A', 
      number: row[2] || 'N/A', 
      amount: row[3] || '0৳', 
      date: row[4] || '',
      status: row[5] || 'Pending',
    }));

    // ঘ) পাবলিশ করা কাজের তালিকা
    const resPublished = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Published_Tasks!A2:K' });
    const publishedRows = resPublished.data.values || [];
    const publishedTasks = publishedRows
      .map((row, index) => ({
        row: index + 2,
        id: row[0],
        title: row[1],
        description: row[2],
        price: row[3],
        limit: row[4],
        pending: row[5],
        fields: row[6],
        date: row[7],
        submitted: row[8] || '0',
        approved: row[9] || '0',
        rejected: row[10] || '0',
      }))
      .filter(task => task.id && task.title);

    // ঙ) লাইভ নোটিশ রিড করা
    const resNotice = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Notice!A2:B' });
    const noticeData = resNotice.data.values || [];
    const currentNotice = noticeData[0] ? noticeData[0][0] : 'আজকের কোনো জরুরি নোটিশ নেই।';

    return NextResponse.json({ success: true, workers, submissions, withdraws, publishedTasks, currentNotice }, { status: 200 });
  } catch (error) {
    console.error('Admin GET API Error:', error);
    return NextResponse.json({ error: 'failed_to_fetch', success: false }, { status: 500 });
  }
}

// 📤 ২. POST মেথড: কাজ তৈরি, ডিলিট এবং লাইভ ডাটা ও ফরম্যাট চেকার ইঞ্জিন
export async function POST(request) {
  try {
    const body = await request.json();
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // 🔍 লাইভ ডুপ্লিকেট, ২এফএ এবং মেইল অ্যাক্সেস ফরম্যাট ভ্যালিডেটর
    if (body.actionType === 'CHECK_DUPLICATE_SUBMISSION') {
      const { fieldName, value } = body;
      
      if (!value || value.trim() === '') {
        return NextResponse.json({ isDuplicate: false, isInvalidFormat: false, message: '' });
      }

      if (fieldName === 'tfa') {
        const secretInput = value.trim().replace(/\s+/g, ''); 
        const base32Regex = /^[A-Z2-7]{16}$|^[A-Z2-7]{32}$/i; 
        
        if (!base32Regex.test(secretInput)) {
          return NextResponse.json({ 
            isDuplicate: false, 
            isInvalidFormat: true, 
            message: 'ভুল ২এফএ! শুধুমাত্র A-Z AND 2-7 কম্বিনেশনের ১৬ বা ৩২ অক্ষরের আসল সিক্রেট কি দিন।' 
          });
        }
      }

      if (fieldName === 'mail') {
        const pipeCount = (value.match(/\|/g) || []).length;
        const parts = value.split('|');
        const emailInput = parts[0]?.trim();
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);

        if (pipeCount < 3 || !isEmailValid) {
          return NextResponse.json({ 
            isDuplicate: false, 
            isInvalidFormat: true, 
            message: 'ভুল মেইল ফরম্যাট! অবশই মেইল|পাসওয়ার্ড|রিকভারি|কুকি এভাবে ৩টি পাইপ (|) চিহ্নসহ দিন।' 
          });
        }
      }

      const resSubmissions = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Work_Submissions!A2:G' });
      const rows = resSubmissions.data.values || [];

      const usedUIDs = rows.map(r => r[0]?.trim().toLowerCase());
      const usedPasswords = rows.map(r => r[2]?.trim().toLowerCase());
      const usedCookies = rows.map(r => r[5]?.trim().toLowerCase());

      const checkValue = value.trim().toLowerCase();

      if (fieldName === 'uid' && usedUIDs.includes(checkValue)) {
        return NextResponse.json({ isDuplicate: true, isInvalidFormat: false, message: 'এই UID/USER টি আগে ব্যবহার করা হয়েছে!' });
      }
      if (fieldName === 'password' && usedPasswords.includes(checkValue)) {
        return NextResponse.json({ isDuplicate: true, isInvalidFormat: false, message: 'এই পাসওয়ার্ডটি আগে অন্য আইডিতে ব্যবহার করা হয়েছে!' });
      }
      if (fieldName === 'cookie' && usedCookies.includes(checkValue)) {
        return NextResponse.json({ isDuplicate: true, isInvalidFormat: false, message: 'এই কুকি ডাটাটি আগে অন্য কেউ সাবমিট করেছে!' });
      }

      return NextResponse.json({ isDuplicate: false, isInvalidFormat: false, message: '' });
    }

    // ✏️ ইউজারের ইনফরমেশন (নাম, ইমেইল, পাসওয়ার্ড) এডিট করা
    if (body.actionType === 'EDIT_USER_DETAILS') {
      const { uid, newName, newEmail, newPassword } = body;
      
      const resUsers = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Users!A2:A' });
      const rows = resUsers.data.values || [];
      const rowIndex = rows.findIndex(r => r[0] === uid);

      if (rowIndex !== -1) {
        const actualRow = rowIndex + 2;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Users!B${actualRow}:D${actualRow}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[newName, newEmail, newPassword]] }
        });
        return NextResponse.json({ success: true, message: 'ইউজারের তথ্য সফলভাবে আপডেট হয়েছে!' });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🗑️ ইউজারকে ডাটাবেজ থেকে চিরতরে মুছে ফেলা
    if (body.actionType === 'DELETE_USER') {
      const { uid } = body;
      
      const resUsers = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Users!A2:A' });
      const rows = resUsers.data.values || [];
      const rowIndex = rows.findIndex(r => r[0] === uid);

      if (rowIndex !== -1) {
        const actualRow = rowIndex + 2;
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `Users!A${actualRow}:F${actualRow}` 
        });
        return NextResponse.json({ success: true, message: 'ইউজারকে চিরতরে ডিলিট করা হয়েছে!' });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ক) নোটিশ আপডেট করার লজিক
    if (body.actionType === 'UPDATE_NOTICE') {
      const { noticeText } = body;
      const today = new Date().toLocaleDateString('bn-BD');

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Notice!A2:B2',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[noticeText, today]] },
      });
      return NextResponse.json({ success: true, message: '📢 নোটিশ সফলভাবে গুগল শিটে আপডেট হয়েছে!' });
    }

    // খ) নতুন কাজ ডায়নামিক ফরম্যাটে পাবলিশ করা
    if (body.actionType === 'PUBLISH_TASK') {
      const { title, description, price, limit, formatFields } = body.taskData;
      const taskId = 'TASK_' + Date.now();
      
      const today = new Date();
      const formattedDate = String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0');

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Published_Tasks!A2:K',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[taskId, title, description, price, limit, '0', formatFields.join('-'), formattedDate, '0', '0', '0']],
        },
      });
      return NextResponse.json({ success: true, message: 'নতুন কাজ সফলভাবে পাবলিশ হয়েছে!' });
    }

    // গ) কাজ ডিলিট করার লজিক
    if (body.actionType === 'DELETE_TASK') {
      const { row } = body;
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `Published_Tasks!A${row}:K${row}`,
      });
      return NextResponse.json({ success: true, message: 'কাজটি সফলভাবে ডিলিট হয়েছে!' });
    }

    // 💸 [নতুন অ্যাড করা লজিক]: উইথড্র রিকোয়েস্ট গুগল শিটে যুক্ত করা
    if (body.actionType === 'SUBMIT_WITHDRAW_REQUEST') {
      const { email, method, number, amount, date } = body.payload;
      
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Withdraw_Requests!A2:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[email, method, number, `${amount}৳`, date, 'Pending']]
        },
      });
      return NextResponse.json({ success: true, message: 'উইথড্র রিকোয়েস্ট যুক্ত হয়েছে!' });
    }

    // ঘ) ওয়ার্কার কাজ ও উইথড্রয়াল স্ট্যাটাস আপডেট
    const { tabName, rowNumber, newStatus } = body;
    if (!tabName || !rowNumber || !newStatus) {
      return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
    }

    const column = tabName === 'Work_Submissions' ? 'H' : 'F';
    const range = `${tabName}!${column}${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[newStatus]] },
    });

    return NextResponse.json({ success: true, message: 'Status updated successfully!' });

  } catch (error) {
    console.error('Admin Action POST API Error:', error);
    return NextResponse.json({ error: 'server_error', success: false }, { status: 500 });
  }
}
