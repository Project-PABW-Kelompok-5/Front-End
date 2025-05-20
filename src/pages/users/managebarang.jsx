import React, { useEffect, useState } from "react";
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
import { firestore } from "../../firebase"; // sesuaikan path jika perlu
import Navbar from "../../components/navbar";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form state
  const [form, setForm] = useState({
    nama_barang: "",
    deskripsi: "",
    harga: "",
    stok: "",
    id_kategori: "",
    status_pengiriman: "menunggu penjual",
    status_stock: "stok tersedia",
  });

  // Ambil data produk dari Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "barang"));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setProducts(items);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Buka modal tambah produk
  const openAddModal = () => {
    setIsEdit(false);
    setForm({
      nama_barang: "",
      deskripsi: "",
      harga: "",
      stok: "",
      id_kategori: "",
      status_pengiriman: "menunggu penjual",
      status_stock: "stok tersedia",
    });
    setShowModal(true);
  };

  // Buka modal edit produk
  const openEditModal = (product) => {
    setIsEdit(true);
    setCurrentProduct(product);
    setForm({
      nama_barang: product.nama_barang || "",
      deskripsi: product.deskripsi || "",
      harga: product.harga || "",
      stok: product.stok || "",
      id_kategori: product.id_kategori || "",
      status_pengiriman: product.status_pengiriman || "menunggu penjual",
      status_stock: product.status_stock || "stok tersedia",
    });
    setShowModal(true);
  };

  // Simpan produk baru ke Firestore
  const handleAddProduct = async () => {
    try {
      await addDoc(collection(firestore, "barang"), {
        ...form,
        harga: Number(form.harga),
        stok: Number(form.stok),
        created_at: new Date().toISOString(),
      });
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Update produk di Firestore
  const handleUpdateProduct = async () => {
    try {
      const productRef = doc(firestore, "barang", currentProduct.id);
      await updateDoc(productRef, {
        ...form,
        harga: Number(form.harga),
        stok: Number(form.stok),
      });
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Hapus produk
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      try {
        await deleteDoc(doc(firestore, "barang", id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // Update status pengiriman produk (untuk dropdown pesanan)
  const updateStatusPengiriman = async (productId, newStatus) => {
    try {
      const productRef = doc(firestore, "barang", productId);
      await updateDoc(productRef, { status_pengiriman: newStatus });
      fetchProducts();
    } catch (error) {
      console.error("Error updating status pengiriman:", error);
    }
  };

  // Format harga ke Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="p-0 max-w-11xl mx-auto">
      <Navbar />
      <h1 className="text-3xl font-bold ml-8 mt-10 mb-6">Manajemen Produk</h1>

      <button
        onClick={openAddModal}
        className="mb-6 ml-8 px-5 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        + Tambah Produk
      </button>

      {loading ? (
        <p>Loading produk...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border  border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left">Gambar</th>
                <th className="border border-gray-300 p-3 text-left">
                  Nama Produk
                </th>
                <th className="border border-gray-300 p-3 text-left">
                  Kategori
                </th>
                <th className="border border-gray-300 p-3 text-left">Harga</th>
                <th className="border border-gray-300 p-3 text-left">Stok</th>
                <th className="border border-gray-300 p-3 text-left">
                  Status Stok
                </th>
                <th className="border border-gray-300 p-3 text-left">
                  Pesanan
                </th>
                <th className="border border-gray-300 p-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isAvailable =
                  product.status_stock === "stok tersedia" ||
                  product.status_stock === "Stok Tersedia";

                return (
                  <tr key={product.id} className="border-b border-gray-200">
                    <td className="p-3">
                      {/* Placeholder gambar */}
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    </td>
                    <td className="p-3 font-semibold">{product.nama_barang}</td>
                    <td className="p-3">{product.id_kategori}</td>
                    <td className="p-3">{formatRupiah(product.harga)}</td>
                    <td className="p-3">{product.stok}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold text-sm ${
                          isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isAvailable ? "Stok Tersedia" : "Stok Kosong"}
                      </span>
                    </td>
                    <td className="p-3">
                      {/* Dropdown Pesanan */}
                      {product.status_pengiriman === "menunggu penjual" ? (
                        <button
                          onClick={() =>
                            updateStatusPengiriman(
                              product.id,
                              "diproses penjual"
                            )
                          }
                          className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition"
                        >
                          Proses
                        </button>
                      ) : product.status_pengiriman === "diproses penjual" ? (
                        <button
                          onClick={() =>
                            updateStatusPengiriman(product.id, "menunggu kurir")
                          }
                          className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h1l1 2h13l1-2h1M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10M5 10L4 6h16l-1 4M7 16h.01M17 16h.01"
                            />
                          </svg>
                          Panggil Kurir
                        </button>
                      ) : (
                        <span className="italic text-gray-600">
                          {product.status_pengiriman}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => openEditModal(product)}
                        className="mr-3 text-blue-600 hover:underline"
                        title="Edit Produk"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:underline"
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

      {/* Modal Tambah/Edit Produk */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Nama Produk</label>
                <input
                  type="text"
                  name="nama_barang"
                  value={form.nama_barang}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Masukkan nama produk"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Masukkan deskripsi produk"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Harga</label>
                <input
                  type="number"
                  name="harga"
                  value={form.harga}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Masukkan harga produk"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Stok</label>
                <input
                  type="number"
                  name="stok"
                  value={form.stok}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Masukkan jumlah stok"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kategori</label>
                <input
                  type="text"
                  name="id_kategori"
                  value={form.id_kategori}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Masukkan kategori produk"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={isEdit ? handleUpdateProduct : handleAddProduct}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                {isEdit ? "Update Produk" : "Tambah Produk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
