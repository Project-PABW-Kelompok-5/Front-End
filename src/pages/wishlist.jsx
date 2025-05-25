"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Search,
  ShoppingCart,
  Trash2,
  Filter,
  Star,
  AlertCircle,
  CheckCircle,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  Package,
  Laptop,
  Headphones,
  Watch,
  Smartphone,
  Camera,
  Home,
  ShoppingBag,
  User,
  LogOut,
  X,
  Menu,
} from "lucide-react";

import LogoIcon from "../assets/homepage/logo.svg";

// Data dummy untuk wishlist
const wishlistData = [
  {
    id: "PROD-001",
    name: "Smartphone Galaxy S23 Ultra",
    price: "Rp 18.999.000",
    originalPrice: "Rp 21.999.000",
    discount: "14%",
    icon: "smartphone",
    rating: 4.8,
    reviewCount: 1243,
    isAvailable: true,
    isFavorite: true,
    category: "Elektronik",
    addedDate: "15 Mei 2025",
    description:
      "Smartphone flagship dengan kamera 108MP dan S Pen terintegrasi.",
  },
  {
    id: "PROD-002",
    name: "Laptop MacBook Pro M2 14 inch",
    price: "Rp 24.999.000",
    originalPrice: "Rp 26.999.000",
    discount: "7%",
    icon: "laptop",
    rating: 4.9,
    reviewCount: 856,
    isAvailable: true,
    isFavorite: true,
    category: "Elektronik",
    addedDate: "10 Mei 2025",
    description:
      "Laptop dengan chip M2, layar Retina XDR, dan baterai tahan hingga 17 jam.",
  },
  {
    id: "PROD-003",
    name: "Headphone Sony WH-1000XM5",
    price: "Rp 4.999.000",
    originalPrice: "Rp 5.499.000",
    discount: "9%",
    icon: "headphones",
    rating: 4.7,
    reviewCount: 1102,
    isAvailable: true,
    isFavorite: true,
    category: "Elektronik",
    addedDate: "5 Mei 2025",
    description:
      "Headphone nirkabel dengan noise cancelling terbaik di kelasnya.",
  },
  {
    id: "PROD-004",
    name: "Sepatu Nike Air Jordan",
    price: "Rp 2.499.000",
    originalPrice: "Rp 2.999.000",
    discount: "17%",
    icon: "package",
    rating: 4.6,
    reviewCount: 789,
    isAvailable: false,
    isFavorite: true,
    category: "Fashion",
    addedDate: "1 Mei 2025",
    description:
      "Sepatu basket ikonik dengan desain yang legendaris dan kenyamanan maksimal.",
  },
  {
    id: "PROD-005",
    name: "Kamera Mirrorless Sony A7 IV",
    price: "Rp 32.999.000",
    originalPrice: "Rp 34.999.000",
    discount: "6%",
    icon: "camera",
    rating: 4.9,
    reviewCount: 432,
    isAvailable: true,
    isFavorite: true,
    category: "Elektronik",
    addedDate: "28 April 2025",
    description:
      "Kamera mirrorless full-frame dengan sensor 33MP dan kemampuan video 4K 60fps.",
  },
  {
    id: "PROD-006",
    name: "Jam Tangan Seiko Presage",
    price: "Rp 8.499.000",
    originalPrice: "Rp 9.999.000",
    discount: "15%",
    icon: "watch",
    rating: 4.7,
    reviewCount: 321,
    isAvailable: true,
    isFavorite: true,
    category: "Fashion",
    addedDate: "25 April 2025",
    description:
      "Jam tangan mekanikal dengan desain elegan dan gerakan otomatis presisi tinggi.",
  },
];

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(wishlistData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter dan sort wishlist
  const filteredWishlist = wishlist
    .filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return (
          Number.parseInt(a.price.replace(/\D/g, "")) -
          Number.parseInt(b.price.replace(/\D/g, ""))
        );
      } else if (sortBy === "price-high") {
        return (
          Number.parseInt(b.price.replace(/\D/g, "")) -
          Number.parseInt(a.price.replace(/\D/g, ""))
        );
      } else if (sortBy === "rating") {
        return b.rating - a.rating;
      } else {
        // Default: sort by date (newest first)
        return (
          new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
        );
      }
    });

  const removeFromWishlist = (productId) => {
    setWishlist(wishlist.filter((item) => item.id !== productId));
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
      default:
        return <Package className="h-8 w-8 text-[#753799]" />;
    }
  };

  // Animasi untuk kartu wishlist
  useEffect(() => {
    const cards = document.querySelectorAll(".wishlist-card");
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("opacity-100", "translate-y-0");
      }, index * 100);
    });
  }, [filteredWishlist]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#753799] to-[#4a1d6a] text-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="md:hidden"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <a href="/" className="flex items-center space-x-2">
                <img src={LogoIcon} alt="Logo" className="h-auto w-auto" />
                <div className="flex flex-col ml-2">
                  <span className="text-xl font-semibold">Blesing</span>
                  <span className="text-xl font-semibold flex">Store</span>
                </div>
              </a>
            </div>

            <h1 className="text-xl font-bold flex items-center">
              <Heart className="h-5 w-5 mr-2" /> Wishlist Saya
            </h1>

            <div className="flex items-center space-x-4">
              <button className="relative">
                <ShoppingBag className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="hidden md:block">
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
            <nav className="flex flex-col space-y-4">
              <a
                href="/"
                className="flex items-center space-x-2 p-2 hover:bg-purple-50 rounded-md"
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
                className="flex items-center space-x-2 p-2 bg-purple-50 text-[#753799] rounded-md"
              >
                <Heart className="h-5 w-5 text-[#753799]" />
                <span>Wishlist</span>
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

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-6">
          <a href="/" className="text-gray-500 hover:text-[#753799]">
            Beranda
          </a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-[#753799] font-medium">Wishlist</span>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Wishlist Saya</h2>
              <span className="text-sm bg-[#753799] bg-opacity-10 text-[#dcd7df] px-3 py-1 rounded-full font-medium">
                6 Barang
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Cari barang di wishlist..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#753799]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <select
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#753799] bg-white"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Rumah Tangga">Rumah Tangga</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                </div>

                <div className="relative">
                  <button
                    className="w-full sm:w-auto flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                    onClick={() => setShowSortOptions(!showSortOptions)}
                  >
                    <span className="flex items-center">
                      <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {sortBy === "date"
                          ? "Terbaru"
                          : sortBy === "price-low"
                          ? "Harga Terendah"
                          : sortBy === "price-high"
                          ? "Harga Tertinggi"
                          : "Rating Tertinggi"}
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
                  </button>

                  {showSortOptions && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <ul className="py-1">
                        <li>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                              sortBy === "date"
                                ? "bg-purple-50 text-[#753799]"
                                : "text-gray-700"
                            }`}
                            onClick={() => {
                              setSortBy("date");
                              setShowSortOptions(false);
                            }}
                          >
                            Terbaru
                          </button>
                        </li>
                        <li>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                              sortBy === "price-low"
                                ? "bg-purple-50 text-[#753799]"
                                : "text-gray-700"
                            }`}
                            onClick={() => {
                              setSortBy("price-low");
                              setShowSortOptions(false);
                            }}
                          >
                            Harga Terendah
                          </button>
                        </li>
                        <li>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                              sortBy === "price-high"
                                ? "bg-purple-50 text-[#753799]"
                                : "text-gray-700"
                            }`}
                            onClick={() => {
                              setSortBy("price-high");
                              setShowSortOptions(false);
                            }}
                          >
                            Harga Tertinggi
                          </button>
                        </li>
                        <li>
                          <button
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 ${
                              sortBy === "rating"
                                ? "bg-purple-50 text-[#753799]"
                                : "text-gray-700"
                            }`}
                            onClick={() => {
                              setSortBy("rating");
                              setShowSortOptions(false);
                            }}
                          >
                            Rating Tertinggi
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {filteredWishlist.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto text-[#753799] opacity-30 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Wishlist Anda kosong
                </h3>
                <p className="text-gray-500 mb-6">
                  Tambahkan barang yang Anda sukai ke wishlist untuk melihatnya
                  di sini.
                </p>
                <button className="px-4 py-2 bg-[#753799] text-white rounded-md hover:bg-[#5d2c7a] transition-colors">
                  Jelajahi Produk
                </button>
              </div>
            ) : (
              <div className="grid cursor-pointer grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWishlist.map((product) => (
                  <div
                    key={product.id}
                    className={`wishlist-card bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 opacity-0 translate-y-4 ${
                      selectedProduct === product.id
                        ? "ring-2 ring-[#753799]"
                        : ""
                    }`}
                    style={{
                      transitionProperty: "transform, opacity, box-shadow",
                    }}
                    onClick={() =>
                      setSelectedProduct(
                        product.id === selectedProduct ? null : product.id
                      )
                    }
                  >
                    <div className="p-4">
                      <div className="flex items-start">
                        <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          {getProductIcon(product.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="text-xs text-gray-500">
                              {product.category}
                            </span>
                            <span className="mx-1 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              Ditambahkan {product.addedDate}
                            </span>
                          </div>

                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
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

                          <div className="mb-3">
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-[#753799]">
                                {product.price}
                              </span>
                              {product.originalPrice && (
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                  {product.originalPrice}
                                </span>
                              )}
                              {product.discount && (
                                <span className="ml-2 text-xs text-red-600 font-medium">
                                  -{product.discount}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            {product.isAvailable ? (
                              <span className="text-xs text-green-600 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" /> Stok
                                Tersedia
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> Stok
                                Habis
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {selectedProduct === product.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 animate-fadeIn">
                          <p className="text-sm text-gray-600 mb-3">
                            {product.description}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex space-x-2">
                        <button
                          className={`flex-1 py-2 rounded-md text-sm font-medium flex items-center justify-center ${
                            product.isAvailable
                              ? "bg-[#753799] text-white hover:bg-[#5d2c7a]"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={!product.isAvailable}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Masukkan Keranjang
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(product.id);
                          }}
                          className="p-2 border border-gray-300 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Blazing Store</h3>
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
                <li>Email: Blazingstore@gmail.com</li>
                <li>Telepon: 0800-123-4567</li>
                <li>Jam Operasional: 08.00 - 20.00 WIB</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
            <p>© 2025 BlazingStore. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
