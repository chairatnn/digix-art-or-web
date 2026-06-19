// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // ดึง URL จาก Environment ที่เราตั้งค่าไว้ (ย้ำ: ต้องสะกดตรงกับใน Vercel Settings)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined in Vercel Settings");
    }

    // ยิงตรงไปที่ Render Backend (ย้ำ: path คือ /auth/login ตามที่คุยกัน)
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // ส่ง Data และ Status กลับไปให้หน้าบ้าน (Frontend)
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error("Vercel Proxy Error:", error.message);
    return NextResponse.json(
      { message: "ขออภัย ระบบเชื่อมต่อหลังบ้านขัดข้อง", error: error.message },
      { status: 500 }
    );
  }
}