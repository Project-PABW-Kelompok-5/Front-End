"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag,
  X,
  Laptop,
  Headphones,
  Watch,
  Smartphone,
  Camera,
  Tablet,
  Cable,
  Coffee,
  Package,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Navbar1 from "../components/navbar1";
import { firestore } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default function HomePage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const uid = storedUser?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [cartItems, setCartItems] = useState([]);
  const [productsData, setproductsData] = useState([]);

  const productsPerPage = 8;
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = product.nama_barang
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.kategori === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const displayedProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSelect = (page) => {
    setCurrentPage(page);
  };

  const getProductIcon = (iconName) => {
    switch (iconName) {
      case "smartphone":
        return <Smartphone className="h-8 w-8 text-[#753799]" />;
      case "laptop":
        return <Laptop className="h-8 w-8 text-[#753799]" />;
      case "headphones":
        return <Headphones className="h-8 w-8 text-[#753799]" />;
      case "watch":
        return <Watch className="h-8 w-8 text-[#753799]" />;
      case "camera":
        return <Camera className="h-8 w-8 text-[#753799]" />;
      case "tablet":
        return <Tablet className="h-8 w-8 text-[#753799]" />;
      case "cable":
        return <Cable className="h-8 w-8 text-[#753799]" />;
      case "coffee":
        return <Coffee className="h-8 w-8 text-[#753799]" />;
      default:
        return <Package className="h-8 w-8 text-[#753799]" />;
    }
  };

  const getProductIconpreview = (iconName) => {
    switch (iconName) {
      case "smartphone":
        return (
          <Smartphone className="h-20 md:h-20 w-20 md:w-20 text-[#753799]" />
        );
      case "laptop":
        return <Laptop className="h-20 md:h-20 w-20 md:w-20 text-[#753799]" />;
      case "headphones":
        return (
          <Headphones className="h-20 md:h-20 w-20 md:w-20 text-[#753799]" />
        );
      case "watch":
        return <Watch className="h-20 md:h-20 w-20 md:w-20 text-[#753799]" />;
      case "camera":
        return <Camera className="h-20 md:h-20 w-20 md:w-20 text-[#753799]" />;
      case "tablet":
        return <Tablet className="h-20 md:h-20 w-20 md:w-20 text-[#753799]" />;
      case "cable":
        return <Cable className="h-8 w-8 text-[#753799]" />;
      case "coffee":
        return <Coffee className="h-20 w-20 text-[#753799]" />;
      default:
        return <Package className="h-20 md:h-20 w-20 md:w-20 text-[#753799]" />;
    }
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          buttons.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          buttons.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          buttons.push(i);
        }
      }
    }

    return buttons;
  };

  const handleCloseModal = () => {
    setPreviewProduct(null);
  };

  const addToCartFirestore = async (productId) => {
    if (!uid) {
      alert("Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }

    try {
      // Referensi dokumen barang
      const productRef = doc(firestore, "barang", productId);

      // Tambahkan uid ke array id_cart_user (tidak duplikat)
      await updateDoc(productRef, {
        id_cart_user: arrayUnion(uid),
      });
    } catch (err) {
      console.error("Gagal menambah ke cart di Firestore:", err);
      alert("Terjadi kesalahan saat menambah ke keranjang.");
    }
  };

  const getCartItems = async (uid) => {
    if (!uid) return [];

    try {
      const snapshot = await getDocs(
        collection(firestore, `carts/${uid}/items`)
      );
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Gagal mengambil data cart:", error);
      return [];
    }
  };

  // Fungsi untuk load cart items dari Firestore dan update state
  const loadCartItems = useCallback(async () => {
    if (!uid) return;
    try {
      const items = await getCartItems(uid);
      setCartItems(items);
    } catch (error) {
      console.error("Gagal load cart items:", error);
    }
  }, [uid]);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  const handleAddToCart = async (product) => {
    if (!uid) {
      alert("Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }

    if (product.id_user === uid) {
      alert("Anda tidak dapat menambahkan produk milik sendiri ke keranjang.");
      return;
    }

    try {
      // 1. Update Firestore ke dalam koleksi carts/{uid}/items/{productId}
      const cartItemRef = doc(firestore, "carts", uid, "items", product.id);
      await setDoc(cartItemRef, {
        qty: product.jumlah, // jumlah dari state
        productId: product.id,
      });

      await loadCartItems();
      alert("Berhasil menambahkan ke keranjang!");
    } catch (err) {
      console.error("Gagal menambah ke cart di Firestore:", err);
      alert("Terjadi kesalahan saat menambah ke keranjang.");
    }
    await addToCartFirestore(product.id);
  };

  const addToWishlist = (product) => {
    // Simulasi penyimpanan ke localStorage
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const alreadyExists = wishlist.some((item) => item.id === product.id);
    if (!alreadyExists) {
      const updatedWishlist = [...wishlist, product];
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      alert("Produk berhasil ditambahkan ke wishlist!");
    } else {
      alert("Produk sudah ada di wishlist!");
    }
  };

  const navigate = useNavigate();

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "barang"));
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          status_stok: doc.data().stok > 0 ? "Stok Tersedia" : "Stok Kosong",
        }));
        setproductsData(
          fetchedProducts.map((p) => ({
            ...p,
            jumlah: p.jumlah || 1,
          }))
        );
      } catch (error) {
        console.error("Gagal mengambil data barang:", error);
      }
    };

    fetchProducts();
  }, []);

  const tambahJumlah = () => {
    setPreviewProduct((prev) =>
      prev && prev.jumlah < prev.stok
        ? { ...prev, jumlah: prev.jumlah + 1 }
        : prev
    );
  };

  const kurangJumlah = () => {
    setPreviewProduct((prev) =>
      prev && prev.jumlah > 1 ? { ...prev, jumlah: prev.jumlah - 1 } : prev
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar1
        cartItems={cartItems}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#753799] to-[#100428] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Temukan Produk Terbaik untuk Anda
              </h1>
              <p className="text-purple-200 mb-6">
                Dapatkan penawaran spesial dan diskon menarik untuk berbagai
                produk pilihan kami.
              </p>
              <button className="bg-white text-[#753799] px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Jelajahi Sekarang
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
            <button
              className={`cursor-pointer px-4 py-2 rounded-full whitespace-nowrap ${
                filterCategory === "all"
                  ? "bg-[#753799] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setFilterCategory("all")}
            >
              Semua Kategori
            </button>
            <button
              className={`cursor-pointer px-4 py-2 rounded-full whitespace-nowrap ${
                filterCategory === "Elektronik"
                  ? "bg-[#753799] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setFilterCategory("Elektronik")}
            >
              Elektronik
            </button>
            <button
              className={`cursor-pointer px-4 py-2 rounded-full whitespace-nowrap ${
                filterCategory === "Fashion"
                  ? "bg-[#753799] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setFilterCategory("Fashion")}
            >
              Fashion
            </button>
            <button
              className={`cursor-pointer px-4 py-2 rounded-full whitespace-nowrap ${
                filterCategory === "Rumah Tangga"
                  ? "bg-[#753799] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setFilterCategory("Rumah Tangga")}
            >
              Rumah Tangga
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-10">
        <h2 className="text-[#753799] text-2xl font-bold mb-6">
          Rekomendasi untukmu
        </h2>
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden "
              >
                <div
                  onClick={() => setPreviewProduct(product)}
                  className="cursor-pointer"
                >
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        {getProductIcon(product.icon)}
                      </div>

                      <div className="p-4">
                        <div className="flex items-center mb-1">
                          <span className="text-xs text-gray-500">
                            {product.kategori}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 h-12">
                          {product.nama_barang}
                        </h3>
                        {/* <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="ml-1 text-sm font-medium">
                              {product.rating}
                            </span>
                          </div>
                          <span className="mx-1 text-gray-300">|</span>
                          <span className="text-xs text-gray-500">
                            {product.reviewCount} ulasan
                          </span>
                        </div> */}
                        <span className="text-[#753799] font-bold text-base block mb-2">
                          Rp{product.harga.toLocaleString()}
                        </span>
                        <p
                          className={`flex items-center gap-1 text-xs ${
                            product.status_stok === "Stok Tersedia"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {product.status_stok === "Stok Tersedia" ? (
                            <CheckCircle size={14} />
                          ) : (
                            <AlertCircle size={14} />
                          )}
                          {product.status_stok}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Produk tidak ditemukan.</p>
            <p className="text-gray-400 mt-2">
              Coba ubah kata kunci pencarian atau filter kategori.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 mx-1 rounded-md flex items-center ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#753799] hover:bg-purple-50 border border-[#753799]"
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </button>
            {getPaginationButtons().map((page) => (
              <button
                key={page}
                onClick={() => handlePageSelect(page)}
                className={`px-4 py-2 mx-1 rounded-md ${
                  currentPage === page
                    ? "bg-[#753799] text-white"
                    : "bg-white text-[#753799] hover:bg-purple-50 border border-[#753799]"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 mx-1 rounded-md flex items-center ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-[#753799] hover:bg-purple-50 border border-[#753799]"
              }`}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {/* Modal Preview Produk */}
        {previewProduct && (
          <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-3xl p-6 relative flex flex-col md:flex-row gap-6">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-100"
                onClick={handleCloseModal}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="w-full md:w-1/2 bg-gray-100 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getProductIconpreview(previewProduct.icon)}
                </div>
              </div>

              <div className="flex flex-col justify-between w-full md:w-1/2">
                <div>
                  <span className="text-sm text-[#753799] font-medium">
                    {previewProduct.category}
                  </span>
                  <h3 className="text-xl font-bold mb-2">
                    {previewProduct.nama_barang}
                  </h3>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm font-medium">
                        {previewProduct.rating}
                      </span>
                    </div>
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="text-xs text-gray-500">
                      {previewProduct.reviewCount} ulasan
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    {previewProduct.deskripsi}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => addToWishlist(previewProduct)}
                    className="mb-4 inline-flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2 rounded-md transition"
                  >
                    <Heart className="h-4 w-4" />
                    Tambahkan ke Wishlist
                  </button>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#753799] font-bold text-2xl">
                      Rp{previewProduct.harga.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-500 mr-1">Kuantitas</p>
                    <div className="flex items-center justify-around w-22 gap-2 border-purple-700 border-1 rounded-2xl p-1">
                      <button
                        onClick={kurangJumlah}
                        className="text-black w-6 h-6 rounded cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-black">
                        {previewProduct.jumlah}
                      </span>
                      <button
                        onClick={tambahJumlah}
                        className="text-black w-6 h-6 rounded cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-gray-500 mr-1">
                      tersisa {previewProduct.stok} buah
                    </p>
                  </div>
                  {previewProduct.stok > 0 ? (
                    <button
                      onClick={() => {
                        handleAddToCart(previewProduct);
                        handleCloseModal();
                      }}
                      className="w-full py-3 bg-[#753799] text-white rounded-lg hover:bg-[#5d2c7a] transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" /> Tambah ke
                      Keranjang
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center"
                    >
                      Stok Habis
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">MyShop</h3>
              <p className="text-gray-400 text-sm">
                Temukan berbagai produk berkualitas dengan harga terbaik.
                Belanja mudah, aman, dan nyaman.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Layanan Pelanggan</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Bantuan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cara Berbelanja
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pengiriman
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pengembalian
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Hubungi Kami</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: cs@myshop.com</li>
                <li>Telepon: 0800-123-4567</li>
                <li>Jam Operasional: 08.00 - 20.00 WIB</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>© 2025 MyShop. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
