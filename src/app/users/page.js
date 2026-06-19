"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Eye, Edit2, Trash2 } from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const API_BASE = "/api";
  const [me, setMe] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("memberRole");
    if (role) setMe({ role: role });
    fetchUsers();
  }, []);

  const isAdmin = me?.role === "Admin";

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      setUsers(json.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentUser, setCurrentUser] = useState({
    name: "",
    email: "",
    role: "Patient",
    password: "",
    hn: "",
    license_no: "",
    specialty: "",
    phone: "",
  });

  const openAddModal = () => {
    setModalMode("add");
    setCurrentUser({
      name: "",
      email: "",
      role: "Patient",
      password: "",
      hn: "",
      license_no: "",
      specialty: "",
      phone: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user, mode) => {
    setModalMode(mode);
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const filteredUsers = useMemo(() => {
    // กำหนด Role ที่เราต้องการให้แสดง
    const allowedRoles = ["Admin", "Doctor", "Patient"];

    return users.filter((u) => {
      // 1. เช็คว่าอยู่ในกลุ่มที่เราอนุญาตไหม
      const isAllowedRole = allowedRoles.includes(u.role);

      // 2. เช็คคำค้นหา (ชื่อ หรือ อีเมล)
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      return isAllowedRole && matchesSearch;
    });
  }, [users, searchTerm]);

  const handleDelete = async (id, name) => {
    if (!isAdmin) return alert("เฉพาะ Admin เท่านั้นที่มีสิทธิ์ลบ");
    if (!confirm(`ยืนยันการลบผู้ใช้: ${name}?`)) return;
    try {
      const token = localStorage.getItem("accessToken");
      const resp = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        alert("ลบผู้ใช้งานเรียบร้อยแล้ว");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const handleSave = async () => {
    if (!isAdmin) return alert("เฉพาะ Admin เท่านั้นที่มีสิทธิ์จัดการข้อมูล");
    try {
      const token = localStorage.getItem("accessToken");
      const isAdd = modalMode === "add";
      const url = isAdd
        ? `${API_BASE}/users`
        : `${API_BASE}/users/${currentUser.id}`;

      const payload = {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        hn: currentUser.hn,
        license_no: currentUser.license_no,
        specialty: currentUser.specialty,
        phone: currentUser.phone,
      };
      if (isAdd) payload.password = currentUser.password;

      const resp = await fetch(url, {
        method: isAdd ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        alert(isAdd ? "เพิ่มผู้ใช้สำเร็จ" : "อัปเดตข้อมูลสำเร็จ");
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const err = await resp.json();
        alert(err.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">จัดการผู้ใช้งาน</h1>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="bg-amber-400 text-blue-800 px-6 py-3 rounded-2xl !font-bold flex items-center gap-2"
            >
              <Plus size={18} /> เพิ่มผู้ใช้
            </button>
          )}
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border p-4 mb-6">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            className="w-full p-3 bg-slate-50 border rounded-xl outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-8 py-5 text-[16px] font-bold text-slate-200">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-8 py-5 text-[16px] font-bold text-slate-200">
                  E-mail
                </th>
                <th className="px-8 py-5 text-[16px] font-bold text-slate-200">
                  บทบาท
                </th>
                <th className="px-8 py-5 text-[16px] font-bold text-slate-200 text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="px-8 py-6 font-bold">{u.name}</td>
                  <td className="px-8 py-6 font-bold">{u.email}</td>
                  <td className="px-8 py-6">{u.role}</td>
                  <td className="px-8 py-6 text-right flex justify-end gap-3">
                    <button onClick={() => openEditModal(u, "view")} className="text-blue-600">
                      <Eye size={18} />
                    </button>
                    {isAdmin && (
                      <>
                        <button onClick={() => openEditModal(u, "edit")}>
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="text-rose-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === "add" ? "เพิ่มผู้ใช้" : "แก้ไขข้อมูล"}
            </h2>
            <div className="space-y-3">
              <input
                placeholder="ชื่อ"
                className="w-full p-3 bg-slate-50 border rounded-xl"
                value={currentUser.name}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, name: e.target.value })
                }
                disabled={modalMode === "view"}
              />
              <input
                placeholder="อีเมล"
                className="w-full p-3 bg-slate-50 border rounded-xl"
                value={currentUser.email}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, email: e.target.value })
                }
                disabled={modalMode === "view"}
              />
              {modalMode === "add" && (
                <input
                  type="password"
                  placeholder="รหัสผ่าน"
                  className="w-full p-3 bg-slate-50 border rounded-xl"
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, password: e.target.value })
                  }
                />
              )}
              <select
                className="w-full p-3 bg-slate-50 border rounded-xl"
                value={currentUser.role}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, role: e.target.value })
                }
                disabled={modalMode === "view"}
              >
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Patient">Patient</option>
              </select>

              {currentUser.role === "Patient" && (
                <input
                  placeholder="รหัสคนไข้ (HN)"
                  className="w-full p-3 bg-slate-50 border rounded-xl"
                  value={currentUser.hn || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, hn: e.target.value })
                  }
                  disabled={modalMode === "view"}
                />
              )}
              {currentUser.role === "Doctor" && (
                <>
                  <input
                    placeholder="เลขใบประกอบวิชาชีพ"
                    className="w-full p-3 bg-slate-50 border rounded-xl"
                    value={currentUser.license_no || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        license_no: e.target.value,
                      })
                    }
                    disabled={modalMode === "view"}
                  />
                  <input
                    placeholder="ความเชี่ยวชาญ"
                    className="w-full p-3 bg-slate-50 border rounded-xl"
                    value={currentUser.specialty || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        specialty: e.target.value,
                      })
                    }
                    disabled={modalMode === "view"}
                  />
                </>
              )}
              <input
                placeholder="เบอร์โทรศัพท์"
                className="w-full p-3 bg-slate-50 border rounded-xl"
                value={currentUser.phone || ""}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, phone: e.target.value })
                }
                disabled={modalMode === "view"}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 border rounded-xl"
              >
                ยกเลิก
              </button>
              {modalMode !== "view" && (
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl"
                >
                  บันทึก
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
