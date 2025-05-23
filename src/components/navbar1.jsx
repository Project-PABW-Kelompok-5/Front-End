import { useState } from "react";
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
} from "@heroicons/react/24/outline";
import LogoIcon from "../assets/homepage/logo.svg";

export default function Navbar1({
  cartItems = [],

  searchQuery,
  setSearchQuery,
}) {
  const totalItems = cartItems.length;

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header className="bg-gradient-to-r from-[#753799] to-[#4a1d6a] text-white shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-10 py-4">
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
                <span className="text-xl font-semibold">Blesing</span>
                <span className="text-xl font-semibold">Store</span>
              </div>
            </a>
          </div>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
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

          {/* Icons */}
          <div className="flex items-center gap-10">
            <button
              onClick={wishlist}
              className="relative cursor-pointer md:block"
            >
              <HeartIcon className="h-8 w-8" />
            </button>

            <button
              onClick={handleToCart}
              className="relative cursor-pointer md:block"
            >
              <ShoppingCartIcon className="h-8 w-8" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <div className="relative group hidden md:block cursor-pointer">
              <button className="cursor-pointer" onClick={profile}>
                <UserIcon className="h-8 w-8" />
              </button>

              {/* Dropdown menu */}
              <div className="absolute -right-2 w-45 mt-1 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transform scale-50 group-hover:scale-100 transition-all duration-150 ease-out z-50 origin-top-right">
                <div className="absolute -top-2 right-[14px] w-5 h-5 bg-white transform rotate-45 z-[-1]" />
                <ul className="py-1 font-semibold">
                  <li
                    onClick={profile}
                    className="px-4 py-2 hover:bg-gray-100 hover:text-[#753799] cursor-pointer"
                  >
                    Profil
                  </li>
                  <li
                    onClick={() => navigate("/history")}
                    className="px-4 py-2 hover:bg-gray-100 hover:text-[#753799] cursor-pointer"
                  >
                    Pesanan Saya
                  </li>
                  <li
                    onClick={handleLogout}
                    className="px-4 py-2 hover:bg-gray-100 hover:text-red-600 cursor-pointer"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
              {mobileMenuOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-20 md:hidden">
                  <div className="bg-white h-full w-3/4 max-w-xs p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Menu</h2>
                      <button onClick={() => setMobileMenuOpen(false)}>
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="mb-4">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Cari produk..."
                          className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] text-sm"
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
                        <HomeIcon className="h-5 w-5 text-[#753799]" />
                        <span>Beranda</span>
                      </a>
                      <a
                        href="/profile"
                        className="flex items-center space-x-2 p-2 hover:bg-purple-50 text-[#753799] rounded-md"
                      >
                        <UserIcon className="h-5 w-5 text-[#753799]" />
                        <span>Profil</span>
                      </a>
                      <a
                        href="/history"
                        className="flex items-center space-x-2 p-2 hover:bg-purple-50 text-[#753799] rounded-md"
                      >
                        <ShoppingCartIcon className="h-5 w-5 text-[#753799]" />
                        <span>Keranjang Belanja</span>
                      </a>
                      <a
                        href="/wishlist"
                        className="flex items-center space-x-2 p-2 hover:bg-purple-50 text-[#753799] rounded-md"
                      >
                        <HeartIcon className="h-5 w-5 text-[#753799]" />
                        <span>Wishlist</span>
                      </a>
                      <hr className="border-gray-200" />
                      <button
                        className="flex items-center space-x-2 p-2 text-red-600 hover:bg-red-50 rounded-md"
                        onClick={handleLogout}
                      >
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                        <span>Keluar</span>
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
