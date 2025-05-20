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
    // setShowCart,
    // showCart,
}) => {
    const navigate = useNavigate();

    return (
        <div className="relative z-10">
            {/* Navbar Main */}
            <div className="w-full bg-[#100429] py-3 px-15 sticky top-0 shadow-md flex items-center gap-1">
                {/* Logo dan Teks Vertikal di samping */}
                <div className="w-auto flex-shrink-0 flex items-center mr-15">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center text-white hover:text-white cursor-pointer"
                    >
                        <img src={LogoIcon} alt="Logo" className="h-auto w-auto" />
                        <div className="flex flex-col ml-2">
                            <span className="text-xl font-semibold">Blesing</span>
                            <span className="text-xl font-semibold flex ">Store</span> 
                        </div>
                    </button>
                </div>

                <div className="flex flex-col w-full ">
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
                                    className="shrink-0 px-4 py-2 bg-[#7338A0] rounded-r-lg hover:bg-purple-500 cursor-pointer"
                                >
                                    <img src={SearchIcon} alt="Search" className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Icons */}
                        <div className="ml-15 flex items-end justify-end gap-12 shrink-0">
                            <button onClick={() =>  navigate("/cart")} className="hover:cursor-pointer">
                                <img src={ChartIcon} alt="Keranjang" className="w-10" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                                        {cart.length}
                                    </span>
                                )}
                            </button>

                            <button onClick={() => alert("Fitur saldo belum tersedia.")} className="hover:cursor-pointer">
                                <img src={SaldoIcon} alt="Saldo" className="w-8 " />
                            </button>

                            <button onClick={() => alert("Fitur wishlist belum tersedia.")} className="hover:cursor-pointer">
                                <img src={WishlistIcon} alt="Wishlist" className="w-8 " />
                            </button>

                            <button onClick={() => navigate("/login")} className="flex space-x-2 hover:cursor-pointer">
                                <img src={SigninIcon} alt="Sign In" className="w-9" />
                                <span className="flex text-white text-md items-end">Sign In</span>
                            </button>
                        </div>
                    </div>

                    {/* Category Buttons */}
                    <div className="flex">
                        <div className=" flex gap-10 ml-2">
                            {["All", "Popular", "Top Seller", "Electronic", "Fashion"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className="pt-2 rounded-lg text-white hover:text-purple-600 hover:cursor-pointer"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;