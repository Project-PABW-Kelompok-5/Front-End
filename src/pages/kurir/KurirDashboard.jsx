import { useEffect, useState } from "react";
import { query, where, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";
import KurirSidebar from "../../components/KurirSidebar.jsx";

const statusOptions = [
  { value: "menunggu kurir", label: "📦 Menunggu Kurir" },
  { value: "sedang dikirim", label: "🚚 Sedang Dikirim" },
  { value: "dikirim balik", label: "🔁 Dikirim Balik" },
];

const KurirDashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState("menunggu kurir");
  const [filteredOrders, setFilteredOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, "orders"),
        where("status_pengiriman", "==", selectedStatus)
      );

      const snap = await getDocs(q);
      const result = [];

      snap.forEach((doc) => {
        const order = doc.data();
        result.push({
          id: doc.id,
          namaPenerima: order.namaPenerima,
          teleponPenerima: order.teleponPenerima,
          alamatLengkap: order.alamatLengkap || order.alamat?.alamatLengkap || "-",
          items: order.items || [],
          status: order.status_pengiriman,
          shippingCost: order.shippingCost || 0,
          subtotal: order.subtotal || 0,
          totalBayar: order.totalBayar || 0,
          createdAt: order.createdAt,
        });
      });

      setFilteredOrders(result);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const renderActionButton = (status) => {
    switch (status) {
      case "menunggu kurir":
        return <button className="bg-blue-500 text-white px-3 py-1 rounded">Ambil</button>;
      case "sedang dikirim":
        return <button className="bg-green-500 text-white px-3 py-1 rounded">Selesaikan</button>;
      case "dikirim balik":
        return <button className="bg-yellow-500 text-white px-3 py-1 rounded">Konfirmasi</button>;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <KurirSidebar activePage="Dashboard" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard Kurir</h1>

        <div className="mb-4">
          <label className="text-sm text-gray-600 mr-2">Filter Status:</label>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="p-2 border rounded"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Penerima</th>
                <th className="px-4 py-2 text-left">Telepon</th>
                <th className="px-4 py-2 text-left">Alamat</th>
                <th className="px-4 py-2 text-left">Barang</th>
                <th className="px-4 py-2 text-left">Subtotal</th>
                <th className="px-4 py-2 text-left">Ongkir</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    Tidak ada pesanan dengan status ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t align-top">
                    <td className="px-4 py-2">{order.namaPenerima}</td>
                    <td className="px-4 py-2">{order.teleponPenerima}</td>
                    <td className="px-4 py-2">{order.alamatLengkap}</td>
                    <td className="px-4 py-2">
                      <ul className="list-disc ml-4">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.nama} ({item.qty}x)
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2">
                      {order.subtotal?.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      {order.shippingCost?.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </td>
                    <td className="px-4 py-2 capitalize">{order.status}</td>
                    <td className="px-4 py-2">{renderActionButton(order.status)}</td>
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

export default KurirDashboard;
