"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function AddRoomPage() {
  const router = useRouter();
  const [room, setRoom] = useState({
    room_name: "",
    room_type: "", // เพิ่ม field นี้
    status: "Available",
  });
  const API_BASE = "/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(room),
      });

      if (res.ok) {
        alert("เพิ่มห้องใหม่สำเร็จ");
        router.push("/rooms");
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <section className="overflow-hidden rounded-[2rem] bg-blue-600 px-6 py-7 text-white shadow-2xl shadow-blue-200/60 md:px-8 md:py-9">
        <p className="text-sm font-semibold text-blue-100">The Art OR System</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">เพิ่มห้องผ่าตัดใหม่</h1>
      </section>

      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4" /> ย้อนกลับ
      </button>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-blue-100/30 backdrop-blur"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            ชื่อห้อง
          </label>
          <input
            type="text"
            value={room.room_name}
            onChange={(e) => setRoom({ ...room, room_name: e.target.value })}
            className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="ระบุชื่อห้อง เช่น OR-01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            ประเภทห้อง
          </label>
          <input
            type="text"
            value={room.room_type}
            onChange={(e) => setRoom({ ...room, room_type: e.target.value })}
            className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="เช่น ห้องผ่าตัดใหญ่, ห้องพักฟื้น"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            สถานะ
          </label>
          <select
            value={room.status}
            onChange={(e) => setRoom({ ...room, status: e.target.value })}
            className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" /> บันทึกข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
}
