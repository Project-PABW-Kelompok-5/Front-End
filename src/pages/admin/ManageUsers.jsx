// src/pages/admin/ManageUsers.jsx
import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar.jsx";
// Import auth Firebase
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { app } from "../../firebase"; // pastikan ini mengarah ke file konfigurasi firebase kamu

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    no_telepon: "",
    role: "User",
  });

  const token = localStorage.getItem("token");

  const getAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      // Cek apakah data.users adalah array
      if (Array.isArray(data.users)) {
        setUsers(data.users); // ambil array dari objek
      } else {
        console.error("Format data tidak sesuai:", data);
      }
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
    }
  };
  

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleAddUser = async () => {
    if (loading) return;
    setLoading(true);
  
    const auth = getAuth(app); // pastikan sudah import dan inisialisasi firebase app
  
    try {
      // 1. Buat akun user di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      const firebaseUser = userCredential.user;
  
      // 2. Kirim email verifikasi
      await sendEmailVerification(firebaseUser);
  
      // 3. Simpan data user ke backend
      const res = await fetch("http://localhost:3000/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          username: newUser.username, // ✅ gunakan username
          email: newUser.email,
          no_telepon: newUser.no_telepon,
          role: newUser.role,
        }),
      });
  
      const result = await res.json();
      if (!res.ok) {
        console.error("Error Response:", result);
        throw new Error(result.message || result.error || "Gagal menambah pengguna");
      }
  
      // Refresh daftar user
      getAllUsers();
  
      // Reset form
      setNewUser({
        username: "",
        email: "",
        password: "",
        no_telepon: "",
        role: "User",
      });
      setShowModal(false);
      alert("User berhasil dibuat. Silakan verifikasi email terlebih dahulu.");
    } catch (error) {
      console.error("Catch Error:", error.message || error);
      alert(error.message || "Terjadi kesalahan saat menambah pengguna.");
    }
  
    setLoading(false);
  };
  
  

  const handleEditClick = (user) => {
    setIsEditMode(true);
    setEditUserId(user.id);
    setNewUser({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "", // kosongkan untuk edit, hanya isi jika diubah
      no_telepon: user.no_telepon,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      const updatedUser = { ...newUser };
      if (!updatedUser.password) {
        delete updatedUser.password; // jangan kirim password jika kosong
      }

      const res = await fetch(
        `http://localhost:3000/api/admin/users/${editUserId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }
      );

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || "Gagal memperbarui pengguna");

      getAllUsers();
      setShowModal(false);
      setIsEditMode(false);
      setEditUserId(null);
      setNewUser({
        name: "",
        email: "",
        username: "",
        password: "",
        no_telepon: "",
        role: "User",
      });
    } catch (error) {
      console.error("Gagal update user:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Gagal menghapus pengguna");
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="flex">
      <AdminSidebar activePage="Manage Users" />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Tambah Pengguna
          </button>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">username</th>
                <th className="px-6 py-3">no_telepon</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-6 py-3">{user.name}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">{user.username}</td>
                  <td className="px-6 py-3">{user.no_telepon}</td>
                  <td className="px-6 py-3">{user.role}</td>
                  <td className="px-6 py-3 space-x-2">
                    <button
                      className="text-blue-600"
                      onClick={() => handleEditClick(user)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah/Edit Pengguna */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                {isEditMode ? "Edit Pengguna" : "Tambah Pengguna"}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    isEditMode
                      ? null
                      : setNewUser({ ...newUser, email: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg ${
                    isEditMode ? "bg-gray-200 cursor-not-allowed" : ""
                  }`}
                  disabled={isEditMode}
                />

                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="password"
                  placeholder={
                    isEditMode
                      ? "Kosongkan jika tidak ingin mengubah password"
                      : "Password"
                  }
                  value={newUser.password || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <input
                  type="tel"
                  placeholder="No Telepon"
                  value={newUser.no_telepon}
                  onChange={(e) =>
                    setNewUser({ ...newUser, no_telepon: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setIsEditMode(false);
                      setEditUserId(null);
                      setNewUser({
                        name: "",
                        email: "",
                        username: "",
                        password: "",
                        no_telepon: "",
                        role: "User",
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  >
                    Batal
                  </button>

                  <button
                    onClick={isEditMode ? handleUpdateUser : handleAddUser}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isEditMode ? "Update Pengguna" : "Tambah Pengguna"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
