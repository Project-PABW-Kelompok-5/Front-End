// src/pages/admin/ManageUsers.jsx
import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar.jsx";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    no_telepon: "",
    role: "User",
  });

  const token = localStorage.getItem("token");

  // Ambil data user dari backend
  useEffect(() => {
    fetch("http://localhost:3000/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Gagal fetch user:", err));
  }, []);

  const getAllUsers = () => {
    fetch("http://localhost:3000/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Gagal fetch user:", err));
  };
  

  const handleAddUser = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        console.error("Error Response:", result);
        throw new Error(result.message || "Gagal menambah pengguna");
      }
  
      getAllUsers(); 
      setNewUser({
        name: "",
        email: "",
        username: "",
        password: "",
        no_telepon: "",
        role: "User",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Catch Error:", error);
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
                    <button className="text-blue-600">
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

        {/* Modal Tambah Pengguna */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Tambah Pengguna</h2>
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
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="username"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="no_telepon"
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
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Simpan
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
