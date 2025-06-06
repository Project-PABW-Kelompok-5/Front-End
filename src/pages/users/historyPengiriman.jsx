import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
  runTransaction,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "../../firebase";

import {
  Package,
  CheckCircle,
  Truck,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  Calendar,
  HomeIcon,
  Box,
} from "lucide-react";

// --- Status Map (as suggested in previous review for better consistency) ---
const STATUS_MAP = {
  'diterima pembeli': { label: 'Diterima Pembeli', badgeClass: 'bg-green-700 text-white', icon: CheckCircle, iconClass: 'text-green-700' },
  'sampai di tujuan': { label: 'Sampai di Tujuan', badgeClass: 'bg-green-100 text-green-800', icon: CheckCircle, iconClass: 'text-green-500' },
  'sedang dikirim': { label: 'Sedang Dikirim', badgeClass: 'bg-blue-100 text-blue-800', icon: Truck, iconClass: 'text-blue-500' },
  'dikirim balik': { label: 'Dikirim Balik', badgeClass: 'bg-blue-100 text-blue-800', icon: Truck, iconClass: 'text-blue-500' },
  'diproses penjual': { label: 'Diproses Penjual', badgeClass: 'bg-yellow-100 text-yellow-800', icon: Clock, iconClass: 'text-yellow-500' },
  'menunggu kurir': { label: 'Menunggu Kurir', badgeClass: 'bg-yellow-100 text-yellow-800', icon: Clock, iconClass: 'text-yellow-500' },
  'menunggu penjual': { label: 'Menunggu Penjual', badgeClass: 'bg-yellow-100 text-yellow-800', icon: Clock, iconClass: 'text-yellow-500' },
  'dikomplain': { label: 'Dikomplain', badgeClass: 'bg-red-100 text-red-800', icon: AlertCircle, iconClass: 'text-red-500' },
  'dibatalkan': { label: 'Dibatalkan', badgeClass: 'bg-red-100 text-red-800', icon: AlertCircle, iconClass: 'text-red-500' },
  'default': { label: 'Status Tidak Diketahui', badgeClass: 'border border-gray-300', icon: Package, iconClass: 'text-gray-500' },
};

// --- Helper Functions (as suggested in previous review) ---
const getStatusInfo = (status) => {
  const lowerStatus = status?.toLowerCase();
  return STATUS_MAP[lowerStatus] || STATUS_MAP['default'];
};

const formatDate = (timestamp) => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return "Tanggal tidak tersedia";
};

const formatAddress = (addressData) => {
  if (!addressData) return "Alamat tidak tersedia";

  if (typeof addressData === "string") {
    return addressData;
  }

  if (addressData.alamat_lengkap) return addressData.alamat_lengkap;
  if (addressData.fullAddress || addressData.detail) {
    const fullAddress = addressData.fullAddress || "";
    const detail = addressData.detail || "";
    return `${fullAddress}, ${detail}`.replace(/^, | ,$|, $|^ $/g, "").trim();
  }
  if (addressData.alamatLengkap) return addressData.alamatLengkap;
  if (addressData.street || addressData.city || addressData.province) {
    return `${addressData.street || ""} ${addressData.city || ""} ${addressData.province || ""}`.trim();
  }

  return "Alamat tidak tersedia";
};


const HistoryPengiriman = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [complainMessage, setComplainMessage] = useState(""); // New state for complain message input
  const [complainOrderId, setComplainOrderId] = useState(null); // To track which order is being complained

  const navigate = useNavigate();

  const getOverallStatus = (items) => {
    if (!items || items.length === 0) {
      return "Status tidak diketahui";
    }

    let hasCancelledOrComplain = false;
    let allReceivedByBuyer = true;
    let allArrivedAtDestination = true;
    let hasBeingShipped = false;
    let hasSentBack = false;
    let hasProcessedBySeller = false;
    let hasWaitingCourier = false;
    let hasWaitingSeller = false;

    for (const item of items) {
      const status = item.status_barang?.toLowerCase();

      if (status === "dibatalkan" || status === "dikomplain") {
        hasCancelledOrComplain = true;
      }
      if (status !== "diterima pembeli") {
        allReceivedByBuyer = false;
      }
      if (status !== "sampai di tujuan" && status !== "delivered") {
        allArrivedAtDestination = false;
      }
      if (status === "sedang dikirim") {
        hasBeingShipped = true;
      }
      if (status === "dikirim balik") {
        hasSentBack = true;
      }
      if (status === "diproses penjual") {
        hasProcessedBySeller = true;
      }
      if (status === "menunggu kurir" || status === "menunggu dikirim balik") {
        hasWaitingCourier = true;
      }
      if (status === "menunggu penjual" || status === "pending") {
        hasWaitingSeller = true;
      }
    }

    if (hasCancelledOrComplain) return "Dikomplain";
    if (allReceivedByBuyer) return "Diterima Pembeli";
    if (allArrivedAtDestination) return "Sampai di Tujuan";
    if (hasBeingShipped) return "Sedang Dikirim";
    if (hasSentBack) return "Dikirim Balik";
    if (hasProcessedBySeller) return "Diproses Penjual";
    if (hasWaitingCourier) return "Menunggu Kurir";
    if (hasWaitingSeller) return "Menunggu Penjual";

    return "Status tidak diketahui";
  };

  // Modified handleComplain function
  const handleComplain = async (orderId) => {
    if (!firestore || !userId) {
      setError("Firebase Firestore tidak tersedia atau pengguna belum login.");
      return;
    }
    if (!complainMessage.trim()) { // Ensure complain message is not empty
      alert("Pesan komplain tidak boleh kosong.");
      return;
    }

    setIsUpdating("complain");

    try {
      const orderRef = doc(firestore, "orders", orderId);

      await runTransaction(firestore, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw "Dokumen pesanan tidak ditemukan!";
        }

        const data = orderDoc.data();
        const updatedItems = data.items.map((item) => {
          // Add pesanKomplain to each item and change its status
          return { ...item, status_barang: "dikomplain", pesanKomplain: complainMessage };
        });

        transaction.update(orderRef, { items: updatedItems });
      });

      console.log(`Pesanan ${orderId} berhasil diajukan komplain dengan pesan: ${complainMessage}`);
      setComplainMessage(""); // Clear the message input after successful complain
      setComplainOrderId(null); // Reset the complain order ID
    } catch (err) {
      console.error("Gagal mengajukan komplain: ", err);
      setError(`Gagal mengajukan komplain: ${err.message}`);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    if (!firestore || !userId) {
      setError("Firebase Firestore tidak tersedia atau pengguna belum login.");
      return;
    }
    setIsUpdating("confirm");

    try {
      const orderRef = doc(firestore, "orders", orderId);

      await runTransaction(firestore, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw "Dokumen pesanan tidak ditemukan!";
        }

        const data = orderDoc.data();
        const sellersToUpdate = new Map();

        const updatedItems = data.items.map((item) => {
          if (
            item.status_barang?.toLowerCase() === "sampai di tujuan" ||
            item.status_barang?.toLowerCase() === "delivered"
          ) {
            const itemSubtotal = item.harga * item.qty;
            const sellerId = item.id_penjual;

            sellersToUpdate.set(
              sellerId,
              (sellersToUpdate.get(sellerId) || 0) + itemSubtotal
            );

            return { ...item, status_barang: "diterima pembeli" };
          }
          return item;
        });

        const allItemsConfirmed = updatedItems.every(
          (item) =>
            item.status_barang?.toLowerCase() === "diterima pembeli" ||
            !["sampai di tujuan", "delivered"].includes(
              item.status_barang?.toLowerCase()
            )
        );

        if (!allItemsConfirmed) {
          console.warn(
            "Beberapa item mungkin tidak diubah statusnya menjadi 'diterima pembeli' karena status awal tidak 'sampai di tujuan'/'delivered'."
          );
        }

        transaction.update(orderRef, { items: updatedItems });

        for (let [sellerId, amount] of sellersToUpdate.entries()) {
          const sellerRef = doc(firestore, "users", sellerId);
          transaction.update(sellerRef, {
            saldo: increment(amount),
          });
        }
      });

      console.log(
        `Pesanan ${orderId} berhasil dikonfirmasi dan saldo penjual diperbarui.`
      );
    } catch (err) {
      console.error(
        "Gagal mengkonfirmasi penerimaan dan/atau update saldo: ",
        err
      );
      setError(`Gagal mengkonfirmasi penerimaan: ${err.message}`);
    } finally {
      setIsUpdating(null);
    }
  };

  useEffect(() => {
    if (!auth) {
      setError("Firebase Auth tidak tersedia");
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log("User authenticated:", user.uid);
      } else {
        setUserId(null);
        setError("Pengguna belum login");
        setLoading(false);
        console.log("User not authenticated");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeFirestore = null;

    if (!firestore) {
      setError("Firebase Firestore tidak tersedia");
      setLoading(false);
      return;
    }

    if (!userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ordersCollectionRef = collection(firestore, "orders");
      const q = query(ordersCollectionRef, where("userId", "==", userId));

      unsubscribeFirestore = onSnapshot(
        q,
        (querySnapshot) => {
          const orders = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("Document data:", doc.id, data);

            const items = data.items
              ? data.items.map((item) => ({
                  name: item.nama || "Nama item tidak diketahui",
                  quantity: item.qty || 0,
                  price: `Rp${(item.harga || 0).toLocaleString("id-ID")}`,
                  productId: item.productId,
                  status_barang: item.status_barang,
                  id_penjual: item.id_penjual,
                  pesanKomplain: item.pesanKomplain || '', // Include complain message
                }))
              : [];

            const determinedStatus = getOverallStatus(items);

            orders.push({
              id: doc.id,
              date: formatDate(data.tanggal_pemesanan || data.createdAt || data.Alamat?.createdAt),
              status: determinedStatus,
              address: formatAddress(data.alamat_pengiriman || data.alamat || data.Alamat || data.shipping_address),
              items: items,
              shippingCost: `Rp${(data.shippingCost || 0).toLocaleString(
                "id-ID"
              )}`,
              subtotal: `Rp${(data.subtotal || 0).toLocaleString("id-ID")}`,
              total: `Rp${(data.totalBayar || 0).toLocaleString("id-ID")}`,
              trackingNumber: data.trackingNumber || "N/A",
              deliveredDate: data.deliveredDate
                ? new Date(data.deliveredDate).toLocaleDateString("id-ID")
                : "N/A",
              carrier: data.carrier || "N/A",
              estimatedDelivery: data.estimatedDelivery
                ? new Date(data.estimatedDelivery).toLocaleDateString("id-ID")
                : "N/A",
              estimatedShipping: data.estimatedShipping
                ? new Date(data.estimatedShipping).toLocaleDateString("id-ID")
                : "N/A",
              cancelledDate: data.cancelledDate
                ? new Date(data.cancelledDate).toLocaleDateString("id-ID")
                : "N/A",
              cancelReason: data.cancelReason || "N/A",
            });
          });

          console.log("Orders fetched:", orders.length);
          setDeliveryHistory(orders);
          setLoading(false);
        },
        (firestoreError) => {
          console.error("Error fetching orders: ", firestoreError);
          setError(`Gagal mengambil data pesanan: ${firestoreError.message}`);
          setDeliveryHistory([]);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error setting up Firestore listener:", err);
      setError(`Terjadi kesalahan saat menyiapkan koneksi data: ${err.message}`);
      setLoading(false);
    }

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [userId]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
    setComplainMessage(""); // Clear message when collapsing/expanding
    setComplainOrderId(expandedOrder === orderId ? null : orderId); // Set the current order ID for complain
  };

  const homepage = () => {
    navigate("/profile");
  };

  const filteredDeliveries = deliveryHistory.filter((delivery) => {
    if (activeTab === "Sedang Dikirim") {
      return (
        delivery.status === "Sedang Dikirim" ||
        delivery.status === "Dikirim Balik"
      );
    }
    const matchesSearch =
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (delivery.items &&
        delivery.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    const matchesStatus =
      statusFilter === "all" ||
      (delivery.status &&
        delivery.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    const { icon: Icon, iconClass } = getStatusInfo(status);
    return <Icon className={`h-5 w-5 ${iconClass}`} />;
  };

  const getStatusBadge = (status) => {
    const { label, badgeClass } = getStatusInfo(status);
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClass}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #4a2362 0%, #08001a 100%)",
        }}
      >
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-white mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-white text-lg">Memuat riwayat pengiriman...</p>
          {userId && (
            <p className="text-white text-sm mt-2">User ID: {userId}</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #4a2362 0%, #08001a 100%)",
        }}
      >
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-xl">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #4a2362 0%, #08001a 100%)",
      }}
    >
      <div className="container rounded-2xl mx-auto px-4 py-8 max-w-6xl shadow-2xl">
        <div
          onClick={homepage}
          className="flex items-center mb-6 cursor-pointer group"
        >
          <HomeIcon className="h-6 w-6 mr-2 text-white group-hover:text-purple-300 transition-colors" />
          <p className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
            Kembali
          </p>
        </div>

        <div className="flex items-center mb-6">
          <Package className="h-6 w-6 mr-2 text-white" />
          <h1 className="text-2xl font-bold text-white">History Pengiriman</h1>
        </div>

        {userId && (
          <p className="text-xs text-gray-400 mb-4">User ID: {userId}</p>
        )}

        <div className="mb-6">
          <div className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-8 bg-[#ffffff22] p-1 rounded-lg">
            {[
              "all",
              "Menunggu Penjual",
              "Diproses Penjual",
              "Menunggu Kurir",
              "Sedang Dikirim",
              "Sampai di Tujuan",
              "Diterima Pembeli",
              "Dikomplain",
            ].map((tab) => (
              <button
                key={tab}
                className={`py-2 px-1 cursor-pointer text-xs sm:text-sm font-medium rounded-md transition-colors text-white ${
                  activeTab === tab
                    ? "bg-black bg-opacity-50 text-[#a774d0] shadow"
                    : "hover:bg-[#ffffff33]"
                }`}
                onClick={() => {
                  setStatusFilter(tab.toLowerCase());
                  setActiveTab(tab);
                }}
              >
                {tab === "all"
                  ? "Semua"
                  : tab === "Menunggu Penjual"
                  ? "Menunggu Penjual"
                  : tab === "Diproses Penjual"
                  ? "Diproses Penjual"
                  : tab === "Menunggu Kurir"
                  ? "Menunggu Kurir"
                  : tab === "Sedang Dikirim"
                  ? "Sedang Dikirim"
                  : tab === "Sampai di Tujuan"
                  ? "Sampai di Tujuan"
                  : tab === "Dikomplain"
                  ? "Dikomplain"
                  : tab === "Diterima Pembeli"
                  ? "Diterima Pembeli"
                  : "Status Tidak Diketahui"}
              </button>
            ))}
          </div>

          <div className="mt-4 bg-white border border-[#75379944] rounded-lg p-4 text-[#100428]">
            {activeTab === "all" && (
              <div>
                <h2 className="text-lg font-semibold">Semua Pesanan</h2>
                <p className="text-sm text-gray-600">
                  Lihat semua pesanan Anda di masa lalu dan saat ini.
                </p>
              </div>
            )}
            {activeTab === "Diproses Penjual" && (
              <div>
                <h2 className="text-lg font-semibold">Proses Pengiriman</h2>
                <p className="text-sm text-gray-600">
                  Barang sedang diproses oleh penjual agar siap untuk dikirim.
                </p>
              </div>
            )}
            {activeTab === "Menunggu Kurir" && (
              <div>
                <h2 className="text-lg font-semibold">Menunggu Kurir</h2>
                <p className="text-sm text-gray-600">
                  Barang telah diproses dan menunggu kurir untuk mengambil
                  barang Anda.
                </p>
              </div>
            )}
            {activeTab === "Sedang Dikirim" && (
              <div>
                <h2 className="text-lg font-semibold">Sedang Dikirim</h2>
                <p className="text-sm text-gray-600">
                  Pesanan sedang dalam proses pengiriman.
                </p>
              </div>
            )}
            {activeTab === "Sampai di Tujuan" && (
              <div>
                <h2 className="text-lg font-semibold">
                  Pesanan Sampai di Tujuan
                </h2>
                <p className="text-sm text-gray-600">
                  Pesanan telah tiba di tujuan, menunggu konfirmasi penerimaan.
                </p>
              </div>
            )}
            {activeTab === "Dikomplain" && (
              <div>
                <h2 className="text-lg font-semibold">Pesanan Dikomplain</h2>
                <p className="text-sm text-gray-600">
                  Pesanan yang telah dikomplain.
                </p>
              </div>
            )}
            {activeTab === "Menunggu Penjual" && (
              <div>
                <h2 className="text-lg font-semibold">Menunggu Penjual</h2>
                <p className="text-sm text-gray-600">
                  Pesanan Anda sedang menunggu konfirmasi atau persiapan dari
                  penjual.
                </p>
              </div>
            )}
            {activeTab === "Diterima Pembeli" && (
              <div>
                <h2 className="text-lg font-semibold">Pesanan Diterima</h2>
                <p className="text-sm text-gray-600">
                  Pesanan telah berhasil diterima dan dikonfirmasi.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
            <input
              type="text"
              placeholder="Cari berdasarkan ID pesanan atau nama barang"
              className="w-full pl-10 pr-4 py-2 border border-[#ffffff33] rounded-md bg-[#ffffff22] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#753799]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredDeliveries.length === 0 ? (
          <div className="text-center py-12 text-white">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Tidak ada riwayat pengiriman ditemukan
            </h3>
            <p className="text-gray-300">
              Coba sesuaikan pencarian atau filter Anda, atau{" "}
              <span className="font-semibold">mulai berbelanja sekarang</span>{" "}
              untuk melihat pesanan Anda di sini!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="border border-[#ffffff33] rounded-lg overflow-hidden shadow-sm bg-white text-[#100428]"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-[#75379911] transition-colors"
                  onClick={() => toggleOrderDetails(delivery.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(delivery.status)}
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">
                          {delivery.id}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {delivery.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      {getStatusBadge(delivery.status)}
                      {expandedOrder === delivery.id ? (
                        <ChevronUp className="h-5 w-5 text-[#753799]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#753799]" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedOrder === delivery.id && (
                  <div className="px-4 pb-4 pt-0">
                    <hr className="mb-4 border-gray-200" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-purple-600" />{" "}
                          Alamat Pengiriman
                        </h4>
                        <p className="text-sm text-gray-600 break-words">
                          {delivery.address}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-purple-600" />{" "}
                          Tanggal & Detail Pengiriman
                        </h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">
                              Tanggal Pemesanan:
                            </span>{" "}
                            {delivery.date}
                          </p>
                          {(delivery.status.toLowerCase() ===
                            "sampai di tujuan" ||
                            delivery.status.toLowerCase() ===
                              "diterima pembeli") && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Diterima pada:
                              </span>{" "}
                              {delivery.deliveredDate} via {delivery.carrier}
                            </p>
                          )}
                          {(delivery.status.toLowerCase() ===
                            "sedang dikirim" ||
                            delivery.status.toLowerCase() ===
                              "dalam perjalanan") && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Estimasi diterima:
                              </span>{" "}
                              {delivery.estimatedDelivery} via{" "}
                              {delivery.carrier}
                            </p>
                          )}
                          {(delivery.status.toLowerCase() ===
                            "menunggu penjual" ||
                            delivery.status.toLowerCase() ===
                              "diproses penjual" ||
                            delivery.status.toLowerCase() ===
                              "menunggu kurir") && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Estimasi pengiriman:
                              </span>{" "}
                              {delivery.estimatedShipping}
                            </p>
                          )}
                          {(delivery.status.toLowerCase() === "dikomplain" ||
                            delivery.status.toLowerCase() === "dibatalkan") && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">
                                Dikomplain pada:
                              </span>{" "}
                              {delivery.cancelledDate} -{" "}
                              {delivery.cancelReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Box className="h-4 w-4 mr-1 text-purple-600" /> Barang
                      Pesanan
                    </h4>
                    <div className="bg-[#75379911] rounded-md p-3 mb-4">
                      {delivery.items &&
                        delivery.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 items-center"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#75379933] rounded-md flex items-center justify-center">
                                <Package className="h-4 w-4 text-[#753799]" />
                              </div>
                              <span className="text-sm">
                                {item.name} &times; {item.quantity}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {item.price}
                            </span>
                            {item.pesanKomplain && item.status_barang === "dikomplain" && (
                              <p className="text-xs text-red-500 italic mt-1">
                                Pesan Komplain: {item.pesanKomplain}
                              </p>
                            )}
                          </div>
                        ))}
                      <hr className="my-2 border-gray-200" />
                      <div className="flex justify-between py-1 text-sm">
                        <span>Subtotal</span>
                        <span>{delivery.subtotal}</span>
                      </div>
                      <div className="flex justify-between py-1 text-sm">
                        <span>Ongkos Kirim</span>
                        <span>{delivery.shippingCost}</span>
                      </div>
                      <hr className="my-2 border-gray-300" />
                      <div className="flex justify-between py-2 font-bold">
                        <span className="text-sm">Total Pembayaran</span>
                        <span className="text-sm">{delivery.total}</span>
                      </div>
                    </div>

                    {/* Complain input and buttons */}
                    {(delivery.status.toLowerCase() === "dikirim" ||
                      delivery.status.toLowerCase() === "sampai di tujuan" ||
                      delivery.status.toLowerCase() === "diterima pembeli") && // Allow complain even after confirmed, if needed
                      delivery.status.toLowerCase() !== "dikomplain" && ( // Don't show complain button if already complained
                      <div className="mb-4">
                        <label htmlFor={`complain-message-${delivery.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Pesan Komplain:
                        </label>
                        <textarea
                          id={`complain-message-${delivery.id}`}
                          className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                          rows="3"
                          value={complainOrderId === delivery.id ? complainMessage : ""} // Only show message for the expanded order
                          onChange={(e) => setComplainMessage(e.target.value)}
                          placeholder="Jelaskan masalah Anda di sini..."
                          disabled={isUpdating !== null}
                        ></textarea>
                        <div className="text-right">
                          <button
                            onClick={() => handleComplain(delivery.id)}
                            disabled={isUpdating === "complain" || !complainMessage.trim()}
                            className={`px-4 py-2 rounded-md transition-colors ${
                              isUpdating === "complain" || !complainMessage.trim()
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                          >
                            {isUpdating === "complain" ? (
                              <span className="flex items-center justify-center">
                                <svg
                                  className="animate-spin h-4 w-4 mr-2 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Memproses...
                              </span>
                            ) : (
                              "Ajukan Komplain"
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {/* End Complain input and buttons */}


                    {(delivery.status.toLowerCase() === "sampai di tujuan") && (
                      <div className="mb-4 text-right">
                        <button
                          onClick={() =>
                            handleConfirmDelivery(delivery.id, delivery.items)
                          }
                          disabled={isUpdating !== null}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            isUpdating === "confirm"
                              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                              : "bg-purple-600 hover:bg-purple-700 text-white"
                          }`}
                        >
                          {isUpdating === "confirm"
                            ? <span className="flex items-center justify-center">
                                <svg
                                  className="animate-spin h-4 w-4 mr-2 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Memproses...
                              </span>
                            : "Konfirmasi Barang Diterima"}
                        </button>
                      </div>
                    )}

                    {(delivery.status.toLowerCase() === "sampai di tujuan" ||
                      delivery.status.toLowerCase() === "diterima pembeli" ||
                      delivery.status.toLowerCase() === "sedang dikirim" ||
                      delivery.status.toLowerCase() === "dalam perjalanan") &&
                      delivery.trackingNumber &&
                      delivery.trackingNumber !== "N/A" && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">
                              No. Resi: {delivery.trackingNumber}
                            </p>
                            <button
                              onClick={() => window.open(`https://www.aftership.com/track/${delivery.carrier ? delivery.carrier.toLowerCase().replace(/\s/g, '') : ''}/${delivery.trackingNumber}`, '_blank')} // Example tracking site
                              className="ml-auto px-3 py-1 text-sm border border-[#753799] text-[#753799] rounded-md hover:bg-[#75379922] transition-colors"
                            >
                              Lacak Paket
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPengiriman;