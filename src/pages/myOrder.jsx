import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import Bg from "../assets/homepage/background.svg";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    const storedOrders = JSON.parse(localStorage.getItem("orders")) || [];

    const validOrders = storedOrders.filter(
      (order) =>
        order &&
        typeof order === "object" &&
        "id" in order &&
        "name" in order &&
        "price" in order &&
        "status" in order
    );

    setOrders(validOrders);
  }, [navigate]);

  const groupedOrders = {
    "Menunggu Penjual": [],
    "Sedang Dikirim": [],
    "Sampai di Tujuan": [],
  };

  orders.forEach((order) => {
    const status = order.status || "Menunggu Penjual";
    if (!groupedOrders[status]) {
      groupedOrders[status] = [];
    }
    groupedOrders[status].push(order);
  });

  const renderOrders = (status) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-white mb-4">{status}</h3>
      {groupedOrders[status]?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedOrders[status].map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-md text-black">
              <h4 className="font-semibold text-lg">{order.name}</h4>
              <p className="text-gray-600">
                Rp{Number(order.price).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-blue-500">{order.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-300">Belum ada pesanan dengan status ini.</p>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center font-montserrat"
      style={{ backgroundImage: `url(${Bg})` }}
    >
      <div className="absolute inset-0 bg-black opacity-70"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow max-w-6xl mx-auto px-4 py-12 text-white">
          <h2 className="text-2xl font-bold mb-8">Pesanan Saya</h2>
          {renderOrders("Menunggu Penjual")}
          {renderOrders("Sedang Dikirim")}
          {renderOrders("Sampai di Tujuan")}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default MyOrder;
