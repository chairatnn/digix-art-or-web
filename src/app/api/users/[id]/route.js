import { NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

// 🚩 สำหรับการแก้ไข (PUT)
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    const resp = await fetch(`${backendUrl}/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Update Proxy Error" },
      { status: 500 },
    );
  }
}

// 🚩 สำหรับการลบ (DELETE)
export async function DELETE(request, { params }) {
  try {
    // 🚩 จุดสำคัญ: ต้อง await params ก่อนดึง id
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const authHeader = request.headers.get("authorization");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    // ตรวจสอบความถูกต้องก่อนส่งไป Backend จริง
    if (!id || id === "undefined") {
      console.error("❌ ID is undefined in Proxy");
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    // ยิงไปที่ Backend (Render) - มั่นใจว่ามี /api นำหน้าตามที่แก้ใน app.js
    const resp = await fetch(`${backendUrl}/api/users/${id}`, {
      method: "DELETE",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    console.error("Delete Proxy Error:", error);
    return NextResponse.json(
      { message: "เซิร์ฟเวอร์ตอบสนองผิดพลาด" },
      { status: 500 },
    );
  }
}
