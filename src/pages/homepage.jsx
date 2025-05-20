import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Bg from "../assets/homepage/background.svg";
import WishlistIcon from "../assets/homepage/wishlistpop.svg";

const products = [
  // ... (produk tetap seperti sebelumnya)
  {
    id: 1,
    name: "Produk Sepatu",
    description: "Deskripsi singkat produk sepatu",
    price: 100000,
    category: "Popular",
  },
  {
    id: 2,
    name: "Produk Kaos",
    description: "Deskripsi singkat produk kaos",
    price: 200000,
    category: "Top Seller",
  },
  {
    id: 3,
    name: "Produk Topi",
    description: "Deskripsi singkat produk topi",
    price: 150000,
    category: "Popular",
  },
  {
    id: 4,
    name: "Produk Laptop",
    description: "Deskripsi singkat produk laptop",
    price: 5000000,
    category: "Electronic",
  },
  {
    id: 5,
    name: "Produk Jaket",
    description: "Deskripsi singkat produk jaket",
    price: 350000,
    category: "Fashion",
  },
  {
    id: 6,
    name: "Produk Tas",
    description: "Deskripsi singkat produk tas",
    price: 800000,
    category: "Fashion",
  },
  {
    id: 7,
    name: "Produk Sepatu Olahraga",
    description: "Deskripsi singkat produk sepatu olahraga",
    price: 1200000,
    category: "Popular",
  },
  {
    id: 8,
    name: "Produk Kamera",
    description: "Deskripsi singkat produk kamera",
    price: 7000000,
    category: "Electronic",
  },
  {
    id: 9,
    name: "Produk Jam Tangan",
    description: "Deskripsi singkat produk jam tangan",
    price: 500000,
    category: "Fashion",
  },
  {
    id: 10,
    name: "Produk Kacamata",
    description: "Deskripsi singkat produk kacamata",
    price: 250000,
    category: "Fashion",
  },
  {
    id: 11,
    name: "Produk Smartphone",
    description: "Deskripsi singkat produk smartphone",
    price: 3000000,
    category: "Electronic",
  },
  {
    id: 12,
    name: "Produk Sepatu Boots",
    description: "Deskripsi singkat produk sepatu boots",
    price: 1000000,
    category: "Popular",
  },
];

const PRODUCTS_PER_PAGE = 8;

const Homepage = () => {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewProduct, setPreviewProduct] = useState(null);

  const handleCloseModal = () => setPreviewProduct(null);
  const navigate = useNavigate();

  const handleSearch = () => setSearch(query);

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      return exists
        ? prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleSignInClick = () => navigate("/login");

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "All" || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

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

  const handlePageSelect = (page) => setCurrentPage(page);

  const getPaginationButtons = () => {
    let startPage = currentPage - 1 <= 0 ? 1 : currentPage - 1;
    let endPage = currentPage + 1 >= totalPages ? totalPages : currentPage + 1;

    if (totalPages > 3) {
      if (currentPage === 1) endPage = 3;
      else if (currentPage === totalPages) startPage = totalPages - 2;
    }

    return [...Array(endPage - startPage + 1)].map((_, i) => startPage + i);
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

        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-12">
          <h2 className="text-white text-2xl font-bold mb-6">
            Rekomendasi untukmu
          </h2>
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-2 rounded-sm shadow hover:shadow-lg transition mb-6 mx-10"
                >
                  <div
                    onClick={() => setPreviewProduct(product)}
                    className="cursor-pointer"
                  >
                    <img
                      src={`https://via.placeholder.com/300x200?text=${encodeURIComponent(
                        product.name
                      )}`}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="text-sm font-semibold">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {product.description}
                    </p>
                    <span className="text-green-600 font-bold text-base block mb-2">
                      Rp{product.price.toLocaleString()}
                    </span>
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

          {/* Modal Preview Produk */}
          {previewProduct && (
            <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-3xl p-6 relative flex flex-col md:flex-row gap-6">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-black cursor-pointer"
                  onClick={handleCloseModal}
                >
                  ✕
                </button>

                <img
                  src={`https://via.placeholder.com/400x250?text=${encodeURIComponent(
                    previewProduct.name
                  )}`}
                  alt={previewProduct.name}
                  className="w-full md:w-1/2 h-90 object-cover rounded-lg"
                />

                <div className="flex flex-col justify-between w-full md:w-1/2">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {previewProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {previewProduct.description}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        const wishlist =
                          JSON.parse(localStorage.getItem("wishlist")) || [];
                        const alreadyExists = wishlist.some(
                          (item) => item.id === previewProduct.id
                        );
                        if (!alreadyExists) {
                          const updatedWishlist = [...wishlist, previewProduct];
                          localStorage.setItem(
                            "wishlist",
                            JSON.stringify(updatedWishlist)
                          );
                        }
                        navigate("/wishlist");
                      }}
                      className="mb-4 inline-flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-700 px-3 py-1 rounded-md transition"
                    >
                      <img src={WishlistIcon} alt="Wishlist" className="w-5" />
                      Tambahkan ke Wishlist
                    </button>

                    <p className="text-green-600 font-bold text-lg mb-4">
                      Rp{previewProduct.price.toLocaleString()}
                    </p>
                    <button
                      onClick={() => {
                        handleAddToCart(previewProduct);
                        handleCloseModal();
                      }}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Tambah ke Keranjang
                    </button>
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
