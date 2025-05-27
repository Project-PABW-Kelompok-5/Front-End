// src/pages/admin/ManageUsers.jsx
import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import axios from 'axios'; // Import axios
// Import auth Firebase
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, deleteUser } from "firebase/auth"; // Tambah deleteUser
import { app } from "../../firebase";

const API_USERS_URL = "http://localhost:3000/api/admin/users";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true); // Default true for initial fetch
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

  const [showAlertDialog, setShowAlertDialog] = useState(false); // State untuk modal alert kustom
  const [dialogMessage, setDialogMessage] = useState("");       // Pesan untuk modal alert
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State untuk modal konfirmasi
  const [userToDeleteId, setUserToDeleteId] = useState(null); // ID pengguna yang akan dihapus
  const [userToDeleteUid, setUserToDeleteUid] = useState(null); // UID pengguna Firebase yang akan dihapus

  const token = localStorage.getItem("token");
  const auth = getAuth(app); // Inisialisasi auth Firebase

  // Fungsi untuk menampilkan dialog alert kustom
  const showCustomDialog = (message) => {
    setDialogMessage(message);
    setShowAlertDialog(true);
  };

  // Fungsi untuk mengambil semua data pengguna
  const getAllUsers = async () => {
    setLoading(true); // Set loading true saat memulai fetch
    try {
      const res = await axios.get(API_USERS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      // Cek apakah data.users adalah array
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) { // Jika response langsung array (misal API endpoint lain)
        setUsers(data);
      } else {
        console.error("Format data tidak sesuai:", data);
        showCustomDialog("Format data pengguna dari server tidak valid.");
        setUsers([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
      showCustomDialog(`Gagal mengambil data pengguna: ${error.response?.data?.message || error.message}`);
      setUsers([]);
    } finally {
      setLoading(false); // Set loading false setelah fetch selesai
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // Reset form dan state modal
  const resetModalState = () => {
    setNewUser({
      name: "",
      email: "",
      username: "",
      password: "",
      no_telepon: "",
      role: "User",
    });
    setShowModal(false);
    setIsEditMode(false);
    setEditUserId(null);
  };

  // Handler untuk perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk submit form (Tambah/Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    if (isEditMode) {
      await handleUpdateUser();
    } else {
      await handleAddUser();
    }
  };

  const handleAddUser = async () => {
    setLoading(true); // Set loading true saat proses tambah user
    try {
      // 1. Buat akun user di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      const firebaseUser = userCredential.user;

      // 2. Kirim email verifikasi
      // Pastikan email action code settings dikonfigurasi di Firebase Console
      await sendEmailVerification(firebaseUser);

      // 3. Simpan data user ke backend (sertakan UID dari Firebase)
      const res = await axios.post(API_USERS_URL, {
        uid: firebaseUser.uid, // Kirim UID ke backend
        name: newUser.name, // Tambahkan field name
        username: newUser.username,
        email: newUser.email,
        no_telepon: newUser.no_telepon,
        role: newUser.role,
        saldo: 0 // Inisialisasi saldo default
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 201) {
        showCustomDialog("Pengguna berhasil ditambahkan. Email verifikasi telah dikirim.");
        getAllUsers(); // Refresh daftar user
        resetModalState(); // Reset form dan tutup modal
      } else {
        throw new Error(res.data.message || "Gagal menambah pengguna.");
      }
    } catch (error) {
      console.error("Kesalahan saat menambah pengguna:", error);
      let errorMessage = "Terjadi kesalahan saat menambah pengguna.";
      if (error.code) { // Firebase errors
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "Email sudah terdaftar. Gunakan email lain.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Format email tidak valid.";
            break;
          case 'auth/weak-password':
            errorMessage = "Password terlalu lemah (minimal 6 karakter).";
            break;
          default:
            errorMessage = `Firebase Error: ${error.message}`;
        }
      } else if (error.response?.data?.message) { // Backend errors
        errorMessage = error.response.data.message;
      } else if (error.message) { // Generic JS error
        errorMessage = error.message;
      }
      showCustomDialog(errorMessage);
    } finally {
      setLoading(false); // Set loading false
    }
  };

  const handleEditClick = (user) => {
    setIsEditMode(true);
    setEditUserId(user.id);
    setNewUser({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "", // Kosongkan password saat edit, hanya isi jika ingin diubah
      no_telepon: user.no_telepon,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleUpdateUser = async () => {
    setLoading(true); // Set loading true saat proses update user
    try {
      const updatedUser = { ...newUser };
      // Hapus password dari payload jika kosong (tidak diubah)
      if (!updatedUser.password) {
        delete updatedUser.password;
      }
      // Email tidak boleh diubah jika disabled di UI
      delete updatedUser.email;

      const res = await axios.put(
        `${API_USERS_URL}/${editUserId}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        showCustomDialog("Pengguna berhasil diperbarui!");
        getAllUsers(); // Refresh daftar user
        resetModalState(); // Reset form dan tutup modal
      } else {
        throw new Error(res.data.message || "Gagal memperbarui pengguna.");
      }
    } catch (error) {
      console.error("Kesalahan saat memperbarui pengguna:", error);
      showCustomDialog(`Gagal memperbarui pengguna: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false); // Set loading false
    }
  };

  // Fungsi untuk menghapus pengguna (memicu modal konfirmasi)
  const handleDeleteClick = (user) => {
    setUserToDeleteId(user.id);
    setUserToDeleteUid(user.uid); // Simpan UID Firebase untuk penghapusan
    showConfirmModal(true);
  };

  // Fungsi konfirmasi penghapusan
  const confirmDelete = async () => {
    setShowConfirmModal(false); // Tutup modal konfirmasi
    if (!userToDeleteId || !userToDeleteUid) return;

    setLoading(true); // Set loading true saat proses hapus user
    try {
      // 1. Hapus dari Firebase Authentication
      // Perhatikan: Menghapus user dari Firebase Auth di sisi klien memerlukan
      // user yang sedang login adalah admin, dan sesi admin masih aktif.
      // Untuk solusi produksi yang lebih aman, ini biasanya dilakukan di sisi server (Cloud Functions, dll.)
      // Namun, jika ini adalah panel admin dan token admin punya hak, kita bisa coba:
      // const firebaseUser = auth.currentUser;
      // if (firebaseUser && firebaseUser.uid === userToDeleteUid) {
      //   await deleteUser(firebaseUser); // Ini akan menghapus user yang sedang login
      // } else {
      //   // Untuk menghapus user lain, Anda perlu Cloud Functions/Admin SDK di backend
      //   // atau pastikan API backend Anda menghapus dari Firebase Auth juga.
      //   console.warn("Penghapusan Firebase Auth untuk user lain via klien tidak disarankan/tidak didukung langsung.");
      // }

      // Kita asumsikan backend akan menghapus user dari Firebase Auth
      const res = await axios.delete(`${API_USERS_URL}/${userToDeleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        showCustomDialog("Pengguna berhasil dihapus!");
        getAllUsers(); // Refresh daftar user
      } else {
        throw new Error(res.data.message || "Gagal menghapus pengguna.");
      }
    } catch (error) {
      console.error("Kesalahan saat menghapus pengguna:", error);
      showCustomDialog(`Gagal menghapus pengguna: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false); // Set loading false
      setUserToDeleteId(null);
      setUserToDeleteUid(null);
    }
  };


  return (
    <div className="flex font-sans">
      <AdminSidebar activePage="Manage Users" />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Manajemen Pengguna</h1>
          <button
            onClick={() => { setIsEditMode(false); resetModalState(); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            + Tambah Pengguna
          </button>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-gray-700 font-medium">Nama</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Email</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Username</th>
                <th className="px-6 py-3 text-gray-700 font-medium">No Telepon</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Role</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">{user.name}</td>
                    <td className="px-6 py-3 text-gray-800">{user.email}</td>
                    <td className="px-6 py-3 text-gray-800">{user.username}</td>
                    <td className="px-6 py-3 text-gray-800">{user.no_telepon}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                        onClick={() => handleEditClick(user)}
                        title="Edit Pengguna"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                        title="Hapus Pengguna"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Tambah/Edit Pengguna */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all duration-300 scale-100 opacity-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {isEditMode ? "Edit Pengguna" : "Tambah Pengguna"}
              </h2>
              <form onSubmit={handleSubmitForm}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nama Lengkap"
                    value={newUser.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg ${
                      isEditMode ? "bg-gray-100 cursor-not-allowed" : ""
                    } focus:ring-blue-500 focus:border-blue-500`}
                    disabled={isEditMode} // Email dinonaktifkan saat edit
                    required={!isEditMode} // Email wajib diisi hanya saat tambah
                  />

                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder={
                      isEditMode
                        ? "Kosongkan jika tidak ingin mengubah password"
                        : "Password"
                    }
                    value={newUser.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required={!isEditMode} // Password wajib diisi hanya saat tambah
                  />

                  <input
                    type="tel"
                    name="no_telepon"
                    placeholder="Nomor Telepon"
                    value={newUser.no_telepon}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />

                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button" // Penting: agar tidak submit form
                      onClick={resetModalState}
                      className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                      disabled={loading} // Nonaktifkan tombol saat loading
                    >
                      {loading ? "Memproses..." : (isEditMode ? "Update Pengguna" : "Tambah Pengguna")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Konfirmasi Penghapusan</h3>
              <p className="mb-6 text-gray-700">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                  disabled={loading} // Nonaktifkan tombol saat loading
                >
                  {loading ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Alert Kustom */}
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

export default ManageUsers;