"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import { Plus, Pencil, Trash2, BedDouble } from "lucide-react";

export default function BedsPage() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState("");
  const debounceRef = useRef(null);

  // const API_BASE = "/api";
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const getDisplayStatus = (status) => {
    if (status === "Maintenance") return "Maintenance";
    if (status === "Vacant") return "Vacant";
    return "Occupied";
  };

  const getStatusClasses = (status) => {
    if (status === "Vacant") return "bg-green-100 text-green-700";
    if (status === "Occupied") return "bg-amber-100 text-amber-700";
    if (status === "Maintenance") return "bg-rose-100 text-rose-700";
    return "bg-slate-100 text-slate-600";
  };

  // 1. โหลดรายการเตียง
  const loadBeds = async (query = "", showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${API_BASE}/beds?search=${encodeURIComponent(query)}`;
      const resp = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const json = await resp.json();
      if (resp.ok) {
        // 👈 เพิ่มการ Sort ตรงนี้ครับ
        const sortedBeds = (json.data || []).sort((a, b) => 
          a.bed_number.localeCompare(b.bed_number, undefined, { numeric: true, sensitivity: 'base' })
        );
        setBeds(sortedBeds);
      } else {
        setError(json.message || "โหลดข้อมูลเตียงไม่สำเร็จ");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 2. ลบเตียง
  const handleDelete = async (id, bedNumber) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเตียงหมายเลข "${bedNumber}"?`)) return;
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`${API_BASE}/beds/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        alert("ลบข้อมูลเตียงสำเร็จ");
        loadBeds(searchTerm, false);
      } else {
        const json = await resp.json();
        alert(json.message || "ลบไม่สำเร็จ");
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("memberRole") || "");
    loadBeds("", true);
  }, []);

  const canManage = userRole === "Admin"; // กำหนดสิทธิ์ผู้ดูแล

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadBeds(searchTerm, false), 300);
  }, [searchTerm]);

  if (loading) return <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>;

  return (
    <ProtectedRoute>
      <main className="space-y-6 p-4 md:p-6">
        <section className="overflow-hidden rounded-[30px] bg-slate-200 px-6 py-7 shadow-2xl shadow-blue-200/60 md:px-8 md:py-9">
          <p className="text-sm font-semibold">The Art OR System</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">จัดการเตียงพักฟื้น</h1>
          <p className="mt-2 text-sm font-medium">แสดงสถานะและจัดการเตียงตามการจองคิวห้องผ่าตัด</p>
        </section>

        <div className="flex flex-col gap-4 border-b border-blue-600 pb-4 md:flex-row md:items-center md:justify-between">
          <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-800">
            <BedDouble className="text-blue-600"/> รายการเตียง
          </h2>
          {canManage && (
            <Link href="/beds/add" className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-s font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5">
              <Plus className="h-4 w-4" /> เพิ่มเตียงใหม่
            </Link>
          )}
        </div>

        <div className="mb-8">
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 md:w-1/2"
            placeholder="ค้นหาเตียงหรือหอผู้ป่วย (Ward)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {beds.length === 0 ? (
            <p className="text-gray-500 italic">ไม่พบข้อมูลเตียงในระบบ</p>
          ) : (
            beds.map((bed) => (
              <div key={bed.id} className="flex flex-col gap-3 rounded-[26px] border border-slate-200/70 bg-white/90 p-5 shadow-lg shadow-blue-100/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-100/40">
                <div className="flex justify-between items-start">
                  <h3 className="text-l font-extrabold text-slate-800">{bed.bed_number}</h3>
                  <div className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${getStatusClasses(getDisplayStatus(bed.status))}`}>
                    {getDisplayStatus(bed.status)}
                  </div>
                </div>
                
                <p className="text-slate-500 text-xs">หอผู้ป่วย: {bed.ward_name}</p>

                {canManage && (
                  <div className="flex gap-2 mt-auto pt-4 border-t">
                    <Link href={`/beds/${bed.id}`} className="flex-1 text-center rounded-2xl bg-slate-100 py-2 text-sm font-semibold !text-blue-700 transition hover:bg-slate-200">
                      <Pencil className="h-4 w-4 inline" /> แก้ไข
                    </Link>
                    <button onClick={() => handleDelete(bed.id, bed.bed_number)} className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}