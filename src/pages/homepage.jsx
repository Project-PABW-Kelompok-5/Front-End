"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  Home,
  ShoppingBag,
  User,
  Menu,
  X,
  Bell,
  LogOut,
  Laptop,
  Headphones,
  Watch,
  Smartphone,
  Camera,
  Tablet,
  Cable,
} from "lucide-react";

import LogoIcon from "../assets/homepage/logo.svg";

// Data dummy untuk produk
const productsData = [
  {
    id: 1,
    name: "Smartphone Galaxy S23 Ultra",
    description:
      "Smartphone flagship dengan kamera 108MP dan S Pen terintegrasi.",
    price: 18999000,
    category: "Elektronik",
    rating: 4.8,
    reviewCount: 1243,
    icon: "smartphone",
  },
  {
    id: 2,
    name: "Laptop MacBook Pro M2",
    description:
      "Laptop dengan chip M2, layar Retina XDR, dan baterai tahan hingga 17 jam.",
    price: 24999000,
    category: "Elektronik",
    rating: 4.9,
    reviewCount: 856,
    icon: "laptop",
  },
  {
    id: 3,
    name: "Headphone Sony WH-1000XM5",
    description:
      "Headphone nirkabel dengan noise cancelling terbaik di kelasnya.",
    price: 4999000,
    category: "Elektronik",
    rating: 4.7,
    reviewCount: 1102,
    icon: "headphones",
  },
  {
    id: 4,
    name: "Kamera Mirrorless Sony A7 IV",
    description:
      "Kamera mirrorless full-frame dengan sensor 33MP dan kemampuan video 4K 60fps.",
    price: 32999000,
    category: "Elektronik",
    rating: 4.9,
    reviewCount: 432,
    icon: "camera",
  },
  {
    id: 5,
    name: "Jam Tangan Seiko Presage",
    description:
      "Jam tangan mekanikal dengan desain elegan dan gerakan otomatis presisi tinggi.",
    price: 8499000,
    category: "Fashion",
    rating: 4.7,
    reviewCount: 321,
    icon: "watch",
  },
  {
    id: 6,
    name: "iPad Pro 12.9 inch",
    description:
      "Tablet premium dengan layar Liquid Retina XDR dan chip M2 yang powerful.",
    price: 19999000,
    category: "Elektronik",
    rating: 4.8,
    reviewCount: 567,
    icon: "tablet",
  },
  {
    id: 7,
    name: "Blender Philips HR3868",
    description:
      "Blender dengan teknologi ProBlend untuk hasil yang halus dan cepat.",
    price: 1299000,
    category: "Rumah Tangga",
    rating: 4.5,
    reviewCount: 234,
    icon: "cable",
  },
];

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const productsPerPage = 8;
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
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

  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
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
  const profile = () => {
    navigate("/profile");
  };
  const wishlist = () => {
    navigate("/wishlist");
  };

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#753799] to-[#4a1d6a] text-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2">
                <img src={LogoIcon} alt="Logo" className="h-auto w-auto" />
                <div className="flex flex-col ml-2">
                  <span className="text-xl font-semibold">Blesing</span>
                  <span className="text-xl font-semibold flex">Store</span>
                </div>
              </a>
            </div>

            <div className="hidden md:block flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="w-full bg-[#e7deec] pl-10 pr-4 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-[#faf5fd] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={wishlist}
                className="relative cursor-pointer md:block"
              >
                <Heart className="h-6 w-6" />
              </button>
              <button className="ml-0 md:ml-6 relative cursor-pointer md:block">
                <ShoppingBag className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={profile}
                className="ml-6 hidden cursor-pointer md:block"
              >
                <User className="h-6 w-6" />
              </button>
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-20 md:hidden">
          <div className="bg-white h-full w-3/4 max-w-xs p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <nav className="flex flex-col space-y-4">
              <a
                href="/"
                className="flex items-center space-x-2 p-2 bg-purple-50 text-[#753799] rounded-md"
              >
                <Home className="h-5 w-5 text-[#753799]" />
                <span>Beranda</span>
              </a>
              <a
                href="/profile"
                className="flex items-center space-x-2 p-2 hover:bg-purple-50 rounded-md"
              >
                <User className="h-5 w-5 text-[#753799]" />
                <span>Profil</span>
              </a>
              <a
                href="/orders"
                className="flex items-center space-x-2 p-2 hover:bg-purple-50 rounded-md"
              >
                <ShoppingBag className="h-5 w-5 text-[#753799]" />
                <span>Pesanan</span>
              </a>
              <a
                href="/wishlist"
                className="flex items-center space-x-2 p-2 hover:bg-purple-50 rounded-md"
              >
                <Heart className="h-5 w-5 text-[#753799]" />
                <span>Wishlist</span>
              </a>
              <a
                href="/notifications"
                className="flex items-center space-x-2 p-2 hover:bg-purple-50 rounded-md"
              >
                <Bell className="h-5 w-5 text-[#753799]" />
                <span>Notifikasi</span>
              </a>
              <hr className="border-gray-200" />
              <button className="flex items-center space-x-2 p-2 text-red-600 hover:bg-red-50 rounded-md">
                <LogOut className="h-5 w-5" />
                <span>Keluar</span>
              </button>
            </nav>
          </div>
        </div>
      )}

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
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 h-12">
                          {product.name}
                        </h3>
                        <div className="flex items-center mb-2">
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
                        </div>
                        <span className="text-[#753799] font-bold text-base block">
                          Rp{product.price.toLocaleString()}
                        </span>
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
                    {previewProduct.name}
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
                    {previewProduct.description}
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

                  <p className="text-[#753799] font-bold text-2xl mb-4">
                    Rp{previewProduct.price.toLocaleString()}
                  </p>
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
