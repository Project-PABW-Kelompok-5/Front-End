// src/pages/admin/ManageUsers.jsx
import { useState } from 'react';
import { Pencil, Trash2 } from "lucide-react";
import AdminSidebar from '../../components/AdminSidebar.jsx';

const dummyUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com',username: "Jhon1", no_telepon : "082108210821", role: 'User' },
  { id: 2, name: 'Kuwon Thol', email: 'Kuwon@example.com',username: "Kuwon1", no_telepon : "085808580858", role: 'User' },
];

const ManageUsers = () => {
  const [users, setUsers] = useState(dummyUsers);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', username: '' , no_telepon:'', role: 'User' });

  const handleAddUser = () => {
    const id = Date.now();
    setUsers([...users, { ...newUser, id }]);
    setNewUser({ name: '', email: '',username:'', no_telepon: '', role: 'User' });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
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
              {users.map(user => (
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
                    <button onClick={() => handleDelete(user.id)} className="text-red-600">
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
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="username"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="no_telepon"
                  placeholder="No Telepon"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, no_telepon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
