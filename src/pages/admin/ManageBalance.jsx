import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/admin/users';

const ManageBalance = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saldoInput, setSaldoInput] = useState('');
  const [isAdding, setIsAdding] = useState(true);
  const [showAlertDialog, setShowAlertDialog] = useState(false); 
  const [dialogMessage, setDialogMessage] = useState('');       

  const token = localStorage.getItem("token");

  const showCustomDialog = (message) => {
    setDialogMessage(message);
    setShowAlertDialog(true);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.error("Format respons tidak sesuai", data);
        setUsers([]);
        showCustomDialog("Format data pengguna dari server tidak valid.");
      }
    } catch (err) {
      console.error("Gagal fetch data pengguna", err);
      setUsers([]);
      if (err.response) {
        showCustomDialog(`Gagal mengambil data pengguna: ${err.response.data.message || err.response.statusText}`);
      } else {
        showCustomDialog(`Gagal mengambil data pengguna: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user, mode) => {
    setSelectedUser(user);
    setIsAdding(mode === 'add');
    setSaldoInput('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSaldoInput('');
  };

  const handleSubmit = async () => {
    const jumlah = parseFloat(saldoInput);
    if (isNaN(jumlah) || jumlah <= 0) {
      showCustomDialog("Masukkan jumlah saldo yang valid (angka positif).");
      return;
    }

    const amount = isAdding ? jumlah : -jumlah;

    try {
      const response = await axios.patch(`${API_URL}/${selectedUser.id}`, { amount }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        showCustomDialog(`Saldo berhasil ${isAdding ? 'ditambah' : 'dikurangi'}!`);
        fetchUsers();
        closeModal();
      } else {
        showCustomDialog("Gagal update saldo: " + (response.data.message || "Terjadi kesalahan."));
      }
    } catch (err) {
      console.error("Gagal update saldo", err);
      if (err.response) {
        showCustomDialog("Gagal update saldo: " + (err.response.data.message || err.response.statusText));
      } else {
        showCustomDialog("Terjadi kesalahan saat menghubungi server.");
      }
    }
  };

  return (
    <div className="flex font-sans">
      <AdminSidebar activePage="Manage Balance" />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Manajemen Saldo Pengguna</h1>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-gray-700 font-medium">Username</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Email</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Saldo</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">{user.username}</td>
                    <td className="px-6 py-3 text-gray-800">{user.email}</td>
                    <td className="px-6 py-3 text-gray-800">
                      {typeof user.saldo === 'number' ? `Rp ${user.saldo.toLocaleString('id-ID')}` : 'Rp 0'}
                    </td>
                    <td className="px-6 py-3 space-x-2">
                      <button
                        onClick={() => openModal(user, 'add')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                        title="Tambah Saldo"
                      >
                        Tambah
                      </button>
                      <button
                        onClick={() => openModal(user, 'subtract')}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                        title="Kurangi Saldo"
                      >
                        Kurangi
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {isAdding ? "Tambah" : "Kurangi"} Saldo untuk {selectedUser?.username}
              </h2>
              <input
                type="number"
                placeholder="Jumlah saldo"
                value={saldoInput}
                onChange={(e) => setSaldoInput(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {showAlertDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
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

export default ManageBalance;
