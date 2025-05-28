import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase"; // Pastikan path ini sesuai dengan konfigurasi Anda
import KurirSidebar from "../../components/KurirSidebar.jsx";

const KurirBarang = () => {
  const [orders, setOrders] = useState([]);

  // Ambil data user yang sedang login dari localStorage
  const User = JSON.parse(localStorage.getItem("user"));
  const uid = User ? User.id : null;

  // Fungsi untuk mengambil data orders dari Firestore dengan filter
  useEffect(() => {
    const fetchOrders = async () => {
      if (!uid) return; // Jika user belum login, hentikan proses

      try {
        // Query Firestore: ambil orders dengan status_barang = 'menunggu kurir' dan id_user sesuai user login
        const q = query(
          collection(firestore, "orders"),
          where("status_barang", "==", "menunggu kurir"),
          where("id_user", "==", uid)
        );

        const querySnapshot = await getDocs(q);
        const ordersData = [];

        querySnapshot.forEach((doc) => {
          ordersData.push({ id: doc.id, ...doc.data() });
        });

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [uid]);

  // Fungsi untuk update status_pengiriman pada dokumen order di Firestore
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(firestore, "orders", orderId);
      await updateDoc(orderRef, {
        status_pengiriman: newStatus,
      });

      // Update state agar UI langsung berubah tanpa reload
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status_pengiriman: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Render tombol aksi berdasarkan status_pengiriman
  const renderAksi = (order) => {
    const { id, status_pengiriman } = order;

    switch (status_pengiriman) {
      case "menunggu kurir":
        return (
          <div className="space-x-2">
            <button
              onClick={() => handleUpdateStatus(id, "sedang dikirim")}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Kirim
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <KurirSidebar activePage="Manage Product" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Daftar Barang Kurir</h1>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Nama Barang</th>
                <th className="px-6 py-3">Penjual</th>
                <th className="px-6 py-3">Pembeli</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-6 py-3">{order.nama_barang}</td>
                  <td className="px-6 py-3">{order.penjual}</td>
                  <td className="px-6 py-3">{order.pembeli}</td>
                  <td className="px-6 py-3 capitalize">
                    {order.status_pengiriman}
                  </td>
                  <td className="px-6 py-3">{renderAksi(order)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KurirBarang;
