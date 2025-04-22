import React, { useState } from "react";

// Import gambar dan ikon
import SearchIcon from "../assets/homepage/search.png";
import SaldoIcon from "../assets/homepage/saldo.png";
import ChartIcon from "../assets/homepage/chart.png";
import SigninIcon from "../assets/homepage/signin.png";
import WishlistIcon from "../assets/homepage/wishlist.png";
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
      if (exist) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${Bg})` }}
    >
      {/* Navbar */}
      <div className="w-full bg-[#100429] py-11 px-11 relative shadow sticky top-0 z-5">
        {/* Search Bar di Tengah */}
        <div className="absolute left-[35%] top-[25%] w-[35%] h-[55%] flex gap-0">
          <input
            type="text"
            placeholder="Cari produk..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-l-lg border-none text-purple-800 placeholder-black bg-white focus:outline-none focus:ring-1 focus:ring-white"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#7338A0] text-purple-600 font-semibold rounded-r-lg hover:bg-purple-100 transition"
          >
            <img src={SearchIcon} alt="" className="h-8 w-8" />
          </button>
        </div>

        {/* Icon Saldo di kanan atas */}
<div className="absolute right-[13%] top-[50%] -translate-y-[50%]">
  <button
    onClick={() => alert("Fitur saldo belum tersedia.")}
    className="text-white text-lg relative focus:outline-none"
  >
    <img src={SaldoIcon} alt="Saldo" className="w-[60%] h-[10%]" />
  </button>
</div>

{/* Wishlist di kanan atas */}
<div className="absolute right-[7%] top-[50%] -translate-y-[50%]">
  <button
    onClick={() => alert("Fitur wishlist belum tersedia.")}
    className="text-white text-lg relative focus:outline-none"
  >
    <img src={WishlistIcon} alt="Wishlist" className="w-[60%] h-[50%]" />
  </button>
</div>

{/* Sign In di kanan atas */}
<div className="absolute right-[0%] top-[40%] -translate-y-[50%]">
  <button
    onClick={() => alert("Fitur Sign In belum tersedia.")}
    className="text-white text-lg relative focus:outline-none"
  >
    <img src={SigninIcon} alt="Sign In" className="w-[50%] h-[50%]" />
  </button>
</div>



        

        {/* Icon Keranjang di Kanan */}
        <div className="absolute right-[16%] top-[50%] -translate-y-[50%]">
          <button
            onClick={() => setShowCart(!showCart)}
            className="text-white text-lg relative focus:outline-none"
          >
            <img src={ChartIcon} alt="" className="w-[50%] h-[50%]" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1 rounded-full">
                {cart.length}
              </span>
            )}
          </button>

          {/* Dropdown Keranjang */}
          {showCart && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50 p-4">
              <h3 className="font-bold mb-2">Keranjang</h3>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">Keranjang kosong.</p>
              ) : (
                <div>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Produk Unggulan */}
      <div className="max-w-5x3 mx-left py-100 px-69">
        <h2 className="text-white text-2xl font-bold mb-6 text-left">Rekomendasi untukmu</h2>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-30">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
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
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
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
          <button className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition">
            Lihat Semua Produk
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
