import { useEffect, useState } from 'react';
import { Pencil, Trash2, PlusCircle, UserCog, X } from "lucide-react";
import AdminSidebar from '../../components/AdminSidebar.jsx';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/kurir';

const ManageCourier = () => {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
  const [newCourier, setNewCourier] = useState({ nama: '', email: '', no_telepon: '', password: '' });
  const [editingCourierId, setEditingCourierId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courierToDeleteId, setCourierToDeleteId] = useState(null);

  const showCustomDialog = (message) => {
    setDialogMessage(message);
    setShowAlertDialog(true);
  };

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setCouriers(response.data);
    } catch (err) {
      console.error("Gagal fetch data kurir", err);
      showCustomDialog(`Gagal mengambil data kurir: ${err.response?.data?.message || err.message}`);
      setCouriers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewCourier({ ...newCourier, [e.target.name]: e.target.value });
  };

  const openModal = (courier = null) => {
    if (courier) {
      setNewCourier({
        nama: courier.nama,
        email: courier.email,
        no_telepon: courier.no_telepon,
        password: '',
      });
      setEditingCourierId(courier.id);
      setIsEditing(true);
    } else {
      setNewCourier({ nama: '', email: '', no_telepon: '', password: '' });
      setEditingCourierId(null);
      setIsEditing(false);
    }
    setShowModal(true);
    setTimeout(() => setShowModalContent(true), 50);
  };

  const closeModal = () => {
    setShowModalContent(false);
    setTimeout(() => {
      setShowModal(false);
      setNewCourier({ nama: '', email: '', no_telepon: '', password: '' });
      setEditingCourierId(null);
      setIsEditing(false);
      setIsSubmitting(false);
    }, 300);
  };

  const handleSubmitCourier = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const payload = { ...newCourier };
        if (!payload.password) {
            delete payload.password;
        }

        const response = await axios.put(`${API_URL}/${editingCourierId}`, payload);
        if (response.status === 200) {
          showCustomDialog("Kurir berhasil diperbarui!");
          closeModal();
          fetchCouriers();
        } else {
          throw new Error("Gagal memperbarui kurir");
        }
      } else {
        const response = await axios.post(API_URL, newCourier);
        if (response.status === 201) {
          showCustomDialog("Kurir berhasil ditambahkan!");
          closeModal();
          fetchCouriers();
        } else {
          throw new Error("Gagal menambahkan kurir");
        }
      }
    } catch (err) {
      console.error("Error saat menyimpan kurir:", err.response ? err.response.data : err.message);
      showCustomDialog(`Gagal menyimpan kurir: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourier = (id) => {
    setCourierToDeleteId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!courierToDeleteId) return;

    try {
      const response = await axios.delete(`${API_URL}/${courierToDeleteId}`);
      if (response.status === 200) {
        showCustomDialog("Kurir berhasil dihapus!");
        fetchCouriers();
      } else {
        throw new Error("Gagal menghapus kurir");
      }
    } catch (err) {
      console.error("Error saat menghapus kurir:", err.response ? err.response.data : err.message);
      showCustomDialog(`Gagal menghapus kurir: ${err.response?.data?.message || err.message}`);
    } finally {
      setCourierToDeleteId(null);
    }
  };

  return (
    <div className="flex font-sans">
      <AdminSidebar activePage="Manage Courier" />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Manajemen Kurir</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            + Tambah Kurir
          </button>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#753799] border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-white font-medium">Nama</th>
                <th className="px-6 py-3 text-white font-medium">Email</th>
                <th className="px-6 py-3 text-white font-medium">No Telepon</th>
                <th className="px-6 py-3 text-white font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Memuat data kurir...
                  </td>
                </tr>
              ) : couriers.length > 0 ? (
                couriers.map(kurir => (
                  <tr key={kurir.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">{kurir.nama}</td>
                    <td className="px-6 py-3 text-gray-800">{kurir.email}</td>
                    <td className="px-6 py-3 text-gray-800">{kurir.no_telepon}</td>
                    <td className="px-6 py-3 space-x-2">
                      <button
                        onClick={() => openModal(kurir)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                        title="Edit Kurir"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourier(kurir.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                        title="Hapus Kurir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Tidak ada data kurir ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative
                          transform transition-all duration-300 ease-out
                          ${showModalContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Tutup modal"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                {isEditing ? (
                  <UserCog size={24} className="text-blue-600" />
                ) : (
                  <PlusCircle size={24} className="text-green-600" />
                )}
                {isEditing ? "Edit Kurir" : "Tambah Kurir Baru"}
              </h2>
              <form onSubmit={handleSubmitCourier}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="nama"
                    placeholder="Nama Lengkap"
                    value={newCourier.nama}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newCourier.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                    required
                  />
                  <input
                    type="text"
                    name="no_telepon"
                    placeholder="Nomor Telepon (misal: 081234567890)"
                    value={newCourier.no_telepon}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                    required
                  />
                  {!isEditing ? (
                    <input
                      type="password"
                      name="password"
                      placeholder="Password (minimal 6 karakter)"
                      value={newCourier.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                      required
                    />
                  ) : (
                    <input
                      type="password"
                      name="password"
                      placeholder="Ubah Password (kosongkan jika tidak ingin diubah)"
                      value={newCourier.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                    />
                  )}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (isEditing ? "Menyimpan..." : "Menambahkan...") : (isEditing ? "Simpan Perubahan" : "Tambah Kurir")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Trash2 size={20} className="text-red-600" /> Konfirmasi Penghapusan
              </h3>
              <p className="mb-6 text-gray-700">Apakah Anda yakin ingin menghapus kurir ini? Aksi ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {showAlertDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Informasi</h3>
              <p className="mb-6 text-gray-700">{dialogMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAlertDialog(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Oke
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourier;