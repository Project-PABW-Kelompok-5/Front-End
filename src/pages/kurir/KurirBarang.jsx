import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import KurirSidebar from "../../components/KurirSidebar";

const KurirOrder = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  // Update status item di dalam array items
  const handleUpdateItemStatus = async (orderId, index, statusBaru) => {
    const orderRef = doc(db, "orders", orderId);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedItems = [...order.items];
    updatedItems[index].status = statusBaru;

    await updateDoc(orderRef, { items: updatedItems });
  };

  const renderItemActions = (orderId, item, index) => {
    switch (item.status) {
      case "menunggu kurir":
        return (
          <div className="space-x-2">
            <button
              onClick={() => handleUpdateItemStatus(orderId, index, "sedang dikirim")}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Kirim
            </button>
            <button
              onClick={() => handleUpdateItemStatus(orderId, index, "dikirim balik")}
              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
            >
              Kirim Balik
            </button>
          </div>
        );
      case "sedang dikirim":
        return (
          <button
            onClick={() => handleUpdateItemStatus(orderId, index, "sampai di tujuan")}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Sampai Tujuan
          </button>
        );
      case "dikirim balik":
        return (
          <button
            onClick={() => handleUpdateItemStatus(orderId, index, "menunggu penjual")}
            className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
          >
            Kembali ke Penjual
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <KurirSidebar activePage="Manage Order" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Daftar Order Kurir</h1>
        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Nama Barang</th>
                <th className="px-6 py-3">Penjual</th>
                <th className="px-6 py-3">Pembeli</th>
                <th className="px-6 py-3">Status Barang</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) =>
                order.items?.map((item, index) => (
                  <tr key={`${order.id}-${index}`} className="border-t">
                    <td className="px-6 py-3">{item.namaBarang}</td>
                    <td className="px-6 py-3">{order.penjual}</td>
                    <td className="px-6 py-3">{order.pembeli}</td>
                    <td className="px-6 py-3 capitalize">{item.status}</td>
                    <td className="px-6 py-3">
                      {renderItemActions(order.id, item, index)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KurirOrder;
