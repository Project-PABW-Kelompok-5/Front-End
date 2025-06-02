import AdminSidebar from "../../components/AdminSidebar.jsx";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const hardcodedKategoriList = {
  Elektronik: [
    "Smartphone", "Laptop", "Tv", "Gamepad", "Headphones", "Camera", "Watch", "Mouse", "Fan",
    "WashingMachine", "Refrigerator", "Microwave", "Speaker", "Printer", "Projector",
    "Tablet", "Keyboard", "Router", "Cable",
  ],
  Fashion: ["Shirt", "Shoe", "Watch", "Glasses", "Dress", "Hat", "Bag", "Scarf"],
  "Kesehatan & Kecantikan": ["HeartPulse", "Droplet", "Vial", "HandSoap", "Stethoscope", "Pill", "Thermometer", "Toothbrush"],
  "Rumah & Dapur": ["Home", "Utensils", "Bed", "Lamp", "Chair", "Sofa", "Refrigerator", "CookingPot"],
  "Makanan & Minuman": ["Pizza", "CupSoda", "Drumstick", "IceCream", "Coffee", "Milk", "Cake", "Utensils", "Soup", "Candy", "Burger", "Cookie", "Dessert", "Donut", "CookingPot"],
  "Ibu & Anak": ["Baby", "Stroller", "BookOpen", "TeddyBear", "Rattle", "Crayon", "ToyCar", "Diaper"],
  Hobi: ["Music", "Book", "Gamepad2", "Brush", "Palette", "Globe", "Microphone", "Camera"],
  Olahraga: ["Dumbbell", "Bicycle", "Running", "Football", "Basketball", "Award", "Target", "Tent"],
  Otomotif: ["Car", "Bike", "Fuel", "Wrench", "SteeringWheel", "Tyre", "Motorbike", "BatteryCharging"],
  Perkakas: ["Hammer", "Tool", "Screwdriver", "Plug", "Drill", "Saw", "TapeMeasure", "Bolt"],
};

const ManageProduct = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [barangToDeleteId, setBarangToDeleteId] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [kategoriList] = useState(hardcodedKategoriList);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nama_barang: "",
    deskripsi: "",
    harga: "",
    stok: "",
    id_kategori: "",
  });
  const [editingBarangId, setEditingBarangId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');

  const token = localStorage.getItem("token");

  const showCustomDialog = (message) => {
    setDialogMessage(message);
    setShowAlertDialog(true);
  };

  const findMainCategoryFromSub = (subCategoryName, categories) => {
    for (const mainCat in categories) {
      if (categories[mainCat].includes(subCategoryName)) {
        return mainCat;
      }
    }
    return '';
  };

  const fetchBarang = async () => {
    setLoading(true);
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
        showCustomDialog(`Gagal mengambil data barang: ${error.response.data.message || error.response.statusText}`);
      } else {
        console.error("Error message:", error.message);
        showCustomDialog(`Gagal mengambil data barang: ${error.message}`);
      }
      setBarangList([]);
    } finally {
      setLoading(false);
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

  const handleEditClick = (barang) => {
    const mainCat = findMainCategoryFromSub(barang.kategori, kategoriList);
    setSelectedMainCategory(mainCat);

    setFormData({
      nama_barang: barang.nama_barang,
      deskripsi: barang.deskripsi,
      harga: barang.harga,
      stok: barang.stok,
      id_kategori: barang.kategori,
    });
    setEditingBarangId(barang.id_barang);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id_barang) => {
    setBarangToDeleteId(id_barang);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!barangToDeleteId) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:3000/api/barang/${barangToDeleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showCustomDialog("Barang berhasil dihapus!");
      fetchBarang();
    } catch (error) {
      console.error("Error saat menghapus barang:", error);
      showCustomDialog("Gagal menghapus barang.");
    } finally {
      setBarangToDeleteId(null);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        kategori: formData.id_kategori,
        id_kategori: undefined
      };

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
        showCustomDialog("Barang berhasil diperbarui!");
        setEditingBarangId(null);
        setIsEditing(false);
      } else {
        throw new Error("Gagal memperbarui barang");
      }

      setFormData({
        nama_barang: "",
        deskripsi: "",
        harga: "",
        stok: "",
        id_kategori: "",
      });
      setSelectedMainCategory('');
      setShowModal(false);
      fetchBarang();
    } catch (error) {
      console.error("Error saat menyimpan barang:", error);
      showCustomDialog("Gagal menyimpan barang. Silakan cek kembali isian form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex font-sans">
      <AdminSidebar activePage="Manage Product" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Manajemen Barang</h1>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-gray-700 font-medium">Nama</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Stok</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Kategori</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Harga</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Status</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Deskripsi</th>
                <th className="px-6 py-3 text-gray-700 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && barangList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Memuat data barang...
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mt-2"></div>
                  </td>
                </tr>
              ) : barangList.length > 0 ? (
                barangList.map((barang) => (
                  <tr key={barang.id_barang} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">{barang.nama_barang}</td>
                    <td className="px-6 py-3 text-gray-800">{barang.stok}</td>
                    <td className="px-6 py-3 text-gray-800">
                      {barang.kategori || "-"}
                    </td>
                    <td className="px-6 py-3 text-gray-800">
                      Rp{barang.harga?.toLocaleString("id-ID") ?? "-"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        barang.stok === 0
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {barang.stok === 0 ? "Stok Habis" : "Stok Tersedia"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-800">{barang.deskripsi}</td>
                    <td className="px-6 py-3 space-x-2">
                      <button
                        onClick={() => handleEditClick(barang)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                        title="Edit Barang"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(barang.id_barang)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                        title="Hapus Barang"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Tidak ada barang yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Edit Barang
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="nama_barang" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    id="nama_barang"
                    name="nama_barang"
                    value={formData.nama_barang}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    id="deskripsi"
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="harga" className="block text-sm font-medium text-gray-700 mb-1">
                    Harga
                  </label>
                  <input
                    type="number"
                    id="harga"
                    name="harga"
                    value={formData.harga}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-1">
                    Stok
                  </label>
                  <input
                    type="number"
                    id="stok"
                    name="stok"
                    value={formData.stok}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="main_kategori" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Utama
                  </label>
                  <select
                    id="main_kategori"
                    name="main_kategori"
                    value={selectedMainCategory}
                    onChange={(e) => {
                      setSelectedMainCategory(e.target.value);
                      setFormData((prev) => ({ ...prev, id_kategori: '' }));
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Kategori Utama</option>
                    {Object.keys(kategoriList).map((mainCat) => (
                      <option key={mainCat} value={mainCat}>
                        {mainCat}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMainCategory && (
                  <div className="mb-4">
                    <label htmlFor="id_kategori" className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Kategori
                    </label>
                    <select
                      id="id_kategori"
                      name="id_kategori"
                      value={formData.id_kategori}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih Sub Kategori</option>
                      {kategoriList[selectedMainCategory].map((subCat) => (
                        <option key={subCat} value={subCat}>
                          {subCat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    disabled={loading}
                  >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Konfirmasi Penghapusan</h3>
              <p className="mb-6 text-gray-700">Apakah Anda yakin ingin menghapus barang ini?</p>
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
                  disabled={loading}
                >
                  {loading ? "Menghapus..." : "Hapus"}
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

export default ManageProduct;