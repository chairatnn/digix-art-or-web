"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function EditRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState({
    room_name: "",
    room_type: "", // เพิ่ม field นี้
    status: "Available",
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = "http://localhost:3000/api";

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      // จุดสำคัญ: เช็คโครงสร้าง json ให้ดี
      if (json.success && json.data) {
        setRoom(json.data); // ตรงนี้จะทำให้ State อัปเดตและหน้าจอเปลี่ยนตาม
      }
    } catch (error) {
      console.error("Error fetching room:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(room),
      });

      if (res.ok) {
        alert("อัปเดตข้อมูลเรียบร้อยแล้ว");
        router.push("/rooms");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (loading) return <div className="p-6">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <section className="overflow-hidden rounded-[2rem] bg-blue-600 px-6 py-7 text-white shadow-2xl shadow-blue-200/60 md:px-8 md:py-9">
        <p className="text-sm font-semibold text-blue-100">The Art OR System</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">แก้ไขข้อมูลห้อง</h1>
        <p className="mt-2 text-sm font-medium text-blue-50/90">{room.room_name || "กำลังโหลดข้อมูลห้อง..."}</p>
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
            placeholder="เช่น ห้องผ่าตัด, ห้องพักฟื้น"
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
            <Save className="h-4 w-4" /> บันทึกการแก้ไข
          </button>
        </div>
      </form>
    </div>
  );
}
