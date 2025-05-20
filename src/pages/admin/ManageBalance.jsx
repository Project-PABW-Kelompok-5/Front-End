import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';

const API_URL = 'http://localhost:3000/api/admin/users'; 

const ManageBalance = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saldoInput, setSaldoInput] = useState('');
  const [isAdding, setIsAdding] = useState(true);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.error("Format respons tidak sesuai", data);
        setUsers([]);
      }
    } catch (err) {
      console.error("Gagal fetch data pengguna", err);
      setUsers([]);
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
    if (isNaN(jumlah) || jumlah < 0) {
      alert("Masukkan jumlah saldo yang valid");
      return;
    }
  
    // Tentukan amount: positif jika menambah, negatif jika mengurangi
    const amount = isAdding ? jumlah : -jumlah;
  
    try {
      const response = await fetch(`${API_URL}/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }), // sesuai dengan backend
      });
  
      if (response.ok) {
        fetchUsers();     // refresh data
        closeModal();     // tutup modal
      } else {
        const errData = await response.json();
        alert("Gagal update saldo: " + errData.message);
      }
    } catch (err) {
      console.error("Gagal update saldo", err);
      alert("Terjadi kesalahan saat menghubungi server.");
    }
  };
  

  return (
    <div className="flex">
      <AdminSidebar activePage="Manage Balance" />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Daftar Pengguna</h1>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Saldo</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="px-6 py-3">{user.username}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">
                  {typeof user.saldo === 'number' ? `Rp ${user.saldo.toLocaleString()}` : 'Rp 0'}

                  </td>
                  <td className="px-6 py-3 space-x-2">
                    <button
                      onClick={() => openModal(user, 'add')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Tambah
                    </button>
                    <button
                      onClick={() => openModal(user, 'subtract')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Kurangi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
              <h2 className="text-xl font-semibold mb-4">
                {isAdding ? "Tambah" : "Kurangi"} Saldo
              </h2>
              <p className="mb-2">
                Pengguna: <strong>{selectedUser?.nama}</strong>
              </p>
              <input
                type="number"
                placeholder="Jumlah saldo"
                value={saldoInput}
                onChange={(e) => setSaldoInput(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Simpan
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
