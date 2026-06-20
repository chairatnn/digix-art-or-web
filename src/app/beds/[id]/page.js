"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function EditBedPage() {
  const { id } = useParams();
  const router = useRouter();
  const API_BASE = "/api";
  
  const [formData, setFormData] = useState({ bed_number: "", ward_name: "", status: "Vacant" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBed = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const resp = await fetch(`${API_BASE}/beds/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const json = await resp.json();
        if (json.success) {
          setFormData({
            ...json.data,
            status: json.data.status === "Reserved" ? "Occupied" : json.data.status,
          });
        } else {
          alert("ไม่พบข้อมูลเตียง");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBed();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    try {
      const resp = await fetch(`${API_BASE}/beds/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (resp.ok) {
        alert("อัปเดตข้อมูลสำเร็จ");
        router.push("/beds");
      } else {
        alert("การบันทึกไม่สำเร็จ");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <section className="overflow-hidden rounded-[30px] bg-blue-600 px-6 py-7 text-white shadow-2xl shadow-blue-200/60 md:px-8 md:py-9">
          <p className="text-sm font-semibold text-blue-100">The Art OR System</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">แก้ไขข้อมูลเตียง</h1>
        </section>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-blue-100/30 backdrop-blur">
          <div>
            <label className="block text-sm font-medium mb-1">เลขเตียง</label>
            <input 
              type="text" 
              value={formData.bed_number} 
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
              onChange={(e) => setFormData({...formData, bed_number: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อหอผู้ป่วย</label>
            <input 
              type="text" 
              value={formData.ward_name} 
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
              onChange={(e) => setFormData({...formData, ward_name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">สถานะ</label>
            <select 
              value={formData.status} 
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" 
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Vacant">Vacant</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">
            บันทึกการแก้ไข
          </button>
        </form>
      </main>
    </ProtectedRoute>
  );
}