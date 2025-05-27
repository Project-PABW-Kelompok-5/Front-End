import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from "lucide-react";
import AdminSidebar from '../../components/AdminSidebar.jsx';
import axios from 'axios'; // Import axios

const API_URL = 'http://localhost:3000/api/kurir';

const ManageCourier = () => {
  const [couriers, setCouriers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCourier, setNewCourier] = useState({ nama: '', email: '', no_telepon: '', password: '' });
  // State baru untuk fitur edit
  const [editingCourierId, setEditingCourierId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // GET kurir saat halaman load
  useEffect(() => {
    fetchCouriers();
  }, []);

  // Fungsi untuk mengambil data kurir dari API
  const fetchCouriers = async () => {
    try {
      const response = await axios.get(API_URL); // Menggunakan axios.get
      setCouriers(response.data); // Data langsung ada di response.data
    } catch (err) {
      console.error("Gagal fetch data kurir", err);
      // Opsional: tampilkan pesan error ke user
      alert("Gagal mengambil data kurir. Silakan coba lagi.");
    }
  };

  // Handler untuk perubahan input form
  const handleChange = (e) => {
    setNewCourier({ ...newCourier, [e.target.name]: e.target.value });
  };

  // Fungsi untuk membuka modal (untuk tambah atau edit)
  const openModal = (courier = null) => {
    if (courier) {
      // Jika ada objek kurir yang dilewatkan, ini adalah mode edit
      setNewCourier({
        nama: courier.nama,
        email: courier.email,
        no_telepon: courier.no_telepon,
        // Password tidak diisi ulang untuk keamanan, user harus memasukkan ulang jika ingin mengubah
        password: '', 
      });
      setEditingCourierId(courier.id);
      setIsEditing(true);
    } else {
      // Jika tidak ada objek kurir, ini adalah mode tambah baru
      setNewCourier({ nama: '', email: '', no_telepon: '', password: '' });
      setEditingCourierId(null);
      setIsEditing(false);
    }
    setShowModal(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setShowModal(false);
    // Reset semua state terkait modal setelah ditutup
    setNewCourier({ nama: '', email: '', no_telepon: '', password: '' });
    setEditingCourierId(null);
    setIsEditing(false);
  };

  // Fungsi untuk menangani penambahan atau pembaruan kurir
  const handleSubmitCourier = async (e) => {
    e.preventDefault(); // Mencegah form submit default

    try {
      if (isEditing) {
        // Mode edit: Kirim permintaan PUT
        const response = await axios.put(`${API_URL}/${editingCourierId}`, newCourier);
        if (response.status === 200) {
          alert("Kurir berhasil diperbarui!");
          closeModal();
          fetchCouriers(); // Refresh daftar kurir
        } else {
          throw new Error("Gagal memperbarui kurir");
        }
      } else {
        // Mode tambah: Kirim permintaan POST
        const response = await axios.post(API_URL, newCourier);
        if (response.status === 201) {
          alert("Kurir berhasil ditambahkan!");
          closeModal();
          fetchCouriers(); // Refresh daftar kurir
        } else {
          throw new Error("Gagal menambahkan kurir");
        }
      }
    } catch (err) {
      console.error("Error saat menyimpan kurir:", err.response ? err.response.data : err.message);
      alert(`Gagal menyimpan kurir: ${err.response?.data?.message || err.message}`);
    }
  };

  // Fungsi untuk menghapus kurir
  const handleDeleteCourier = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus kurir ini?")) {
      return; // Batalkan jika user tidak yakin
    }
    try {
      const response = await axios.delete(`${API_URL}/${id}`); // Menggunakan axios.delete
      if (response.status === 200) {
        alert("Kurir berhasil dihapus!");
        fetchCouriers(); // Refresh daftar kurir
      } else {
        throw new Error("Gagal menghapus kurir");
      }
    } catch (err) {
      console.error("Error saat menghapus kurir:", err.response ? err.response.data : err.message);
      alert(`Gagal menghapus kurir: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar activePage="Manage Courier" />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Manage Courier</h1>
          <button
            onClick={() => openModal()} // Panggil openModal tanpa argumen untuk mode tambah
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
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
              {couriers.length > 0 ? (
                couriers.map(kurir => (
                  <tr key={kurir.id} className="border-t">
                    <td className="px-6 py-3">{kurir.nama}</td>
                    <td className="px-6 py-3">{kurir.email}</td>
                    <td className="px-6 py-3">{kurir.no_telepon}</td>
                    <td className="px-6 py-3 space-x-2">
                      <button
                        onClick={() => openModal(kurir)} // Panggil openModal dengan data kurir untuk mode edit
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourier(kurir.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Tidak ada data kurir.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah/Edit Kurir */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? "Edit Kurir" : "Tambah Kurir"}
              </h2>
              <form onSubmit={handleSubmitCourier}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="nama" // Tambahkan atribut name
                    placeholder="Nama"
                    value={newCourier.nama}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <input
                    type="email"
                    name="email" // Tambahkan atribut name
                    placeholder="Email"
                    value={newCourier.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="no_telepon" // Tambahkan atribut name
                    placeholder="No Telepon"
                    value={newCourier.no_telepon}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {/* Input password hanya ditampilkan saat menambah kurir baru */}
                  {!isEditing && (
                    <input
                      type="password"
                      name="password" // Tambahkan atribut name
                      placeholder="Password"
                      value={newCourier.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  )}
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button" // Penting: agar tidak submit form
                      onClick={closeModal}
                      className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition duration-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
                    >
                      {isEditing ? "Simpan Perubahan" : "Tambah Kurir"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourier;
