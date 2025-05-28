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
  { value: "dikirim balik", label: "🔁 Dikirim Balik" },
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
      // Untuk mendapatkan data dokumen, gunakan getDoc (singular)
      const orderSnap = await getDocs(orderRef); // getDocs from query, but for a single doc, use getDoc(docRef)
      const orderData = orderSnap.data(); // Access data directly

      if (!orderData) {
        console.error("Dokumen pesanan tidak ditemukan:", orderId);
        return false;
      }

      const updatedItems = orderData.items.map((item) => {
        if (item.status_barang === oldStatus) {
          return { ...item, status_barang: newStatus };
        }
        return item;
      });

      let newShippingStatus = orderData.status_pengiriman;
      const allItemsShipping = updatedItems.every(
        (item) => item.status_barang === "sedang dikirim"
      );
      if (
        oldStatus === "menunggu kurir" &&
        newStatus === "sedang dikirim" &&
        allItemsShipping
      ) {
        newShippingStatus = "sedang dikirim";
      }
      const allItemsCompleted = updatedItems.every(
        (item) => item.status_barang === "selesai"
      );
      if (newStatus === "selesai" && allItemsCompleted) {
        newShippingStatus = "selesai";
      }
      const allItemsReturnedConfirmed = updatedItems.every(
        (item) => item.status_barang === "kembali_dikonfirmasi"
      );
      if (newStatus === "kembali_dikonfirmasi" && allItemsReturnedConfirmed) {
        newShippingStatus = "kembali_dikonfirmasi";
      }

      await updateDoc(orderRef, {
        items: updatedItems,
        status_pengiriman: newShippingStatus,
      });
      return true;
    } catch (error) {
      console.error("Gagal memperbarui status barang:", error);
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
    if (window.confirm("Apakah Anda yakin ingin menyelesaikan pesanan ini?")) {
      const success = await updateItemStatusInFirestore(
        orderId,
        "sedang dikirim",
        "selesai"
      );
      if (success) {
        alert("Pesanan berhasil diselesaikan!");
        fetchOrders();
      } else {
        alert("Terjadi kesalahan saat menyelesaikan pesanan.");
      }
    }
  };

  const handleConfirmReturn = async (orderId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengkonfirmasi pengembalian pesanan ini?"
      )
    ) {
      const success = await updateItemStatusInFirestore(
        orderId,
        "dikirim balik",
        "kembali_dikonfirmasi"
      );
      if (success) {
        alert("Pengembalian pesanan berhasil dikonfirmasi!");
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
            Selesaikan
          </button>
        );
      case "dikirim balik":
        return (
          <button
            onClick={() => handleConfirmReturn(orderId)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Konfirmasi
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
                  {/* Pastikan colSpan sesuai dengan jumlah kolom header baru (10) */}
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
                    .filter((item) => item.status_barang === "menunggu kurir") // <-- TAMBAHKAN FILTER INI
                    .map((item, itemIndex) => {
                      const sellerUsername =
                        sellersLoading && !sellersMap[item.id_penjual]
                          ? "Memuat data penjual..."
                          : sellersMap[item.id_penjual] || "N/A";
                      return (
                        <tr
                          key={`${order.id}-${item.id || itemIndex}`}
                          className="border-t align-top hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">{order.namaPenerima}</td>
                          <td className="px-4 py-2">{sellerUsername}</td>{" "}
                          {/* Menampilkan username penjual */}
                          <td className="px-4 py-2">{order.teleponPenerima}</td>
                          <td className="px-4 py-2">{order.alamatLengkap}</td>
                          <td className="px-4 py-2">{item.nama}</td>
                          <td className="px-4 py-2">{item.qty}</td>
                          <td className="px-4 py-2">
                            {formatCurrency(order.subtotal)}
                          </td>
                          <td className="px-4 py-2">
                            {formatCurrency(order.shippingCost)}
                          </td>
                          <td className="px-4 py-2 capitalize">
                            {item.status_barang}
                          </td>
                          <td className="px-4 py-2">{order.createdAt}</td>
                          <td className="px-4 py-2">
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
