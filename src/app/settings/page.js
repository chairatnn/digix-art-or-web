"use client";

import { useState, useEffect } from "react";
import {
  Info,
  ShieldCheck,
  Stethoscope,
  User,
  Code2,
  ExternalLink,
  LayoutDashboard,
  Activity,
} from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function SettingsPage() {
  const systemInfo = {
    version: "2.0.0",
    buildDate: "2026-06-10",
    environment: "Production",
    framework: "Next.js 14 (App Router)",
    database: "PostgreSQL (OR-System)",
  };

  const [systemData, setSystemData] = useState(null);

  useEffect(() => {
    async function fetchSystemInfo() {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch("/api/system/info", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const json = await resp.json();
        setSystemData(json.data);
      }
    }
    fetchSystemInfo();
  }, []);

  return (
    <ProtectedRoute>
      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            ตั้งค่าและข้อมูลระบบ
          </h1>
          <p className="text-slate-500 mt-2">
            ศูนย์จัดการคิวผ่าตัดและทรัพยากรห้องผ่าตัด (OR Management)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: System Info Card */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                สถานะระบบ
              </h2>
              <div className="grid grid-cols-2 gap-y-6 text-sm">
                <div>
                  <p className="text-slate-600 mb-1">System Name</p>
                  <p className="font-semibold text-slate-700">OR Management System</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Version</p>
                  <p className="font-semibold text-slate-700">{systemData?.version || systemInfo.version}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Database Engine</p>
                  <p className="font-semibold text-slate-700">{systemInfo.database}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Deployment Date</p>
                  <p className="font-semibold text-slate-700">{systemInfo.buildDate}</p>
                </div>
              </div>
            </section>

            {/* Section 2: Roles Explanation */}
            <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                ระดับสิทธิ์การใช้งาน
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50">
                  <div className="bg-blue-100 p-2 rounded-lg h-fit">
                    <span className="text-xs font-bold text-blue-700">Admin</span>
                  </div>
                  <p className="text-sm text-slate-600">จัดการข้อมูลแพทย์, เจ้าหน้าที่, ห้องผ่าตัด, เตียงพักฟื้น และตั้งค่าระบบภาพรวม</p>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50">
                  <div className="bg-emerald-100 p-2 rounded-lg h-fit">
                    <span className="text-xs font-bold text-blue-700">Doctor</span>
                  </div>
                  <p className="text-sm text-slate-600">ดูตารางผ่าตัดของตนเอง และบันทึกข้อมูลเวลาการผ่าตัด (Time Logs)</p>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50">
                  <div className="bg-amber-300 p-2 rounded-lg h-fit">
                    <span className="text-xs font-bold text-blue-700">ORStaff</span>
                  </div>
                  <p className="text-sm text-slate-600">จัดการคิวจองผ่าตัด, จัดสรรห้องและเตียง, และประสานงานตารางรายวัน</p>
                </div>
              </div>
            </section>
          </div>

          {/* Section 3: Sidebar */}
          <div className="space-y-6">
            <section className="bg-[#8D746A] text-white rounded-3xl p-8 shadow-md">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                ฝ่ายสนับสนุน
              </h2>
              <p className="text-white text-sm mb-4">
                ระบบจัดการห้องผ่าตัดเพื่อเพิ่มประสิทธิภาพการบริหารทรัพยากรทางการแพทย์
              </p>
              <div className="text-xs text-white">ติดต่อไอทีห้องผ่าตัด: ต่อ 1234</div>
            </section>

            <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                คู่มือการใช้งาน
              </h2>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-1">วิธีลงทะเบียนจองคิว <ExternalLink className="h-3 w-3" /></a></li>
                <li><a href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-1">แนวทางบันทึก Time Log <ExternalLink className="h-3 w-3" /></a></li>
              </ul>
            </section>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs py-10">© 2026 OR Management System Project.</p>
      </main>
    </ProtectedRoute>
  );
}