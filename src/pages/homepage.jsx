import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Bg from "../assets/homepage/background.svg";
import WishlistIcon from "../assets/homepage/wishlistpop.svg";
import { firestore } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

// const products = [
//   { id: 1, name: "Produk Sepatu", description: "Deskripsi singkat produk sepatu", price: 100000, category: "Popular" },
//   { id: 2, name: "Produk Kaos", description: "Deskripsi singkat produk kaos", price: 200000, category: "Top Seller" },
//   { id: 3, name: "Produk Topi", description: "Deskripsi singkat produk topi", price: 150000, category: "Popular" },
//   { id: 4, name: "Produk Laptop", description: "Deskripsi singkat produk laptop", price: 5000000, category: "Electronic" },
//   { id: 5, name: "Produk Jaket", description: "Deskripsi singkat produk jaket", price: 350000, category: "Fashion" },
//   { id: 6, name: "Produk Tas", description: "Deskripsi singkat produk tas", price: 800000, category: "Fashion" },
//   { id: 7, name: "Produk Sepatu Olahraga", description: "Deskripsi singkat produk sepatu olahraga", price: 1200000, category: "Popular" },
//   { id: 8, name: "Produk Kamera", description: "Deskripsi singkat produk kamera", price: 7000000, category: "Electronic" },
//   { id: 9, name: "Produk Jam Tangan", description: "Deskripsi singkat produk jam tangan", price: 500000, category: "Fashion" },
//   { id: 10, name: "Produk Kacamata", description: "Deskripsi singkat produk kacamata", price: 250000, category: "Fashion" },
//   { id: 11, name: "Produk Smartphone", description: "Deskripsi singkat produk smartphone", price: 3000000, category: "Electronic" },
//   { id: 12, name: "Produk Sepatu Boots", description: "Deskripsi singkat produk sepatu boots", price: 1000000, category: "Popular" },
// ];

const PRODUCTS_PER_PAGE = 8; // Menampilkan 8 produk per halaman

const Homepage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "barang"));
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          status_stok: doc.data().stok > 0 ? "Stok Tersedia" : "Stok Kosong",
        }));
        setProducts(fetchedProducts.map((p) => ({
          ...p,
          jumlah: p.jumlah || 1 
        })));
      } catch (error) {
        console.error("Gagal mengambil data barang:", error);
      }
    };

    fetchProducts();
  }, []);

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewProduct, setPreviewProduct] = useState(null); // Produk yang dipreview
  const handleCloseModal = () => setPreviewProduct(null); // Tutup popup

  const navigate = useNavigate();

  const handleSearch = () => setSearch(query);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const uid = storedUser?.id;

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

  const handleAddToCart = async (product) => {
  if (!uid) {
    alert("Silakan login terlebih dahulu.");
    navigate("/login");
    return;
  }

  try {
    // 1. Update Firestore ke dalam koleksi carts/{uid}/items/{productId}
    const cartItemRef = doc(firestore, "carts", uid, "items", product.id);
    await setDoc(cartItemRef, {
      qty: product.jumlah, // jumlah dari state
      productId: product.id,
    });

    // 2. Update local state (opsional)
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      return exists
        ? prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: product.jumlah }
              : item
          )
        : [...prev, { ...product, quantity: product.jumlah }];
    });

    alert("Berhasil menambahkan ke keranjang!");
  } catch (err) {
    console.error("Gagal menambah ke cart di Firestore:", err);
    alert("Terjadi kesalahan saat menambah ke keranjang.");
  }

  await addToCartFirestore(product.id);
};


  const handleSignInClick = () => navigate("/login");

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "All" || product.kategori === selectedCategory) &&
      product.nama_barang.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageSelect = (page) => {
    setCurrentPage(page);
  };

  const getPaginationButtons = () => {
    let startPage = currentPage - 1 <= 0 ? 1 : currentPage - 1;
    let endPage = currentPage + 1 >= totalPages ? totalPages : currentPage + 1;

    if (totalPages > 3) {
      if (currentPage === 1) {
        endPage = 3;
      } else if (currentPage === totalPages) {
        startPage = totalPages - 2;
      }
    }

    return [...Array(endPage - startPage + 1)].map((_, i) => startPage + i);
  };

  const tambahJumlah = () => {
    setPreviewProduct((prev) =>
      prev && prev.jumlah < prev.stok
        ? { ...prev, jumlah: prev.jumlah + 1 }
        : prev
    );
  };

  const kurangJumlah = () => {
    setPreviewProduct((prev) =>
      prev && prev.jumlah > 1
        ? { ...prev, jumlah: prev.jumlah - 1 }
        : prev
    );
  };


  
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${Bg})` }}
    >
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className="relative z-10">
        <Navbar
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          cartCount={cart.length}
          setShowCart={setShowCart}
          showCart={showCart}
          handleSignInClick={handleSignInClick}
        />

        <div className="max-w-7xl mx-auto py-12 px-4 md:px-10">
          <h2 className="text-white text-2xl font-bold mb-6">
            Rekomendasi untukmu
          </h2>
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-2 rounded-xl shadow hover:shadow-lg transition mb-20 mx-10"
                >
                  <div
                    onClick={() => setPreviewProduct(product)}
                    className="cursor-pointer"
                  >
                    <img
                      src={`https://placehold.co/300x200?text=${encodeURIComponent(
                        product.nama_barang || "Product"
                      )}`}
                      alt={product.nama_barang}
                      className="w-full h-32 object-cover rounded-t-lg mb-2"
                    />
                    <h3 className="text-sm font-semibold">
                      {product.nama_barang}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {product.deskripsi}
                    </p>
                    <span className="text-green-600 font-bold text-base block mb-2">
                      Rp{product.harga.toLocaleString()}
                    </span>
                    <p className="flex text-xs text-gray-500 justify-end mr-1">
                      {product.status_stok}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">
              Produk tidak ditemukan.
            </p>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-1 bg-white text-black rounded-md hover:bg-gray-200"
            >
              Prev
            </button>
            {/* Tombol Halaman */}
            {getPaginationButtons().map((page) => (
              <button
                key={page}
                onClick={() => handlePageSelect(page)}
                className={`px-4 py-2 mx-1 ${
                  currentPage === page
                    ? "bg-white text-black"
                    : "bg-white text-black"
                } rounded-md hover:bg-gray-200`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 mx-1 bg-white text-black rounded-md hover:bg-gray-200"
            >
              Next
            </button>
          </div>
          {previewProduct && (
            <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-3xl p-6 relative flex flex-col md:flex-row gap-6">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-black cursor-pointer"
                  onClick={handleCloseModal}
                >
                  ✕
                </button>

                {/* Gambar di kiri */}
                <img
                  src={`https://placehold.co/400x250?text=${encodeURIComponent(
                    previewProduct.nama_barang
                  )}`}
                  alt={previewProduct.nama_barang}
                  className="w-full md:w-1/2 h-90 object-cover rounded-lg"
                />

                {/* Konten di kanan */}
                <div className="flex flex-col justify-between w-full md:w-1/2">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {previewProduct.nama_barang}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {previewProduct.deskripsi}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => navigate("/wishlist")}
                      className="mb-4 inline-flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-3 py-1 rounded-md transition cursor-pointer"
                    >
                      <img src={WishlistIcon} alt="Wishlist" className="w-5" />
                      Tambahkan ke Wishlist
                    </button>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-green-600 font-bold text-lg">
                        Rp{previewProduct.harga.toLocaleString()}
                      </p>
                      <div className="flex items-center justify-around w-22 gap-2 border-purple-700 border-1 rounded-2xl p-1">
                          <button
                            onClick={kurangJumlah}
                            className="text-black w-6 h-6 rounded cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-black">{previewProduct.jumlah}</span>
                          <button
                            onClick={tambahJumlah}
                            className="text-black w-6 h-6 rounded cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      <p className="text-xs text-gray-500 mr-1">
                        Jumlah Stok: {previewProduct.stok}
                      </p>
                    </div>
                    {previewProduct.stok > 0 ? (
                      <button
                        onClick={() => {
                          handleAddToCart(previewProduct);
                          handleCloseModal();
                        }}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        Tambah ke Keranjang
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
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

        <Footer />
      </div>
    </div>
  );
};

export default Homepage;
