import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  HeartIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import LogoIcon from "../assets/homepage/logo.svg"; // pastikan file ini ada

export default function Navbar1({cartItems = []}) {
  const totalItems = cartItems.length;
  console.log("Total items in cart:", totalItems);
  // console.table(cartItems);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
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
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-2">
            <img src={LogoIcon} alt="Logo" className="h-10 w-10 object-cover" />
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
        <div className="flex items-center space-x-4">
          <button onClick={wishlist} className="relative cursor-pointer md:block">
            <HeartIcon className="h-6 w-6" />
          </button>

          <button onClick={handleToCart} className="relative cursor-pointer md:block">
            <ShoppingCartIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button onClick={profile} className="hidden md:block cursor-pointer">
            <UserIcon className="h-6 w-6" />
          </button>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </div>
    </header>
  );
}
