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
      
      // Tambahkan console.log untuk melihat barang yang di-fetch
      console.log("Barang yang di-fetch:", dataBarang);
    
      setBarangList(dataBarang);
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.status, error.response.data);
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

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        id_kategori: formData.id_kategori.trim(), // pastikan string, sesuai BE
      };
  
      const res = await axios.post("http://localhost:3000/api/barang", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
  
      if (res.status === 201 || res.status === 200) {
        setFormData({
          nama_barang: "",
          deskripsi: "",
          harga: "",
          stok: "",
          id_kategori: "",
        });
        setShowModal(false);
        fetchBarang();
      } else {
        throw new Error("Gagal menambahkan barang");
      }
    } catch (error) {
      console.error("Error saat menambahkan barang:", error);
      alert("Gagal menambahkan barang. Silakan cek kembali isian form.");
    }
  };
  

  return (
    <div className="flex">
      <AdminSidebar activePage="Manage Product" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Manajemen Barang</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Tambah Barang
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
                  <td className="px-6 py-3">{barang.status_stok}</td>{" "}
                  {/* sesuaikan dengan data */}
                  <td className="px-6 py-3">{barang.deskripsi}</td>
                  <td className="px-6 py-3 space-x-2">
                    <button className="text-blue-600">
                      <Pencil size={16} />
                    </button>
                    <button className="text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Tambah Barang</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="nama_barang"
                  value={formData.nama_barang}
                  onChange={handleChange}
                  placeholder="Nama Barang"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  name="id_kategori"
                  value={formData.id_kategori}
                  onChange={handleChange}
                  placeholder="Kategori (contoh: teh, kopi)"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleChange}
                  placeholder="Harga (Rp)"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleChange}
                  placeholder="Stok"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Deskripsi"
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
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

export default ManageProduct;
