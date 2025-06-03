import AdminSidebar from "../../components/AdminSidebar.jsx";
import { Pencil, Trash2, PackagePlus, Box, X } from "lucide-react";
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
  const [showModalContent, setShowModalContent] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [barangToDeleteId, setBarangToDeleteId] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [kategoriList] = useState(hardcodedKategoriList);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submit button loading

  const [formData, setFormData] = useState({
    nama_barang: "",
    deskripsi: "",
    harga: "",
    stok: "",
    kategori: "",
  });
  const [editingBarangId, setEditingBarangId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');

  const token = localStorage.getItem("token");

  const showCustomDialog = (message) => {
    setDialogMessage(message);
    setShowAlertDialog(true);
  };

  const resetForm = () => {
    setShowModalContent(false);
    setTimeout(() => {
      setFormData({
        nama_barang: "",
        deskripsi: "",
        harga: "",
        stok: "",
        kategori: "",
      });
      setSelectedMainCategory('');
      setEditingBarangId(null);
      setIsEditing(false);
      setShowModal(false);
      setIsSubmitting(false); // Reset submitting state
    }, 300); // Match transition duration
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
    try {
      const res = await axios.get("http://localhost:3000/api/barang/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dataBarang = Array.isArray(res.data)
        ? res.data
        : res.data.data ?? [];

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
      kategori: barang.kategori,
    });
    setEditingBarangId(barang.id_barang);
    setIsEditing(true);
    setShowModal(true);
    setTimeout(() => setShowModalContent(true), 50);
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setEditingBarangId(null);
    setFormData({
      nama_barang: "",
      deskripsi: "",
      harga: "",
      stok: "",
      kategori: "",
    });
    setSelectedMainCategory('');
    setShowModal(true);
    setTimeout(() => setShowModalContent(true), 50);
  };

  const handleDelete = (id_barang) => {
    setBarangToDeleteId(id_barang);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setShowConfirmModal(false);
    if (!barangToDeleteId) return;

    setIsSubmitting(true); // Disable delete button during submission
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
      setIsSubmitting(false); // Re-enable delete button
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable submit button during submission

    if (!formData.nama_barang || !formData.deskripsi || !formData.harga || !formData.stok || !formData.kategori) {
      showCustomDialog("Harap lengkapi semua bidang.");
      setIsSubmitting(false);
      return;
    }
    if (Number(formData.harga) <= 0) {
      showCustomDialog("Harga harus lebih besar dari nol.");
      setIsSubmitting(false);
      return;
    }
    if (Number(formData.stok) < 0) {
      showCustomDialog("Stok tidak boleh negatif.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        nama_barang: formData.nama_barang,
        deskripsi: formData.deskripsi,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        kategori: formData.kategori,
      };

      let res;
      if (isEditing) {
        res = await axios.put(
          `http://localhost:3000/api/barang/${editingBarangId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        res = await axios.post(
          `http://localhost:3000/api/barang/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }


      if (res.status === 200 || res.status === 201) {
        showCustomDialog(`Barang berhasil di${isEditing ? 'perbarui' : 'tambahkan'}!`);
        resetForm();
        fetchBarang();
      } else {
        throw new Error("Gagal menyimpan barang");
      }
    } catch (error) {
      console.error("Error saat menyimpan barang:", error);
      const errorMessage = error.response?.data?.message || "Silakan cek kembali isian form.";
      showCustomDialog(`Gagal menyimpan barang: ${errorMessage}`);
    } finally {
      setIsSubmitting(false); // Re-enable submit button
    }
  };

  return (
    <div className="flex font-sans">
      <AdminSidebar activePage="Manage Product" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Manajemen Barang</h1>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            + Tambah Barang
          </button>
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
                      Rp{barang.harga?.toLocaleString("id-ID", { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('IDR', '').trim() ?? "-"}
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
            <div className={`bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative
                          transform transition-all duration-300 ease-out
                          ${showModalContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
              <button
                onClick={resetForm}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Tutup modal"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                {isEditing ? (
                  <Box size={24} className="text-blue-600" />
                ) : (
                  <PackagePlus size={24} className="text-green-600" />
                )}
                {isEditing ? "Edit Barang" : "Tambah Barang Baru"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="nama_barang" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Barang
                    </label>
                    <input
                      type="text"
                      id="nama_barang"
                      name="nama_barang"
                      value={formData.nama_barang}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      id="deskripsi"
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="harga" className="block text-sm font-medium text-gray-700 mb-1">
                      Harga
                    </label>
                    <input
                      type="number"
                      id="harga"
                      name="harga"
                      value={formData.harga}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="stok" className="block text-sm font-medium text-gray-700 mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      id="stok"
                      name="stok"
                      value={formData.stok}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="main_kategori" className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori Utama
                    </label>
                    <select
                      id="main_kategori"
                      name="main_kategori"
                      value={selectedMainCategory}
                      onChange={(e) => {
                        setSelectedMainCategory(e.target.value);
                        setFormData((prev) => ({ ...prev, kategori: '' }));
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
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
                    <div>
                      <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">
                        Sub Kategori
                      </label>
                      <select
                        id="kategori"
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        required
                      >
                        <option value="">Pilih Sub Kategori</option>
                        {kategoriList[selectedMainCategory]?.map((subCat) => (
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
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Menyimpan..." : (isEditing ? "Simpan Perubahan" : "Tambah Barang")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Trash2 size={20} className="text-red-600" /> Konfirmasi Penghapusan
              </h3>
              <p className="mb-6 text-gray-700">Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menghapus..." : "Hapus"}
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