"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import Link from "next/link";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_BASE = "/api";

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setRooms(json.data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id) => {
    if (!confirm("คุณต้องการลบห้องนี้ใช่หรือไม่?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE}/rooms/${id}`, {
        method: "DELETE", // ตรวจสอบว่าตรงนี้เป็น DELETE
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchRooms(); // รีเฟรชรายการห้องใหม่
      } else {
        alert("ไม่สามารถลบได้");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) return <div className="p-6">กำลังโหลดข้อมูล...</div>;

  const getStatusStyles = (status) => {
    if (status === "Available") return "bg-emerald-100 text-emerald-700";
    if (status === "Maintenance") return "bg-amber-100 text-amber-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <section className="overflow-hidden rounded-4xl bg-slate-200 px-6 py-7 shadow-2xl shadow-blue-200/60 md:px-8 md:py-9">
        <p className="text-sm font-semibold">The Art OR System</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">จัดการห้องผ่าตัด</h1>
        <p className="mt-2 text-sm font-medium">จัดการข้อมูลห้องผ่าตัด</p>
      </section>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-800">รายการห้อง</h2>
        <Link
          href="/rooms/add"
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-s font-bold text-blue-600 shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> เพิ่มห้องใหม่
        </Link>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-blue-100/30 backdrop-blur">
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-blue-600">
            <tr>
              <th className="p-4 text-[16px] font-bold uppercase tracking-wider text-slate-200">ชื่อห้อง</th>
              <th className="p-4 text-[16px] font-bold uppercase tracking-wider text-slate-200">ประเภทห้อง</th>
              <th className="p-4 text-[16px] font-bold uppercase tracking-wider text-slate-200">สถานะ</th>
              <th className="p-4 text-center text-[16px] font-bold uppercase tracking-wider text-slate-200">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-slate-50 hover:bg-blue-50/40">
                <td className="p-4 font-semibold text-slate-800">{room.room_name}</td>
                <td className="p-4 font-semibold text-slate-800">{room.room_type}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[14px] font-bold ${getStatusStyles(room.status)}`}
                  >
                    {room.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button
                    onClick={() => router.push(`/rooms/${room.id}`)}
                    className="rounded-2xl p-2 hover:bg-slate-100"
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => deleteRoom(room.id)}
                    className="rounded-2xl p-2 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
