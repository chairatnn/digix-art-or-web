"use client";

import { useEffect, useState } from "react";
import {
  CalendarPlus,
  Users,
  DoorOpen,
  FileText,
  Clock,
  Trash2,
  Edit3,
  XCircle,
  AlertCircle,
  BedDouble,
} from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function OrBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [bedsList, setBedsList] = useState([]); // 👈 เพิ่ม State สำหรับเตียง
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    hn: "",
    doctor_id: "",
    room_id: "",
    bed_id: "",
    booking_date: new Date().toLocaleDateString("sv-SE"),
    estimated_start_time: "09:00",
    estimated_end_time: "11:00",
    procedure_name: "",
    status: "Scheduled",
  });

  // ฟังก์ชันตรวจสอบว่าห้องว่างหรือไม่ในช่วงเวลานั้น
  const isRoomOccupied = (roomId, date, start, end) => {
    return bookings.some((b) => {
      if (editingId && b.id === editingId) return false;
      if (parseInt(b.room_id) !== parseInt(roomId) || b.booking_date !== date)
        return false;

      const bStart = b.estimated_start_time.substring(0, 5);
      const bEnd = b.estimated_end_time.substring(0, 5);

      return start < bEnd && end > bStart;
    });
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        "http://localhost:3000/api/or-system/daily-schedule",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const result = await res.json();
      if (result && result.data) setBookings(result.data);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลคิวผ่าตัดได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        booking_date: formData.booking_date,
        estimated_start_time: formData.estimated_start_time,
        estimated_end_time: formData.estimated_end_time,
      });

      if (editingId) {
        params.set("exclude_booking_id", editingId);
      }

      const res = await fetch(
        `http://localhost:3000/api/or-system/rooms-list?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const result = await res.json();
      if (result.success) setRoomsList(result.data);
    } catch (err) {
      console.error("Room dropdown error:", err);
    }
  };

  const fetchAvailableBeds = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        booking_date: formData.booking_date,
        estimated_start_time: formData.estimated_start_time,
        estimated_end_time: formData.estimated_end_time,
      });

      if (editingId) {
        params.set("exclude_booking_id", editingId);
      }

      const res = await fetch(
        `http://localhost:3000/api/or-system/beds-list?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const result = await res.json();
      if (result.success) setBedsList(result.data);
    } catch (err) {
      console.error("Bed dropdown error:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [docRes] = await Promise.all([
          fetch("http://localhost:3000/api/or-system/doctors-list", {
            headers,
          }),
        ]);

        const docResult = await docRes.json();

        if (docResult.success) setDoctorsList(docResult.data);
      } catch (err) {
        console.error("Dropdown Error:", err);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchAvailableRooms();
  }, [
    formData.booking_date,
    formData.estimated_start_time,
    formData.estimated_end_time,
    editingId,
  ]);

  useEffect(() => {
    fetchAvailableBeds();
  }, [
    formData.booking_date,
    formData.estimated_start_time,
    formData.estimated_end_time,
    editingId,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getRoomLabel = (room) => {
    const reason = room.availability_reason
      ? ` - ${room.availability_reason}`
      : "";
    return `${room.room_name}${reason}`;
  };

  const getBedLabel = (bed) => {
    const reason = bed.availability_reason
      ? ` - ${bed.availability_reason}`
      : "";
    return `${bed.ward_name} - ${bed.bed_number}${reason}`;
  };

  const handleEditClick = (row) => {
    setEditingId(row.id);
    setFormData({
      hn: row.hn,
      doctor_id: row.doctor_id || "",
      room_id: row.room_id || "",
      bed_id: row.bed_id || "",
      booking_date: new Date(row.booking_date).toLocaleDateString("sv-SE"),
      estimated_start_time: row.estimated_start_time.substring(0, 5),
      estimated_end_time: row.estimated_end_time.substring(0, 5),
      procedure_name: row.procedure_name,
      status: row.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      hn: "",
      doctor_id: "",
      room_id: "",
      booking_date: new Date().toLocaleDateString("sv-SE"),
      estimated_start_time: "09:00",
      estimated_end_time: "11:00",
      procedure_name: "",
      recovery_bed: "",
      status: "Scheduled",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบซ้ำก่อนส่ง
    if (
      isRoomOccupied(
        formData.room_id,
        formData.booking_date,
        formData.estimated_start_time,
        formData.estimated_end_time,
      )
    ) {
      setError("❌ ห้องนี้ถูกจองในช่วงเวลานี้แล้ว กรุณาเปลี่ยนห้องหรือเวลา");
      return;
    }

    setSubmitLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const url = editingId
        ? `http://localhost:3000/api/or-system/bookings/${editingId}`
        : "http://localhost:3000/api/or-system/bookings";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "การประมวลผลล้มเหลว");
      alert(editingId ? "✏️ แก้ไขข้อมูลสำเร็จ!" : "🎉 บันทึกการจองคิวสำเร็จ!");
      handleCancelEdit();
      fetchBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("🚨 ยืนยันการลบรายการนี้?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`http://localhost:3000/api/or-system/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute>
      <main className="p-6 md:p-8 bg-slate-50 min-h-screen space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            จัดการคิวผ่าตัด
          </h1>
          <p className="text-slate-500 font-medium">
            ลงทะเบียนนัดหมายหรือแก้ไขข้อมูล
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 text-rose-700 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] border p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6">
            {editingId ? "🛠️ กำลังแก้ไขข้อมูล" : "กรอกข้อมูลจองคิวห้องผ่าตัด"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                รหัสคนไข้ (HN)
              </label>
              <input
                type="text"
                name="hn"
                value={formData.hn}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                หัตถการ / โรคผ่าตัด
              </label>
              <input
                type="text"
                name="procedure_name"
                value={formData.procedure_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                วันที่ทำหัตถการ
              </label>
              <input
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                แพทย์ผู้ทำผ่าตัด
              </label>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
              >
                <option value="">-- เลือกแพทย์ --</option>
                {doctorsList.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.doctor_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                ระบุห้องผ่าตัด
              </label>
              <select
                name="room_id"
                value={formData.room_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
              >
                <option value="">-- เลือกห้อง --</option>
                {roomsList.map((room) => (
                  <option
                    key={room.id}
                    value={room.id}
                    disabled={
                      !room.is_available &&
                      String(formData.room_id) !== String(room.id)
                    }
                  >
                    {getRoomLabel(room)}
                  </option>
                ))}
              </select>
              {/* <p className="mt-2 text-xs text-slate-400">
                ห้องที่ไม่ว่างจะถูกปิดให้เลือกและแสดงเหตุผลในรายการ
              </p> */}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                ระบุเตียงพักฟื้น
              </label>
              <select
                name="bed_id"
                value={formData.bed_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
              >
                <option value="">-- เลือกเตียงพักฟื้น --</option>
                {bedsList.map((bed) => (
                  <option
                    key={bed.id}
                    value={bed.id}
                    disabled={
                      !bed.is_available &&
                      String(formData.bed_id) !== String(bed.id)
                    }
                  >
                    {getBedLabel(bed)}
                  </option>
                ))}
              </select>
              {/* <p className="mt-2 text-xs text-slate-400">
                เตียงที่ไม่ว่างจะถูกปิดให้เลือกและแสดงเหตุผลในรายการ
              </p> */}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  เวลาเริ่ม
                </label>
                <input
                  type="time"
                  name="estimated_start_time"
                  value={formData.estimated_start_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  เวลาสิ้นสุด
                </label>
                <input
                  type="time"
                  name="estimated_end_time"
                  value={formData.estimated_end_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 bg-rose-400 text-white rounded-xl text-sm font-bold"
                >
                  ยกเลิก
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-400 text-blue-800 rounded-xl text-sm !font-bold"
              >
                {editingId ? "บันทึกการอัปเดต" : "ลงทะเบียนจองคิว"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-[2.5rem] border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-8 py-4 text-[16px] font-bold text-slate-200 uppercase">
                  วันที่-เวลา
                </th>
                <th className="px-8 py-4 text-[16px] font-bold text-slate-200 uppercase">
                  ข้อมูลคนไข้
                </th>
                <th className="px-8 py-4 text-[16px] font-bold text-slate-200 uppercase">
                  ข้อมูลแพทย์
                </th>
                <th className="px-8 py-4 text-[16px] font-bold text-slate-200 uppercase">
                  ห้อง/เตียง
                </th>
                <th className="px-8 py-4 text-[16px] font-bold text-slate-200 uppercase text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-4 text-sm text-blue-600 font-bold">
                    <p>
                      {new Date(row.booking_date).toLocaleDateString("th-TH")}
                    </p>
                    <p className="text-xs">
                      {row.estimated_start_time.substring(0, 5)} -{" "}{row.estimated_end_time.substring(0, 5)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <p>{row.patient_name}</p>
                    <p className="text-xs">{row.hn}</p>
                  </td>
                  <td className="px-8 py-4 text-sm">
                    <p>{row.doctor_name}</p>
                    <p>{row.specialty}</p>
                  </td>
                  <td className="px-8 py-4 text-sm">
                    <span className="block font-bold">{row.room_name}</span>
                    <span className="text-xs text-slate-600">
                      {row.bed_id
                        ? `${row.ward_name || ""} ${row.bed_number || ""}`
                        : "-"}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <button
                      onClick={() => handleEditClick(row)}
                      className="text-blue-600 font-bold text-sm mr-3"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-rose-600 font-bold text-sm"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </ProtectedRoute>
  );
}
