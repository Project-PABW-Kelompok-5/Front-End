import { useEffect, useState } from "react";
import {
  query,
  getDocs,
  getDoc,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../src/firebase.js";
import KurirSidebar from "../../components/KurirSidebar.jsx";

const statusOptions = [
  { value: "menunggu kurir", label: "📦 Menunggu Kurir" },
  { value: "sedang dikirim", label: "🚚 Sedang Dikirim" },
  { value: "menunggu dikirim balik", label: "📦 Menunggu Dikirim Balik" },
  { value: "dikirim balik", label: "🔁 Dikirim Balik" }
];

const KurirDashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState("menunggu kurir");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sellersMap, setSellersMap] = useState({});
  const [sellersLoading, setSellersLoading] = useState(true); // Default ke true saat pertama kali

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
        const sellerPromises = Array.from(sellerIdsToFetch).map(
          async (sellerId) => {
            // Mengambil data dari Firestore collection 'users'
            const userDocRef = doc(db, "users", sellerId); // Membuat referensi ke dokumen user
            const userSnap = await getDoc(userDocRef); // Mengambil snapshot dokumen

            if (userSnap.exists()) {
              // Dokumen ditemukan, ambil field username
              const userData = userSnap.data();
              return {
                id: sellerId,
                username: userData.username || "Username Tdk Ada",
              }; // Fallback jika field username tidak ada
            } else {
              // Dokumen tidak ditemukan
              console.warn(`User document with ID ${sellerId} not found.`);
              return { id: sellerId, username: "Penjual Tdk Ditemukan" };
            }
          }
        );

        const sellersData = await Promise.all(sellerPromises);
        sellersData.forEach((seller) => {
          if (seller) {
            newSellersMap[seller.id] = seller.username;
          }
        });
        setSellersMap(newSellersMap);
      } catch (err) {
        console.error("Error fetching sellers data from Firestore:", err);
        // Untuk ID yang gagal, Anda bisa menandainya di map
        sellerIdsToFetch.forEach((id) => {
          if (!newSellersMap[id]) newSellersMap[id] = "Gagal Memuat";
        });
        setSellersMap(newSellersMap); // Pastikan map diperbarui meskipun ada error
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
          // *** PERUBAHAN DI SINI: Akses melalui 'alamat' ***
          namaPenerima: order.alamat?.namaPenerima || "-", // Gunakan optional chaining dan fallback
          teleponPenerima: order.alamat?.teleponPenerima || "-", // Gunakan optional chaining dan fallback
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
          order.items.some((item) => {
            if (
              item.status_barang === "menunggu kurir" &&
              selectedStatus === "menunggu kurir"
            ) {
              return true;
            }
            return item.status_barang === selectedStatus;
          })
        )
        .map((order) => ({
          ...order,
          status: order.items.some(
            (item) =>
              item.status_barang === "menunggu kurir" &&
              selectedStatus === "menunggu kurir"
          )
            ? "menunggu kurir"
            : selectedStatus,
        }));

      setFilteredOrders(clientFiltered);
      console.log("Fetched and filtered orders (client-side):", clientFiltered);
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

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const updateItemStatusInFirestore = async (orderId, oldStatus, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      // Gunakan getDoc untuk mengambil satu dokumen
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) { // Periksa apakah dokumen ada menggunakan orderSnap.exists()
        console.error("Dokumen pesanan tidak ditemukan:", orderId);
        return false;
      }

      const orderData = orderSnap.data(); // Akses data menggunakan orderSnap.data()

      // Memperbarui status_barang dalam array items
      const updatedItems = orderData.items.map((item) => {
        if (item.status_barang === oldStatus) {
          return { ...item, status_barang: newStatus };
        }
        return item;
      });

      // Hanya perbarui field 'items' di Firestore
      await updateDoc(orderRef, {
        items: updatedItems,
      });

      console.log(`Status barang untuk order ${orderId} berhasil diperbarui dari '${oldStatus}' menjadi '${newStatus}'.`);
      return true;
    } catch (error) {
      console.error("Gagal memperbarui status barang di Firestore:", error);
      return false;
    }
  };

  const handleTakeOrder = async (orderId) => {
    if (window.confirm("Apakah Anda yakin ingin mengambil pesanan ini?")) {
      const success = await updateItemStatusInFirestore(
        orderId,
        "menunggu kurir",
        "sedang dikirim"
      );
      if (success) {
        alert(
          "Pesanan berhasil diambil! Status diperbarui menjadi 'Sedang Dikirim'."
        );
        fetchOrders();
      } else {
        alert("Terjadi kesalahan saat mengambil pesanan.");
      }
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (window.confirm("Apakah Anda yakin ingin konfirmasi pesanan ini sampai ditujuan?")) {
      const success = await updateItemStatusInFirestore(
        orderId,
        "sedang dikirim",
        "sampai di tujuan"
      );
      if (success) {
        alert("Pesanan berhasil dikonfirmasi sampai di tujuan! Status diperbarui menjadi 'Sampai di tujuan'.");
        fetchOrders();
      } else {
        alert("Terjadi kesalahan saat menyelesaikan pesanan.");
      }
    }
  };

  const handleTakeReturn = async (orderId) => {
    if (window.confirm("Apakah Anda yakin ingin mengambil pengiriman balik pesanan ini?")) {
      const success = await updateItemStatusInFirestore(
        orderId,
        "menunggu dikirim balik",
        "dikirim balik"
      );
      if (success) {
        alert(
          "Pengiriman balik pesanan berhasil diambil! Status diperbarui menjadi 'Dikirim balik'."
        );
        fetchOrders();
      } else {
        alert("Terjadi kesalahan saat mengambil pesanan.");
      }
    }
  };

  const handleConfirmReturn = async (orderId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin konfirmasi pengembalian pesanan ini?"
      )
    ) {
      const success = await updateItemStatusInFirestore(
        orderId,
        "dikirim balik",
        "menunggu penjual"
      );
      if (success) {
        alert("Pengembalian pesanan berhasil dikonfirmasi! Status diperbarui menjadi 'Menunggu penjual'.");
        fetchOrders();
      } else {
        alert("Terjadi kesalahan saat mengkonfirmasi pengembalian.");
      }
    }
  };

  const renderActionButton = (status, orderId) => {
    switch (status) {
      case "menunggu kurir":
        return (
          <button
            onClick={() => handleTakeOrder(orderId)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Ambil
          </button>
        );
      case "sedang dikirim":
        return (
          <button
            onClick={() => handleCompleteOrder(orderId)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Konfirmasi sampai ditujuan
          </button>
        );
      case "menunggu dikirim balik":
        return (
          <button
            onClick={() => handleTakeReturn(orderId)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Ambil pengiriman balik
          </button>
        );
      case "dikirim balik":
        return (
          <button
            onClick={() => handleConfirmReturn(orderId)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Konfirmasi pengembalian
          </button>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  };

  return (
    <div className="flex">
      <KurirSidebar activePage="Dashboard" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard Kurir</h1>

        <div className="mb-4">
          <label className="text-sm text-gray-600 mr-2" htmlFor="status-filter">
            Filter Status:
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
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
                <th className="px-4 py-2 text-left">Penjual</th>
                <th className="px-4 py-2 text-left">Telepon</th>
                <th className="px-4 py-2 text-left">Alamat</th>
                <th className="px-4 py-2 text-left">Barang</th>
                <th className="px-4 py-2 text-left">Qty</th>{" "}
                {/* Kolom baru untuk Qty Item */}
                <th className="px-4 py-2 text-left">Subtotal Barang</th>{" "}
                {/* Nama kolom diperjelas */}
                <th className="px-4 py-2 text-left">Ongkir Order</th>{" "}
                {/* Nama kolom diperjelas */}
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Tanggal Pesan</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-blue-500">
                    Memuat pesanan...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-gray-500">
                    Tidak ada pesanan dengan status ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.flatMap((order) =>
                  order.items
                    .filter((item) => item.status_barang === selectedStatus) // <-- PERUBAHAN DI SINI
                    .map((item, itemIndex) => {
                      const sellerUsername =
                        sellersLoading && !sellersMap[item.id_penjual]
                          ? "Memuat data penjual..."
                          : sellersMap[item.id_penjual] || "N/A";
                      return (
                        <tr
                          key={`${order.id}-${item.id || itemIndex}`} // Pastikan item memiliki 'id' atau gunakan index sebagai fallback
                          className="border-t align-top hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">{order.namaPenerima}</td>
                          <td className="px-4 py-2">{sellerUsername}</td>
                          <td className="px-4 py-2">{order.teleponPenerima}</td>
                          <td className="px-4 py-2">{order.alamatLengkap}</td>
                          <td className="px-4 py-2">{item.nama}</td>
                          <td className="px-4 py-2">{item.qty}</td>
                          <td className="px-4 py-2">
                            {/* Asumsi subtotal di sini adalah subtotal keseluruhan order, bukan per item */}
                            {/* Jika Anda memiliki subtotal per item, gunakan item.subtotal */}
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="px-4 py-2">
                            {formatCurrency(order.shippingCost)}
                          </td>
                          <td className="px-4 py-2 capitalize">
                            {item.status_barang} {/* Akan selalu sama dengan selectedStatus */}
                          </td>
                          <td className="px-4 py-2">{order.createdAt}</td>
                          <td className="px-4 py-2">
                            {/* order.status sudah disesuaikan di fetchOrders berdasarkan selectedStatus */}
                            {/* Jadi, ini seharusnya sudah benar untuk menampilkan tombol aksi yang sesuai */}
                            {renderActionButton(order.status, order.id)}
                          </td>
                        </tr>
                      );
                    })
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KurirDashboard;
