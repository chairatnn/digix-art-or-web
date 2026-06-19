// src/app/api/users/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const authHeader = request.headers.get('authorization');

    if (!backendUrl) {
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    // ยิงไปที่ Render (เช็คว่า Backend ของคุณใช้ /api/users หรือ /users)
    const resp = await fetch(`${backendUrl}/api/users`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      cache: 'no-store', // บังคับให้ดึงข้อมูลใหม่เสมอ ไม่ใช้ Cache
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });

  } catch (error) {
    console.error("Fetch Users Proxy Error:", error);
    return NextResponse.json({ message: "ไม่สามารถดึงข้อมูลได้" }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. ดึง Authorization Header จากหน้าบ้าน (Browser)
    const authHeader = request.headers.get('authorization');

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      console.error("Missing NEXT_PUBLIC_API_URL");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    // 2. ยิงไปที่ Render พร้อมแนบ Token ไปด้วย
    const resp = await fetch(`${backendUrl}/api/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // --- เพิ่มบรรทัดนี้เพื่อส่งต่อ Token ---
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });

  } catch (error) {
    console.error("Create User Proxy Error:", error);
    return NextResponse.json(
      { message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", error: error.message },
      { status: 500 }
    );
  }
}