import React, { useCallback, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
// import Navbar from "../../components/header";
import { firestore } from "../../firebase";
import * as LucideIcons from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";

// Modal component for adding/editing product
function ProductModal({ isOpen, onClose, onSave, initialData }) {
  const [namaBarang, setNamaBarang] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [kategori, setKategori] = useState("");
  const [icon, setIcon] = useState("");

  const kategoriList = {
    Elektronik: [
      "Smartphone",
      "Laptop",
      "Tv",
      "Gamepad",
      "Headphones",
      "Camera",
      "Watch",
      "Mouse",
      "Fan",
      "WashingMachine",
      "Refrigerator",
      "Microwave",
      "Speaker",
      "Printer",
      "Projector",
      "Tablet",
      "Keyboard",
      "Router",
      "Cable",
    ],
    Fashion: [
      "Shirt",
      "Shoe",
      "Watch",
      "Glasses",
      "Dress",
      "Hat",
      "Bag",
      "Scarf",
    ],
    "Kesehatan & Kecantikan": [
      "HeartPulse",
      "Droplet",
      "Vial",
      "HandSoap",
      "Stethoscope",
      "Pill",
      "Thermometer",
      "Toothbrush",
    ],
    "Rumah & Dapur": [
      "Home",
      "Utensils",
      "Bed",
      "Lamp",
      "Chair",
      "Sofa",
      "Refrigerator",
      "CookingPot",
    ],
    "Makanan & Minuman": [
      "Pizza",
      "CupSoda",
      "Drumstick",
      "IceCream",
      "Coffee",
      "Milk",
      "Cake",
      "Utensils",
      "Soup",
      "Candy",
      "Burger",
      "Cookie",
      "Dessert",
      "Donut",
      "CookingPot",
    ],
    "Ibu & Anak": [
      "Baby",
      "Stroller",
      "BookOpen",
      "TeddyBear",
      "Rattle",
      "Crayon",
      "ToyCar",
      "Diaper",
    ],
    Hobi: [
      "Music",
      "Book",
      "Gamepad2",
      "Brush",
      "Palette",
      "Globe",
      "Microphone",
      "Camera",
    ],
    Olahraga: [
      "Dumbbell",
      "Bicycle",
      "Running",
      "Football",
      "Basketball",
      "Award",
      "Target",
      "Tent",
    ],
    Otomotif: [
      "Car",
      "Bike",
      "Fuel",
      "Wrench",
      "SteeringWheel",
      "Tyre",
      "Motorbike",
      "BatteryCharging",
    ],
    Perkakas: [
      "Hammer",
      "Tool",
      "Screwdriver",
      "Plug",
      "Drill",
      "Saw",
      "TapeMeasure",
      "Bolt",
    ],
  };

  const User = JSON.parse(localStorage.getItem("user"));
  const uid = User ? User.id : null;

  // Fungsi untuk reset form
  const resetForm = useCallback(() => {
    if (initialData) {
      setNamaBarang(initialData.nama_barang || "");
      setDeskripsi(initialData.deskripsi || "");
      setHarga(initialData.harga?.toString() || "");
      setStok(initialData.stok?.toString() || "");
      setKategori(initialData.kategori || "");
      setIcon(initialData.icon || "");
    } else {
      setNamaBarang("");
      setDeskripsi("");
      setHarga("");
      setStok("");
      setKategori("");
      setIcon("");
    }
  }, [initialData]);

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!namaBarang || !harga || !stok || !kategori) {
      alert("Mohon isi semua field yang wajib.");
      return;
    }
    onSave({
      nama_barang: namaBarang,
      deskripsi,
      harga: Number(harga),
      stok: Number(stok),
      kategori,
      id_user: uid,
      icon,
    });
  };

  return (
    <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
      <div className="fixed inset-0 bg-black opacity-30"></div>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Edit Produk" : "Tambah Produk"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Nama Produk*</label>
            <input
              type="text"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Harga (IDR)*</label>
            <input
              type="number"
              min="0"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Stok*</label>
            <input
              type="number"
              min="0"
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Kategori*</label>
            <select
              value={kategori}
              onChange={(e) => {
                setKategori(e.target.value);
                setIcon(""); // Reset ikon saat kategori diganti (jika perlu)
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {Object.keys(kategoriList).map((kategoriOption) => (
                <option key={kategoriOption} value={kategoriOption}>
                  {kategoriOption}
                </option>
              ))}
            </select>
          </div>
          {kategori && (
            <div>
              <label className="block font-medium mb-1">
                Pilih Icon Produk
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Icon --</option>
                {kategoriList[kategori].map((iconName) => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {icon && LucideIcons[icon] && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="font-medium">Preview:</span>
              {React.createElement(LucideIcons[icon], { size: 28 })}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductManagement() {
  const User = JSON.parse(localStorage.getItem("user"));
  const uid = User ? User.id : null;
  // State untuk daftar produk
  const [products, setProducts] = useState([]);
  // Loading state saat fetch data
  const [loading, setLoading] = useState(true);
  // State modal tambah/edit
  const [modalOpen, setModalOpen] = useState(false);
  // State data produk yang sedang diedit (null jika tambah baru)
  const [editProduct, setEditProduct] = useState(null);
  // State error message
  const [error, setError] = useState(null);

  // Fungsi untuk mendapatkan komponen ikon Lucide berdasarkan nama string
  const getLucideIconComponent = (iconName) => {
    const IconComponent = LucideIcons[iconName];
    return IconComponent || LucideIcons.Package;
  };

  // Fungsi format harga ke Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(firestore, "barang"),
        where("id_user", "==", uid)
      );

      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setProducts(items);
    } catch (err) {
      setError("Gagal mengambil data produk: " + err.message);
      console.error("Error fetching products:", err);
    } finally {
      // Use finally to ensure loading is always set to false
      setLoading(false);
    }
  }, [uid]);

  // Jalankan fetchProducts saat komponen dimuat atau UID berubah
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Buka modal tambah produk
  const openAddModal = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  // Buka modal edit produk dengan data produk
  const openEditModal = (product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  // Tutup modal
  const closeModal = () => {
    setModalOpen(false);
    setEditProduct(null);
  };

  // Simpan produk baru atau update produk lama
  const handleSaveProduct = async (productData) => {
    setError(null);
    try {
      if (editProduct) {
        // Update produk
        const productRef = doc(firestore, "barang", editProduct.id);
        await updateDoc(productRef, productData);
      } else {
        // Tambah produk baru
        const newBarangRef = await addDoc(
          collection(firestore, "barang"),
          productData
        );
        await updateDoc(newBarangRef, {
          id_barang: newBarangRef.id,
        });
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      setError("Gagal menyimpan produk: " + err.message);
    }
  };

  // Hapus produk dengan konfirmasi
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      setError(null);
      try {
        await deleteDoc(doc(firestore, "barang", id));
        fetchProducts();
      } catch (err) {
        setError("Gagal menghapus produk: " + err.message);
      }
    }
  };

  return (
    <div className="bg-pink-950">
      {/* <Navbar /> */}
      <div className="px-6 md:px-10 lg:px-20 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mt-2 mb-6">
          <h1 className="text-2xl font-bold">Manajemen Produk</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            + Tambah Produk
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading produk...</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="min-w-full">
              <thead className="bg-purple-950 text-sm">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-white">
                    Nama Produk
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-white">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-white">
                    Harga
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-white">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-white">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-white">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-gray-500 italic"
                    >
                      Tidak ada produk.
                    </td>
                  </tr>
                )}
                {products.map((product) => {
                  const isAvailable = product.stok > 0;
                  const ProductIconComponent = getLucideIconComponent(
                    product.icon
                  );
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 border-t font-semibold text-gray-900 bg-purple-300">
                        <div className="flex items-center gap-2">
                          {/* Render ikon produk */}
                          <ProductIconComponent
                            size={28}
                            className="text-[#753799]"
                          />
                          <span>{product.nama_barang}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-t text-gray-700 bg-purple-300">
                        {product.kategori}
                      </td>
                      <td className="px-4 py-3 border-t text-gray-700 bg-purple-300">
                        {formatRupiah(product.harga)}
                      </td>
                      <td className="px-4 py-3 border-t bg-purple-300">
                        {product.stok}
                      </td>
                      <td className="px-4 py-3 border-t bg-purple-300">
                        <span
                          className={`inline-block px-3 py-1 rounded-sm text-xs font-bold ${
                            isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isAvailable ? "Stok Tersedia" : "Stok Kosong"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-t bg-purple-300">
                        <div className="flex items-center space-x-2 ">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                            title="Edit Produk"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                            title="Hapus Produk"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal tambah/edit produk */}
        <ProductModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={handleSaveProduct}
          initialData={editProduct}
        />
      </div>
    </div>
  );
}
