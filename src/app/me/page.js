'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, Stethoscope, User, ShieldCheck } from "lucide-react";
import Toast from "../components/Toast";
import ProtectedRoute from "../components/ProtectedRoute";

export default function MePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        window.location.href = "/login"; // ถ้าไม่มี Token ให้เด้งทันที
        return;
      }

      try {
        const resp = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await resp.json();
        
        // ข้อมูล user มักจะอยู่ใน json.user ตามโครงสร้าง backend ทั่วไป
        setData(json.user || json.data || json);
        setLoading(false);
      } catch (err) {
        setToastMessage("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
        setToastOpen(true);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-lg p-6 space-y-6">
        <Toast open={toastOpen} variant="error" message={toastMessage} onClose={() => setToastOpen(false)} />

        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" /> โปรไฟล์ของบุคลากร
        </h1>

        {loading ? (
          <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : data ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                  <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 uppercase">
                    {data.name?.[0] || data.email?.[0] || "U"}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-14 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{data.name || "บุคลากรทางการแพทย์"}</h2>
                <p className="text-slate-500 text-sm flex items-center gap-1">Email: {data.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase">
                  <ShieldCheck className="h-3 w-3" /> {data.role || "User"}
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/"
                  className="flex items-center justify-center w-full bg-amber-400 hover:bg-amber-300 text-blue-800 font-semibold py-3 px-4 rounded-xl transition shadow-sm"
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  ไปยัง Dashboard ห้องผ่าตัด
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full bg-rose-200 hover:bg-rose-100 text-rose-600 font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 mb-4">ไม่พบข้อมูลผู้ใช้งาน</p>
            <Link href="/login" className="text-blue-600 font-bold hover:underline">กลับหน้า Login</Link>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}