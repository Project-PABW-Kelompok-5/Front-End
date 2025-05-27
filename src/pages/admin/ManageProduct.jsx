import AdminSidebar from "../../components/AdminSidebar.jsx";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const ManageProduct = () => {
  const [showModal, setShowModal] = useState(false);
  const [barangList, setBarangList] = useState([]);
  const [formData, setFormData] = useState({
    nama_barang: "",
    deskripsi: "",
    harga: "",
    stok: "",
    id_kategori: "",
  });
  // State baru untuk fitur edit
  const [editingBarangId, setEditingBarangId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem("token");

  // Fungsi fetch barang
  const fetchBarang = async () => {
    const token = localStorage.getItem("token");
    console.log("Token yang dikirim:", token);

    try {
      const res = await axios.get("http://localhost:3000/api/barang/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response dari API:", res.data);

      const dataBarang = Array.isArray(res.data)
        ? res.data
        : res.data.data ?? [];

      console.log("Barang yang di-fetch:", dataBarang);

      setBarangList(dataBarang);
    } catch (error) {
      if (error.response) {
        console.error(
          "Error response:",
          error.response.status,
          error.response.data
        );
      } else {
        console.error("Error message:", error.message);
      }
      setBarangList([]);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // --- Fungsi Edit Barang ---
  const handleEditClick = (barang) => {
    setFormData({
      nama_barang: barang.nama_barang,
      deskripsi: barang.deskripsi,
      harga: barang.harga,
      stok: barang.stok,
      id_kategori: barang.id_kategori,
    });
    setEditingBarangId(barang.id_barang); // Simpan ID barang yang sedang diedit
    setIsEditing(true); // Set mode ke edit
    setShowModal(true); // Tampilkan modal
  };

  // --- Fungsi Hapus Barang ---
  const handleDelete = async (id_barang) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      return; // Batalkan jika user tidak yakin
    }

    try {
      await axios.delete(`http://localhost:3000/api/barang/${id_barang}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Barang berhasil dihapus!");
      fetchBarang(); // Refresh daftar barang setelah penghapusan
    } catch (error) {
      console.error("Error saat menghapus barang:", error);
      alert("Gagal menghapus barang.");
    }
  };

  // --- Modifikasi handleSubmit untuk POST (Tambah) dan PUT (Edit) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    try {
      const payload = {
        ...formData,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        // Pastikan id_kategori tidak kosong atau mengandung spasi berlebih
        id_kategori: formData.id_kategori.trim(),
      };

      if (isEditing && editingBarangId) {
        // Mode edit: kirim PUT request
        const res = await axios.put(
          `http://localhost:3000/api/barang/${editingBarangId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status === 200) {
          alert("Barang berhasil diperbarui!");
          // Reset state edit
          setEditingBarangId(null);
          setIsEditing(false);
        } else {
          throw new Error("Gagal memperbarui barang");
        }
      } else {
        // Mode tambah: kirim POST request
        const res = await axios.post("http://localhost:3000/api/barang", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 201 || res.status === 200) {
          alert("Barang berhasil ditambahkan!");
        } else {
          throw new Error("Gagal menambahkan barang");
        }
      }

      // Reset form dan tutup modal setelah sukses
      setFormData({
        nama_barang: "",
        deskripsi: "",
        harga: "",
        stok: "",
        id_kategori: "",
      });
      setShowModal(false);
      fetchBarang(); // Refresh daftar barang
    } catch (error) {
      console.error("Error saat menyimpan barang:", error);
      alert("Gagal menyimpan barang. Silakan cek kembali isian form.");
    }
  };

  const handleOpenModal = () => {
    setEditingBarangId(null); // Reset ID edit jika membuka modal baru
    setIsEditing(false); // Set mode ke tambah
    setFormData({ // Bersihkan form
      nama_barang: "",
      deskripsi: "",
      harga: "",
      stok: "",
      id_kategori: "",
    });
    setShowModal(true);
  };


  return (
    <div className="flex">
      <AdminSidebar activePage="Manage Product" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Manajemen Barang</h1>
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Tambah Barang
          </button>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Stok</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Harga</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Deskripsi</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barangList.map((barang) => (
                <tr key={barang.id_barang} className="border-t">
                  <td className="px-6 py-3">{barang.nama_barang}</td>
                  <td className="px-6 py-3">{barang.stok}</td>
                  <td className="px-6 py-3">{barang.id_kategori}</td>{" "}
                  {/* Kalau ingin nama kategori, perlu map */}
                  <td className="px-6 py-3">
                    {barang.harga?.toLocaleString() ?? "-"}
                  </td>
                  <td className="px-6 py-3">{barang.status_stock}</td>{" "}
                  {/* Sesuaikan dengan backend: status_stock */}
                  <td className="px-6 py-3">{barang.deskripsi}</td>
                  <td className="px-6 py-3 space-x-2">
                    <button
                      onClick={() => handleEditClick(barang)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(barang.id_barang)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {barangList.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Tidak ada barang yang ditemukan.
            </div>
          )}
        </div>

        {/* Modal untuk Tambah/Edit Barang */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? "Edit Barang" : "Tambah Barang Baru"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="nama_barang" className="block text-sm font-medium text-gray-700">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    id="nama_barang"
                    name="nama_barang"
                    value={formData.nama_barang}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    id="deskripsi"
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="harga" className="block text-sm font-medium text-gray-700">
                    Harga
                  </label>
                  <input
                    type="number"
                    id="harga"
                    name="harga"
                    value={formData.harga}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="stok" className="block text-sm font-medium text-gray-700">
                    Stok
                  </label>
                  <input
                    type="number"
                    id="stok"
                    name="stok"
                    value={formData.stok}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="id_kategori" className="block text-sm font-medium text-gray-700">
                    ID Kategori
                  </label>
                  <input
                    type="text"
                    id="id_kategori"
                    name="id_kategori"
                    value={formData.id_kategori}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    {isEditing ? "Simpan Perubahan" : "Tambah Barang"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProduct;