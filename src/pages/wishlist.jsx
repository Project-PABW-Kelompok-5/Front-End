import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import Bg from "../assets/homepage/background.svg";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(stored);
  }, []);

  const handleRemove = (id) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${Bg})` }}
    >
      <div className="absolute inset-0 bg-black opacity-70"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow max-w-6xl mx-auto px-4 py-12 text-white">
          <h2 className="text-2xl font-bold mb-6">Wishlist Kamu</h2>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white text-black p-4 rounded-xl shadow-md"
                >
                  <img
                    src={`https://via.placeholder.com/300x200?text=${encodeURIComponent(
                      item.name
                    )}`}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-green-600 font-bold mt-2">
                    Rp{item.price.toLocaleString()}
                  </p>
                  <div className="flex justify-between mt-4">
                    <Link
                      to="/"
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                    >
                      Tambah ke Keranjang
                    </Link>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-lg">Wishlist kamu masih kosong.</p>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Wishlist;
