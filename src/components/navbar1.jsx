import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  ArrowRightStartOnRectangleIcon,
  BanknotesIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import LogoIcon from "../assets/homepage/logo putih.png";

export default function Navbar1({
  cartItems = [],

  searchQuery,
  setSearchQuery,
}) {
  const totalItems = cartItems.length;

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saldo, setSaldo] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const wishlist = () => {
    navigate("/wishlist");
  };

  const handleToCart = () => {
    navigate("/cart");
  };

  const profile = () => {
    navigate("/profile");
  };

  // Fungsi untuk mengambil saldo user dari Firestore
  const getSaldo = async (uid) => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return userSnap.data().saldo || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching saldo:", error);
      return 0;
    }
  };

  // fetch saldo
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const nominal = await getSaldo(user.uid);
        setSaldo(nominal);
      }
    });

    // Bersihkan listener saat komponen dibongkar
    return () => unsubscribe();
  }, []);

  //show saldo
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <header className="bg-gradient-to-r from-[#753799] to-[#4a1d6a] text-white shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <img
                src={LogoIcon}
                alt="Logo"
                className="h-15 w-15 object-cover"
              />
              <div className="flex flex-col ml-2">
                <span className="text-xl font-semibold">Blessing</span>
                <span className="text-xl font-semibold">Store</span>
              </div>
            </a>
          </div>
          {/* Search - Hidden on mobile, shown in mobile menu */}
          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
              <input
                type="text"
                placeholder="Cari produk..."
                className="w-full bg-[#e7deec] pl-10 pr-4 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-[#faf5fd] text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6">
            {/* Balance Display - Responsive */}
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <div className="bg-white/20 p-1.5 lg:p-2 rounded-lg backdrop-blur-sm">
                <BanknotesIcon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-white/80 hidden lg:block">
                  Saldo Anda
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs lg:text-sm font-bold text-white transition-all duration-300 truncate">
                    {isVisible
                      ? "Rp ****"
                      : `Rp ${saldo.toLocaleString("id-ID")}`}
                  </span>
                </div>
              </div>

              <button
                onClick={toggleVisibility}
                className="bg-white/20 p-1 lg:p-1.5 rounded-full hover:bg-white/30 transition-colors cursor-pointer flex-shrink-0"
                aria-label={isVisible ? "Sembunyikan saldo" : "Tampilkan saldo"}
              >
                {isVisible ? (
                  <EyeSlashIcon className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                ) : (
                  <EyeIcon className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                )}
              </button>
            </div>

            {/* Wishlist */}
            <button
              onClick={wishlist}
              className="relative cursor-pointer hover:scale-110 transition-transform"
            >
              <HeartIcon className="h-6 w-6 lg:h-7 lg:w-7" />
            </button>

            {/* Cart */}
            <button
              onClick={handleToCart}
              className="relative cursor-pointer hover:scale-110 transition-transform"
            >
              <ShoppingCartIcon className="h-6 w-6 lg:h-7 lg:w-7" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center text-[10px] lg:text-xs">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative group cursor-pointer">
              <button
                className="cursor-pointer hover:scale-110 transition-transform"
                onClick={profile}
              >
                <UserIcon className="h-6 w-6 lg:h-7 lg:w-7" />
              </button>

              {/* Dropdown menu */}
              <div className="absolute -right-2 w-48 mt-1 bg-white text-black rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transform scale-95 group-hover:scale-100 transition-all duration-200 ease-out z-50 origin-top-right">
                <div className="absolute -top-2 right-[14px] w-4 h-4 bg-white transform rotate-45 z-[-1]" />
                <ul className="py-2 font-semibold">
                  <li
                    onClick={profile}
                    className="px-4 py-2 hover:bg-gray-100 hover:text-[#753799] cursor-pointer transition-colors"
                  >
                    Profil
                  </li>
                  <li
                    onClick={() => navigate("/history")}
                    className="px-4 py-2 hover:bg-gray-100 hover:text-[#753799] cursor-pointer transition-colors"
                  >
                    Pesanan Saya
                  </li>
                  <li
                    onClick={handleLogout}
                    className="px-4 py-2 hover:bg-gray-100 hover:text-red-600 cursor-pointer transition-colors"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search Bar - Below main header on small screens */}
        <div className="mt-3 lg:hidden">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full bg-[#e7deec] pl-10 pr-4 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-[#faf5fd] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-20 md:hidden">
          <div className="bg-white h-full w-4/5 max-w-sm p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Mobile Balance Display */}
            <div className="mb-6 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <BanknotesIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white/80 block">
                      Saldo Anda
                    </span>
                    <span className="text-sm font-bold text-white">
                      {isVisible
                        ? `Rp ${saldo.toLocaleString("id-ID")}`
                        : "Rp ********"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleVisibility}
                  className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                  {isVisible ? (
                    <EyeSlashIcon className="h-4 w-4 text-white" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2 flex-1">
              <a
                href="/"
                className="flex items-center space-x-3 p-3 bg-purple-50 text-[#753799] rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5" />
                <span className="font-medium">Beranda</span>
              </a>

              <button
                onClick={() => {
                  profile();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 p-3 hover:bg-purple-50 text-[#753799] rounded-lg transition-colors"
              >
                <UserIcon className="h-5 w-5" />
                <span className="font-medium">Profil</span>
              </button>

              <button
                onClick={() => {
                  handleToCart();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 p-3 hover:bg-purple-50 text-[#753799] rounded-lg transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span className="font-medium">Keranjang Belanja</span>
                {totalItems > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  wishlist();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 p-3 hover:bg-purple-50 text-[#753799] rounded-lg transition-colors"
              >
                <HeartIcon className="h-5 w-5" />
                <span className="font-medium">Wishlist</span>
              </button>

              <button
                onClick={() => {
                  navigate("/history");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 p-3 hover:bg-purple-50 text-[#753799] rounded-lg transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span className="font-medium">Pesanan Saya</span>
              </button>

              <div className="mt-auto pt-4 border-t border-gray-200">
                <button
                  className="flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                  <span className="font-medium">Keluar</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
