import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../assets/homepage/search.svg";
import SaldoIcon from "../assets/homepage/saldo.svg";
import ChartIcon from "../assets/homepage/chart.svg";
import SigninIcon from "../assets/homepage/signin.svg";
import WishlistIcon from "../assets/homepage/wishlist.svg";
import LogoIcon from "../assets/homepage/logo.svg";

const Navbar = ({
  query,
  setQuery,
  handleSearch,
  setSelectedCategory,
  cart = [],
}) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Menutup dropdown saat klik di luar menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-10">
      <div className="w-full bg-[#100429] py-3 px-15 sticky top-0 shadow-md flex items-center gap-1">
        {/* Logo */}
        <div className="w-auto flex-shrink-0 flex items-center mr-15">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-white hover:text-white"
          >
            <img src={LogoIcon} alt="Logo" className="h-auto w-auto" />
            <div className="flex flex-col ml-2">
              <span className="text-xl font-semibold">Blesing</span>
              <span className="text-xl font-semibold flex">Store</span>
            </div>
          </button>
        </div>

        <div className="flex flex-col w-full">
          <div className="flex justify-between w-full">
            {/* Search Bar */}
            <div className="flex flex-1">
              <div className="flex w-full h-12">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-l-lg text-black bg-white placeholder-black focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  onClick={handleSearch}
                  className="shrink-0 px-4 py-2 bg-[#7338A0] rounded-r-lg hover:bg-purple-500"
                >
                  <img src={SearchIcon} alt="Search" className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Icon Section */}
            <div className="ml-15 flex items-end justify-end gap-12 shrink-0 relative">
              <button onClick={() => navigate("/cart")}>
                <img src={ChartIcon} alt="Keranjang" className="w-10" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-1 bg-red-500 text-white text-xs px-2 rounded-full">
                    {cart.length}
                  </span>
                )}
              </button>

              <button onClick={() => alert("Fitur saldo belum tersedia.")}>
                <img src={SaldoIcon} alt="Saldo" className="w-8" />
              </button>

              <button onClick={() => navigate("/wishlist")}>
                <img src={WishlistIcon} alt="Wishlist" className="w-8" />
              </button>

              {/* Sign In Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex space-x-2"
                >
                  <img src={SigninIcon} alt="Sign In" className="w-8" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50">
                    <button
                      onClick={() => navigate("/profile")}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profil
                    </button>
                    <button
                      onClick={() => navigate("/myOrder")}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Pesanan Saya
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Buttons */}
          <div className="flex mt-3">
            <div className="flex gap-10">
              {["All", "Popular", "Top Seller", "Electronic", "Fashion"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="pt-2 rounded-lg text-white hover:text-purple-600"
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

import React from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../assets/homepage/search.svg";
import SaldoIcon from "../assets/homepage/saldo.svg";
import ChartIcon from "../assets/homepage/chart.svg";
import SigninIcon from "../assets/homepage/signin.svg";
import WishlistIcon from "../assets/homepage/wishlist.svg";
import LogoIcon from "../assets/homepage/logo.svg";

const Navbar = ({
  query,
  setQuery,
  handleSearch,
  setSelectedCategory,
  cart = [],
  setShowCart,
  showCart,
  handleSignInClick,
  handleWalletClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative z-10">
      {/* Navbar Main */}
      <div className="w-full bg-[#100429] py-2 px-4 md:px-10 sticky top-0 shadow-md flex flex-wrap items-center justify-between gap-1">
        {/* Logo dan Teks Vertikal di samping */}
        <div className="w-full md:w-auto flex-shrink-0 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-white hover:text-white"
          >
            <img src={LogoIcon} alt="Logo" className="h-auto w-auto" />
            <div className="flex flex-col ml-2">
              <span className="text-xl font-semibold">Blesing</span>
              <span className="text-lg font-semibold">Store</span>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-1 justify-center">
          <div className="flex w-[60%]">
            <input
              type="text"
              placeholder="Cari produk..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-lg text-black bg-white placeholder-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#7338A0] rounded-r-lg hover:bg-purple-500"
            >
              <img src={SearchIcon} alt="Search" className="h-auto w-auto" />
            </button>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center">
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative mx-4 md:mx-6 lg:mx-10"
          >
            <img
              src={ChartIcon}
              alt="Keranjang"
              className="w-6 md:w-8 lg:w-14"
            />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                {cart.length}
              </span>
            )}
          </button>

          <button onClick={handleWalletClick} className="mx-4 md:mx-6 lg:mx-10">
            <img src={SaldoIcon} alt="Saldo" className="w-6 md:w-8 lg:w-10" />
          </button>

          <button
            onClick={() => alert("Fitur wishlist belum tersedia.")}
            className="mx-4 md:mx-6 lg:mx-10"
          >
            <img
              src={WishlistIcon}
              alt="Wishlist"
              className="w-6 md:w-8 lg:w-10"
            />
          </button>

          <button
            onClick={handleSignInClick}
            className="flex items-center space-x-2 mx-1 md:mx- lg:mx-10"
          >
            <img
              src={SigninIcon}
              alt="Sign In"
              className="w-6 md:w-8 lg:w-10"
            />
            <span className="text-white text-sm md:text-base lg:text-lg">
              Sign In
            </span>
          </button>
        </div>

        {/* Category Buttons */}
        <div className="w-full flex justify-center gap-4 mt-4 md:mt-0">
          {["All", "Popular", "Top Seller", "Electronic", "Fashion"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-lg text-white hover:text-purple-600"
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
