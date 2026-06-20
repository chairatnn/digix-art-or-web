"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, DoorOpen, BedDouble, Users } from "lucide-react";
import ProtectedRoute from "./components/ProtectedRoute";
import Link from "next/link";

export default function DashboardPage() {
  const [data, setData] = useState({
    stats: { totalCases: 0, activeRooms: 0, availableBeds: 0, totalStaff: 0 },
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const apiBase = "/api";
        const headers = { Authorization: `Bearer ${token}` };

        const [scheduleResp, bedsResp, usersResp] = await Promise.all([
          fetch(`${apiBase}/or-system/daily-schedule`, { headers }),
          fetch(`${apiBase}/beds`, { headers }),
          fetch(`${apiBase}/users`, { headers }),
        ]);

        const [scheduleResult, bedsResult, usersResult] = await Promise.all([
          scheduleResp.json(),
          bedsResp.json(),
          usersResp.json(),
        ]);

        if (scheduleResp.ok && Array.isArray(scheduleResult.data)) {
          const getLocalDateString = (dateStr) => {
            const d = new Date(dateStr);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          };

          const today = getLocalDateString(new Date());
          const todayData = scheduleResult.data
            .filter((item) => getLocalDateString(item.booking_date) === today)
            .sort((a, b) =>
              a.estimated_start_time.localeCompare(b.estimated_start_time),
            );

          const activeRoomCount = new Set(
            todayData
              .filter((caseRow) => caseRow.room_id)
              .map((caseRow) => caseRow.room_id),
          ).size;

          const availableBeds = Array.isArray(bedsResult?.data)
            ? bedsResult.data.filter((bed) => bed.status === "Vacant").length
            : 0;

          const totalStaff = Array.isArray(usersResult?.data)
            ? usersResult.data.filter(
                (user) =>
                  user.status === "active" &&
                  ["Admin", "Doctor", "ORStaff"].includes(user.role),
              ).length
            : 0;

          setData({
            stats: {
              totalCases: todayData.length,
              activeRooms: activeRoomCount,
              availableBeds,
              totalStaff,
            },
            recentBookings: todayData,
          });
        }
      } catch (err) {
        console.error("OR Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleUpdateTimeLog = async (bookingId, columnName) => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`/api/or-system/bookings/${bookingId}/time-log`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ columnName }),
      });
      window.location.reload();
    } catch (err) {
      alert("ระบบขัดข้อง");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-medium text-slate-500">
        กำลังโหลดข้อมูล...
      </div>
    );

  const { stats, recentBookings } = data;

  return (
    <ProtectedRoute>
      <main className="space-y-4 p-2 md:p-2">
        <section className="overflow-hidden rounded-4xl bg-blue-600 px-6 py-7 text-white shadow-2xl shadow-blue-200/60 md:px-8 md:py-9">
          <p className="text-sm font-semibold text-blue-100">
            The Art OR System
          </p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight md:text-3xl">
                OR Dashboard
              </h1>
              <p className="mt-3 text-sm font-medium text-blue-50/90">
                ตารางผ่าตัดวันที่
                <span className="ml-2 font-bold text-white">
                  {new Date().toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
            <Link
              href="/or-bookings"
              className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-s font-bold text-blue-800! shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5"
            >
              จัดการคิวผ่าตัด
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="เคสวันนี้"
            value={stats.totalCases}
            icon={CalendarPlus}
            color="blue"
          />
          <StatCard
            label="ห้องที่ใช้งาน"
            value={stats.activeRooms}
            icon={DoorOpen}
            color="emerald"
          />
          <StatCard
            label="เตียงว่าง"
            value={stats.availableBeds}
            icon={BedDouble}
            color="indigo"
          />
          <StatCard
            label="เจ้าหน้าที่"
            value={stats.totalStaff}
            icon={Users}
            color="orange"
          />
        </div>

        <div className="overflow-hidden rounded-4xl border border-slate-200/70 bg-white/90 shadow-xl shadow-blue-100/30 backdrop-blur">
          <div className="border-b border-slate-100 px-6 py-5 md:px-8">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
              รายการจัดคิวผ่าตัด
            </h2>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[14px] font-bold text-slate-800 uppercase tracking-wider">
                  ช่วงเวลา
                </th>
                <th className="px-8 py-4 text-[14px] font-bold text-slate-800 uppercase tracking-wider">
                  ข้อมูลคนไข้
                </th>
                <th className="px-8 py-4 text-[14px] font-bold text-slate-800 uppercase tracking-wider">
                  หัตถการ/แพทย์
                </th>
                <th className="px-8 py-4 text-[14px] font-bold text-slate-800 uppercase tracking-wider">
                  ห้อง/เตียง
                </th>
                <th className="px-8 py-4 text-[14px] font-bold text-slate-800 uppercase tracking-wider">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentBookings.length > 0 ? (
                recentBookings.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-8 py-5 font-bold text-blue-600 text-sm">
                      {row.estimated_start_time?.substring(0, 5)} -{" "}
                      {row.estimated_end_time?.substring(0, 5)}
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-900">
                        {row.patient_name}
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold">
                        {row.hn}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-900">
                        {row.procedure_name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {row.doctor_name}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-800">
                        {row.room_name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        พักฟื้น {row.bed_number}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        {!row.patient_in_time && (
                          <button
                            onClick={() =>
                              handleUpdateTimeLog(row.id, "patient_in_time")
                            }
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100"
                          >
                            เตรียม
                          </button>
                        )}
                        {row.patient_in_time && !row.incision_time && (
                          <button
                            onClick={() =>
                              handleUpdateTimeLog(row.id, "incision_time")
                            }
                            className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold hover:bg-amber-100"
                          >
                            ผ่าตัด
                          </button>
                        )}
                        {row.incision_time && !row.operation_complete_time && (
                          <button
                            onClick={() =>
                              handleUpdateTimeLog(
                                row.id,
                                "operation_complete_time",
                              )
                            }
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100"
                          >
                            เสร็จ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-slate-400 font-bold"
                  >
                    วันนี้ยังไม่มีคิวผ่าตัด
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-600 bg-orange-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg shadow-blue-100/30 backdrop-blur">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[14px] font-bold text-slate-800 uppercase tracking-widest">
        {label}
      </p>
      <span className="text-2xl font-black mt-1 block text-slate-900">
        {value}
      </span>
    </div>
  );
}
