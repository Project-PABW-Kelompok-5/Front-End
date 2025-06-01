// src/pages/kurir/KurirDashboard.jsx

import { useEffect, useState } from "react";
import {
  query,
  getDocs,
  getDoc,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth"; // Import getAuth dan signOut
import { db } from "../../../src/firebase.js"; // Pastikan db diimpor dengan benar
import KurirSidebar from "../../components/KurirSidebar.jsx";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Inisialisasi auth di luar komponen atau pastikan sudah diimpor dari firebase.js
// Jika firebase.js mengekspor auth, Anda bisa mengimpornya seperti db.
// Contoh: import { db, auth } from "../../../src/firebase.js";
// Jika tidak, Anda bisa inisialisasi di sini jika 'app' tersedia:
const auth = getAuth(); // Mengambil instance auth dari Firebase app yang sudah diinisialisasi

const statusOptions = [
  { value: "menunggu kurir", label: "📦 Menunggu Kurir" },
  { value: "sedang dikirim", label: "🚚 Sedang Dikirim" },
  { value: "menunggu dikirim balik", label: "📦 Menunggu Dikirim Balik" },
  { value: "dikirim balik", label: "🔁 Dikirim Balik" },
];

const KurirDashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState("menunggu kurir");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellersMap, setSellersMap] = useState({});
  const [sellersLoading, setSellersLoading] = useState(true);

  const navigate = useNavigate(); // Inisialisasi useNavigate

  // Fungsi untuk logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Melakukan proses logout
      localStorage.removeItem("user"); // Hapus data user dari localStorage
      navigate("/login"); // Arahkan pengguna ke halaman login
      alert("Anda telah berhasil logout.");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Gagal logout. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    const fetchSellersData = async () => {
      if (!filteredOrders || filteredOrders.length === 0) {
        setSellersMap({});
        setSellersLoading(false);
        return;
      }

      setSellersLoading(true);
      const newSellersMap = { ...sellersMap };
      const sellerIdsToFetch = new Set();

      filteredOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.id_penjual && !newSellersMap[item.id_penjual]) {
            sellerIdsToFetch.add(item.id_penjual);
          }
        });
      });

      if (sellerIdsToFetch.size === 0) {
        setSellersLoading(false);
        return;
      }

      try {
        const sellerPromises = Array.from(sellerIdsToFetch).map(async (sellerId) => {
          const userDocRef = doc(db, "users", sellerId);
          const userSnap = await getDoc(userDocRef);
          return userSnap.exists()
            ? { id: sellerId, username: userSnap.data().username || "Username Tdk Ada" }
            : { id: sellerId, username: "Penjual Tdk Ditemukan" };
        });

        const sellersData = await Promise.all(sellerPromises);
        sellersData.forEach((seller) => {
          newSellersMap[seller.id] = seller.username;
        });
        setSellersMap(newSellersMap);
      } catch (err) {
        console.error("Error fetching sellers data:", err);
        sellerIdsToFetch.forEach((id) => {
          if (!newSellersMap[id]) newSellersMap[id] = "Gagal Memuat";
        });
        setSellersMap(newSellersMap);
      } finally {
        setSellersLoading(false);
      }
    };

    fetchSellersData();
  }, [filteredOrders]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "orders"));
      const snap = await getDocs(q);
      const allOrders = [];

      snap.forEach((doc) => {
        const order = doc.data();
        allOrders.push({
          id: doc.id,
          namaPenerima: order.alamat?.namaPenerima || "-",
          teleponPenerima: order.alamat?.teleponPenerima || "-",
          alamatLengkap: order.alamat?.alamatLengkap || "-",
          items: order.items || [],
          firestoreShippingStatus: order.status_pengiriman,
          shippingCost: order.shippingCost || 0,
          subtotal: order.subtotal || 0,
          totalBayar: order.totalBayar || 0,
          createdAt: order.createdAt
            ? order.createdAt.toDate().toLocaleString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                timeZoneName: "short",
              })
            : "-",
        });
      });

      const clientFiltered = allOrders
        .filter((order) =>
          order.items.some((item) => item.status_barang === selectedStatus)
        )
        .map((order) => ({ ...order, status: selectedStatus }));

      setFilteredOrders(clientFiltered);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError("Gagal memuat pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleStatusChange = (e) => setSelectedStatus(e.target.value);

  const updateItemStatusInFirestore = async (orderId, oldStatus, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) return false;

      const orderData = orderSnap.data();
      const updatedItems = orderData.items.map((item) =>
        item.status_barang === oldStatus ? { ...item, status_barang: newStatus } : item
      );

      await updateDoc(orderRef, { items: updatedItems });
      return true;
    } catch (error) {
      console.error("Gagal update status:", error);
      return false;
    }
  };

  const handleTakeOrder = async (orderId) => {
    // Ganti window.confirm dengan modal UI kustom
    if (confirm("Ambil pesanan ini?")) { // Menggunakan confirm sebagai placeholder
      const success = await updateItemStatusInFirestore(orderId, "menunggu kurir", "sedang dikirim");
      success ? alert("Pesanan diambil.") : alert("Gagal mengambil pesanan.");
      fetchOrders();
    }
  };

  const handleCompleteOrder = async (orderId) => {
    // Ganti window.confirm dengan modal UI kustom
    if (confirm("Konfirmasi pesanan sampai tujuan?")) { // Menggunakan confirm sebagai placeholder
      const success = await updateItemStatusInFirestore(orderId, "sedang dikirim", "sampai di tujuan");
      success ? alert("Konfirmasi berhasil.") : alert("Gagal konfirmasi.");
      fetchOrders();
    }
  };

  const handleTakeReturn = async (orderId) => {
    // Ganti window.confirm dengan modal UI kustom
    if (confirm("Ambil pengiriman balik?")) { // Menggunakan confirm sebagai placeholder
      const success = await updateItemStatusInFirestore(orderId, "menunggu dikirim balik", "dikirim balik");
      success ? alert("Pengiriman balik diambil.") : alert("Gagal mengambil pengembalian.");
      fetchOrders();
    }
  };

  const handleConfirmReturn = async (orderId) => {
    // Ganti window.confirm dengan modal UI kustom
    if (confirm("Konfirmasi pengembalian pesanan?")) { // Menggunakan confirm sebagai placeholder
      const success = await updateItemStatusInFirestore(orderId, "dikirim balik", "menunggu penjual");
      success ? alert("Pengembalian dikonfirmasi.") : alert("Gagal konfirmasi pengembalian.");
      fetchOrders();
    }
  };

  const renderActionButton = (status, orderId) => {
    switch (status) {
      case "menunggu kurir":
        return (
          <button onClick={() => handleTakeOrder(orderId)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Ambil
          </button>
        );
      case "sedang dikirim":
        return (
          <button onClick={() => handleCompleteOrder(orderId)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">
            Konfirmasi sampai ditujuan
          </button>
        );
      case "menunggu dikirim balik":
        return (
          <button onClick={() => handleTakeReturn(orderId)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Ambil pengiriman balik
          </button>
        );
      case "dikirim balik":
        return (
          <button onClick={() => handleConfirmReturn(orderId)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
            Konfirmasi pengembalian
          </button>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => amount?.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

  return (
    <div className="flex">
      <KurirSidebar activePage="Dashboard" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen overflow-y-auto relative"> {/* Tambahkan relative di sini */}
        <div className="absolute top-4 right-4"> {/* Posisi tombol logout */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md flex items-center space-x-2"
          >
            <span>Logout</span>
            {/* Anda bisa menambahkan ikon logout dari lucide-react jika diinginkan */}
            {/* <LogOut size={18} /> */}
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4">Dashboard Kurir</h1>

        <div className="mb-4">
          <label htmlFor="status-filter" className="text-sm text-gray-600 mr-2">Filter Status:</label>
          <select id="status-filter" value={selectedStatus} onChange={handleStatusChange} className="p-2 border rounded">
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Penerima</th>
                <th className="px-4 py-2 text-left">Penjual</th>
                <th className="px-4 py-2 text-left">Telepon</th>
                <th className="px-4 py-2 text-left">Alamat</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-4">Memuat data...</td></tr>
              ) : error ? (
                <tr><td colSpan="7" className="text-center text-red-500 p-4">{error}</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-4">Tidak ada pesanan untuk status ini.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-2">{order.namaPenerima}</td>
                    <td className="px-4 py-2">
                      {order.items.map((item, idx) => (
                        <div key={idx}>
                          {sellersMap[item.id_penjual] || (sellersLoading ? "Loading..." : "Tidak Diketahui")}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">{order.teleponPenerima}</td>
                    <td className="px-4 py-2">{order.alamatLengkap}</td>
                    <td className="px-4 py-2">{formatCurrency(order.totalBayar)}</td>
                    <td className="px-4 py-2">{order.createdAt}</td>
                    <td className="px-4 py-2">{renderActionButton(order.status, order.id)}</td>
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
