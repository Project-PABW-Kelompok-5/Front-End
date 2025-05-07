// src/pages/admin/Dashboard.jsx
import { useState } from 'react';
import { Pencil, Trash2 } from "lucide-react";
import AdminSidebar from '../../components/AdminSidebar.jsx';


const Courier = [
  { id: 1, name: 'Moe Lester', email: 'moe@example.com', no_telepon : "082108210821" },
  { id: 2, name: 'Joe Mama', email: 'Joe@example.com',no_telepon : "085808580858" },
];

const ManageCourier = () => {
  const [courier, setCourier] = useState(Courier);
  const [showModal, setShowModal] = useState(false);
  const [newCourier, setNewCourier] = useState({ name: '', email: '',no_telepon:'' });

  const handleAddCourier = () => {
    const id = Date.now();
    setCourier([...courier, { ...newCourier, id }]);
    setNewCourier({ name: '', email: '',no_telepon: ''});
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setCourier(courier.filter(courier => courier.id !== id));
  };

  return (
    <div className="flex">
      <AdminSidebar activePage="Manage Courier" />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Manage Courier</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
           + Tambah Kurir
          </button>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">no_telepon</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {courier.map(courier => (
                <tr key={courier.id} className="border-t">
                  <td className="px-6 py-3">{courier.name}</td>
                  <td className="px-6 py-3">{courier.email}</td>
                  <td className="px-6 py-3">{courier.no_telepon}</td>
                  <td className="px-6 py-3 space-x-2">
                    <button className="text-blue-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(courier.id)} className="text-red-600">
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
                  value={newCourier.name}
                  onChange={(e) => setNewCourier({ ...newCourier, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newCourier.email}
                  onChange={(e) => setNewCourier({ ...newCourier, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="no_telepon"
                  placeholder="No Telepon"
                  value={newCourier.email}
                  onChange={(e) => setNewCourier({ ...newCourier, no_telepon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddCourier}
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

export default ManageCourier;

