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

// 📥 ১. GET মেথড: ওয়ার্কারদের কাজ, উইথড্র, পাবলিশ করা কাজ এবং লাইভ নোটিশ ড্যাশবোর্ডে পাঠানো
export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // ক) কাজের সাবমিশন রিড করা (Work_Submissions)
    const resSubmissions = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Work_Submissions!A2:H' });
    const subRows = resSubmissions.data.values || [];
    const submissions = subRows.map((row, index) => ({
      row: index + 2, 
      uid: row[0] || 'N/A', 
      task: row[1] || 'N/A', 
      price: row[2] || '0৳', 
      status: row[7] || 'Pending', // H কলাম হলো আপনার স্ট্যাটাস (Index 7)
    }));

    // খ) উইথড্র রিকোয়েস্ট রিড করা (Withdraw_Requests)
    const resWithdraws = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Withdraw_Requests!A2:F' });
    const withdrawRows = resWithdraws.data.values || [];
    const withdraws = withdrawRows.map((row, index) => ({
      row: index + 2, 
      uid: row[0] || 'N/A', 
      method: row[1] || 'N/A', 
      number: row[2] || 'N/A', 
      amount: row[3] || '0৳', 
      status: row[5] || 'Pending', // F কলাম হলো উইথড্র স্ট্যাটাস (Index 5)
    }));

    // গ) আপনার পাবলিশ করা নতুন ডায়নামিক কাজের তালিকা রিড করা (Published_Tasks)
    const resPublished = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Published_Tasks!A2:K' });
    const publishedRows = resPublished.data.values || [];
    const publishedTasks = publishedRows.map((row, index) => ({
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
    }));

    // ঘ) 📢 লাইভ নোটিশ রিড করা (Notice ট্যাব থেকে ২ নম্বর লাইনের ডাটা)
    const resNotice = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Notice!A2:B' });
    const noticeData = resNotice.data.values || [];
    const currentNotice = noticeData[0] ? noticeData[0][0] : 'আজকের কোনো জরুরি নোটিশ নেই।';

    return NextResponse.json({ submissions, withdraws, publishedTasks, currentNotice }, { status: 200 });
  } catch (error) {
    console.error('Admin GET API Error:', error);
    return NextResponse.json({ error: 'failed_to_fetch' }, { status: 500 });
  }
}

// 📤 ২. POST মেথড: কাজ তৈরি, এডিট, ডিলিট, স্ট্যাটাস এবং নোটিশ আপডেট করা
export async function POST(request) {
  try {
    const body = await request.json();
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // ক) 📢 নোটিশ আপডেট করার নতুন লজিক
    if (body.actionType === 'UPDATE_NOTICE') {
      const { noticeText } = body;
      const today = new Date().toLocaleDateString('bn-BD');

      // Notice ট্যাবের A2 এবং B2 ঘরে নোটিশ ও তারিখ ওভাররাইট (Update) হবে
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Notice!A2:B2',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[noticeText, today]],
        },
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

    // গ) কাজ সংশোধন (Edit Task) করার লজিক
    if (body.actionType === 'EDIT_TASK') {
      const { row, title, description, price, limit, formatFields } = body.taskData;
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Published_Tasks!B${row}:G${row}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[title, description, price, limit, '0', formatFields.join('-')]],
        },
      });
      return NextResponse.json({ success: true, message: 'কাজটি সফলভাবে এডিট হয়েছে!' });
    }

    // ঘ) কাজ ডিলিট (Delete Task) করার লজিক
    if (body.actionType === 'DELETE_TASK') {
      const { row } = body;
      
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `Published_Tasks!A${row}:K${row}`,
      });
      return NextResponse.json({ success: true, message: 'কাজটি সফলভাবে ডিলিট হয়েছে!' });
    }

    // ঙ) ওয়ার্কার কাজ ও উইথড্রয়াল স্ট্যাটাস (Approve/Reject) আপডেটের মেইন লজিক
    const { tabName, rowNumber, newStatus } = body;

    if (!tabName || !rowNumber || !newStatus) {
      return NextResponse.json({ error: 'invalid_fields' }, { status: 400 });
    }

    // আপনার কলাম স্ট্রাকচার অনুযায়ী: Work_Submissions = H, Withdraw_Requests = F
    const column = tabName === 'Work_Submissions' ? 'H' : 'F';
    const range = `${tabName}!${column}${rowNumber}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStatus]],
      },
    });

    return NextResponse.json({ success: true, message: 'Status updated in Google Sheet!' }, { status: 200 });

  } catch (error) {
    console.error('Admin Action POST API Error:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
