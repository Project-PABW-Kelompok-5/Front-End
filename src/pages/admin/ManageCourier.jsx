import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from "lucide-react";
import AdminSidebar from '../../components/AdminSidebar.jsx';

const API_URL = 'http://localhost:3000/api/kurir'; 

const ManageCourier = () => {
  const [couriers, setCouriers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCourier, setNewCourier] = useState({ nama: '', email: '', no_telepon: '', password: '' });

  // GET kurir saat halaman load
  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setCouriers(data);
    } catch (err) {
      console.error("Gagal fetch data kurir", err);
    }
  };

  const handleAddCourier = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourier),
      });

      const data = await response.json();
      if (response.ok) {
        fetchCouriers(); 
        setNewCourier({ nama: '', email: '', no_telepon: '' });
        setShowModal(false);
      } else {
        console.error("Gagal menambahkan kurir", data);
      }
    } catch (err) {
      console.error("Error saat menambahkan kurir", err);
    }
  };

  const handleDeleteCourier = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchCouriers(); // refresh
      }
    } catch (err) {
      console.error("Error saat menghapus kurir", err);
    }
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
                <th className="px-6 py-3">No Telepon</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {couriers.map(kurir => (
                <tr key={kurir.id} className="border-t">
                  <td className="px-6 py-3">{kurir.nama}</td>
                  <td className="px-6 py-3">{kurir.email}</td>
                  <td className="px-6 py-3">{kurir.no_telepon}</td>
                  <td className="px-6 py-3 space-x-2">
                    <button className="text-blue-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDeleteCourier(kurir.id)} className="text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah Kurir */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Tambah Kurir</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nama"
                  value={newCourier.nama}
                  onChange={(e) => setNewCourier({ ...newCourier, nama: e.target.value })}
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
                  type="text"
                  placeholder="No Telepon"
                  value={newCourier.no_telepon}
                  onChange={(e) => setNewCourier({ ...newCourier, no_telepon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Password"
                  value={newCourier.password}
                  onChange={(e) => setNewCourier({ ...newCourier, password: e.target.value })}
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
