import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Navbar from "../../components/navbar";
import { firestore } from "../../firebase"; // sesuaikan path jika perlu

// Modal component for adding/editing product
function ProductModal({ isOpen, onClose, onSave, initialData }) {
  const [namaBarang, setNamaBarang] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [kategori, setKategori] = useState("");
  const [statusStock, setStatusStock] = useState("stok tersedia");

  useEffect(() => {
    if (initialData) {
      setNamaBarang(initialData.nama_barang || "");
      setDeskripsi(initialData.deskripsi || "");
      setHarga(initialData.harga || "");
      setStok(initialData.stok || "");
      setKategori(initialData.id_kategori || "");
      setStatusStock(initialData.status_stock || "stok tersedia");
    } else {
      setNamaBarang("");
      setDeskripsi("");
      setHarga("");
      setStok("");
      setKategori("");
      setStatusStock("stok tersedia");
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!namaBarang || !harga || !stok || !kategori) {
      alert("Mohon isi semua field yang wajib.");
      return;
    }
    onSave({
      nama_barang: namaBarang,
      deskripsi,
      harga: Number(harga),
      stok: Number(stok),
      id_kategori: kategori,
      status_stock: statusStock,
    });
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
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
              rows={3}
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
            <input
              type="text"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Status Stok</label>
            <select
              value={statusStock}
              onChange={(e) => setStatusStock(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="stok tersedia">Stok Tersedia</option>
              <option value="stok kosong">Stok Kosong</option>
            </select>
          </div>
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

  // Fungsi format harga ke Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Ambil data produk dari Firestore
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(firestore, "barang"));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setProducts(items);
    } catch (err) {
      setError("Gagal mengambil data produk: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
        await addDoc(collection(firestore, "barang"), productData);
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
    <div className="p-0 max-w-10xl mx-auto">
      <Navbar />
      <h1 className="text-2xl font-bold mt-10 mb-6">Manajemen Produk</h1>

      <button
        onClick={openAddModal}
        className="mb-6 px-5 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        + Tambah Produk
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading ? (
        <p>Loading produk...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b text-left">Gambar</th>
                <th className="px-4 py-2 border-b text-left">Nama Produk</th>
                <th className="px-4 py-2 border-b text-left">Kategori</th>
                <th className="px-4 py-2 border-b text-left">Harga</th>
                <th className="px-4 py-2 border-b text-left">Stok</th>
                <th className="px-4 py-2 border-b text-left">Status</th>
                <th className="px-4 py-2 border-b text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-4 text-gray-500 italic"
                  >
                    Tidak ada produk.
                  </td>
                </tr>
              )}
              {products.map((product) => {
                const isAvailable =
                  product.status_stock === "stok tersedia" ||
                  product.status_stock === "Stok Tersedia";
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 border-b">
                      {/* Placeholder gambar */}
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-sm">
                        Img
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b font-semibold">
                      {product.nama_barang}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {product.id_kategori}
                    </td>
                    <td className="px-4 py-3 border-b">
                      {formatRupiah(product.harga)}
                    </td>
                    <td className="px-4 py-3 border-b">{product.stok}</td>
                    <td className="px-4 py-3 border-b">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isAvailable ? "Stok Tersedia" : "Stok Kosong"}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b space-x-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                        title="Edit Produk"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        title="Hapus Produk"
                      >
                        🗑️
                      </button>
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
  );
}
