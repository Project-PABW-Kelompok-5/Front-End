import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { firestore } from "../../firebase";
import Navbar from "../../components/navbar";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(firestore, "pesanan"));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setOrders(items);
    } catch (err) {
      setError("Gagal mengambil data pesanan: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(firestore, "pesanan", orderId);
      await updateDoc(orderRef, { status: newStatus });
      fetchOrders();
    } catch (err) {
      setError("Gagal update status pesanan: " + err.message);
    }
  };

  return (
    <div className="p-0 max-w-10xl mx-auto">
      <Navbar />
      <h1 className="text-2xl font-bold mt-6 mb-6">Manajemen Pesanan</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>Tidak ada pesanan.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Nama Pemesan</th>
              <th className="border border-gray-300 p-2">Tanggal</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">
                  {order.nama_pemesan}
                </td>
                <td className="border border-gray-300 p-2">{order.tanggal}</td>
                <td className="border border-gray-300 p-2">{order.status}</td>
                <td className="border border-gray-300 p-2 space-x-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, "Diproses")}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Proses
                  </button>
                  <button
                    onClick={() =>
                      updateOrderStatus(order.id, "Menunggu Kurir")
                    }
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Memanggil Kurir
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, "selesai")}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Selesai
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
