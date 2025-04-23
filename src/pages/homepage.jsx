import React, { useState } from "react";
import SearchIcon from "../assets/homepage/search.svg";
import SaldoIcon from "../assets/homepage/saldo.svg";
import ChartIcon from "../assets/homepage/chart.svg";
import SigninIcon from "../assets/homepage/signin.svg";
import WishlistIcon from "../assets/homepage/wishlist.svg";
import Bg from "../assets/homepage/bg.jpg";

const products = [
  { id: 1, name: "Produk Sepatu", description: "Deskripsi singkat produk sepatu", price: 100000 },
  { id: 2, name: "Produk Kaos", description: "Deskripsi singkat produk kaos", price: 200000 },
  { id: 3, name: "Produk Topi", description: "Deskripsi singkat produk topi", price: 150000 },
];

const Homepage = () => {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const handleSearch = () => {
    setSearch(query);
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const exist = prevCart.find((item) => item.id === product.id);
      return exist
        ? prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${Bg})` }}>
      {/* Navbar */}
      <div className="w-full bg-[#100429] py-5 px-4 md:px-10 sticky top-0 z-10 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="w-1/10 hidden md:block" />

        {/* Search Bar */}
        <div className="flex flex-1 justify-center">
          <div className="flex w-full max-w-xl">
            <input
              type="text"
              placeholder="Cari produk..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-lg text-purple-800 bg-white placeholder-black focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#7338A0] rounded-r-lg hover:bg-purple-100"
            >
              <img src={SearchIcon} alt="Search" className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button onClick={() => alert("Fitur saldo belum tersedia.")}>
            <img src={SaldoIcon} alt="Saldo" className="w-6 md:w-8" />
          </button>
          <button onClick={() => alert("Fitur wishlist belum tersedia.")}>
            <img src={WishlistIcon} alt="Wishlist" className="w-6 md:w-8" />
          </button>
          <button onClick={() => alert("Fitur Sign In belum tersedia.")}>
            <img src={SigninIcon} alt="Sign In" className="w-6 md:w-8" />
          </button>

          {/* Cart */}
          <div className="relative">
            <button onClick={() => setShowCart(!showCart)}>
              <img src={ChartIcon} alt="Keranjang" className="w-6 md:w-8" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>

            {showCart && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50 p-4">
                <h3 className="font-bold mb-2">Keranjang</h3>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-sm">Keranjang kosong.</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between mb-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-purple-600 font-semibold text-sm">
                          Rp{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <hr className="my-2" />
                    <div className="text-right font-bold text-purple-700 text-sm">
                      Total: Rp{totalPrice.toLocaleString()}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-10">
        <h2 className="text-white text-2xl font-bold mb-6">Rekomendasi untukmu</h2>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <img
                  src={`https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-gray-500 mb-2">{product.description}</p>
                <span className="text-purple-600 font-bold text-xl block mb-4">
                  Rp{product.price.toLocaleString()}
                </span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">Produk tidak ditemukan.</p>
        )}

        <div className="text-center mt-10">
          <button className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700">
            Lihat Semua Produk
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
