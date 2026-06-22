"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function AddBedPage() {
  const router = useRouter();
  // const API_BASE = "/api";
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    bed_number: "",
    ward_name: "",
    status: "Vacant",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    try {
      // const resp = await fetch(`${API_BASE}/beds`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(formData),
      // });
      const resp = await fetch(`${API_BASE}/api/beds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (resp.ok) {
        alert("เพิ่มเตียงสำเร็จ");
        router.push("/beds");
      } else {
        const json = await resp.json();
        alert(json.message || "เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <section className="overflow-hidden rounded-[2rem] bg-blue-600 px-6 py-7 text-white shadow-2xl shadow-blue-200/60 md:px-8 md:py-9">
          <p className="text-sm font-semibold text-blue-100">
            The Art OR System
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            เพิ่มเตียงใหม่
          </h1>
        </section>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-blue-100/30 backdrop-blur"
        >
          <div>
            <label className="block text-sm font-medium mb-1">เลขเตียง</label>
            <input
              type="text"
              placeholder="เช่น Bed 01"
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              onChange={(e) =>
                setFormData({ ...formData, bed_number: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              ชื่อหอผู้ป่วย
            </label>
            <input
              type="text"
              placeholder="เช่น Main Ward"
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              onChange={(e) =>
                setFormData({ ...formData, ward_name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">สถานะ</label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="Vacant">Vacant</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/beds")}
              className="w-full rounded-2xl bg-rose-200 py-3 font-bold text-rose-600 shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-rose-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </main>
    </ProtectedRoute>
  );
}
