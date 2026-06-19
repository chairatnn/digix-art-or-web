// src/app/api/me/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    const authHeader = request.headers.get('authorization');

    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is missing");
    }


    const resp = await fetch(`${backendUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: 'no-store',
    });

    const data = await resp.json();

    // ส่งข้อมูล User กลับไปให้ Frontend (เช่น { id, name, role })
    return NextResponse.json(data, { status: resp.status });

  } catch (error) {
    console.error("[Me API Proxy Error]:", error.message);
    return NextResponse.json(
      { message: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้', error: error.message },
      { status: 500 }
    );
  }
}