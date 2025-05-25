import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Truck,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  Box,
  HomeIcon,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { firestore } from "../../firebase"

/* -------------------------- util konversi ------------------------- */
// konversi status_firestore → status_UI
const mapStatus = (s) => {
  switch (s.toLowerCase()) {
    case "menunggu penjual":
    case "diproses":
      return "Processing";
    case "dalam perjalanan":
      return "In Transit";
    case "dikirim":
    case "selesai":
      return "Delivered";
    case "dibatalkan":
      return "Cancelled";
    default:
      return s; // fallback
  }
};

// format Rupiah
const toIDR = (v) =>
  v?.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

/* ================================================================= */
const DeliveryHistory = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const navigate = useNavigate();

  const userId =
    JSON.parse(localStorage.getItem("user"))?.id ||
    null;

  /* ----------------------- Ambil data Firestore ---------------------- */
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(firestore, "history", userId, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const o = d.data();
        return {
          id: d.id,
          ...o,
          status: mapStatus(o.status_pengiriman || ""), // normalkan
          date: o.createdAt?.toDate().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        };
      });
      setOrders(data);
    });
    return () => unsub();
  }, [userId]);

  /* ----------------------- Filter + search --------------------------- */
  const filteredDeliveries = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        o.id.toLowerCase().includes(q) ||
        o.items?.some((it) => it.name.toLowerCase().includes(q));
      const matchTab =
        activeTab === "all" || o.status.toLowerCase() === activeTab.toLowerCase();
      return matchSearch && matchTab;
    });
  }, [orders, searchQuery, activeTab]);

  /* ----------------------- helper UI -------------------------------- */
  const toggleOrderDetails = useCallback(
    (id) => setExpandedOrder((curr) => (curr === id ? null : id)),
    []
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "In Transit":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "Processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Processing":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Proses Pengiriman
          </span>
        );
      case "Delivered":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Dikirim
          </span>
        );
      case "In Transit":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Dalam Perjalanan
          </span>
        );
      case "Cancelled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-300">
            {status}
          </span>
        );
    }
  };

  /* ----------------------- Render ----------------------------------- */
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg,#4a2362 0%,#08001a 100%)" }}
    >
      <div className="container mx-auto max-w-4xl px-4 py-8 shadow-2xl rounded-2xl">
        {/* Back */}
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center mb-6 cursor-pointer"
        >
          <HomeIcon className="h-6 w-6 mr-2 text-white" />
          <p className="text-xl font-bold text-white">Kembali</p>
        </div>

        {/* Header */}
        <div className="flex items-center mb-6">
          <Package className="h-6 w-6 mr-2 text-white" />
          <h1 className="text-2xl font-bold text-white">History Pengiriman</h1>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="grid grid-cols-5 w-full p-1 bg-[#ffffff22] rounded-lg">
            {["all", "Processing", "In Transit", "Delivered", "Cancelled"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 text-sm font-medium text-white rounded-md transition-colors ${
                    activeTab === tab
                      ? "bg-black text-[#753799] shadow"
                      : "hover:bg-[#ffffff33]"
                  }`}
                >
                  {tab === "all"
                    ? "Semua Pesanan"
                    : tab === "Processing"
                    ? "Proses Pengiriman"
                    : tab === "In Transit"
                    ? "Dalam Perjalanan"
                    : tab === "Delivered"
                    ? "Dikirim"
                    : "Dibatalkan"}
                </button>
              )
            )}
          </div>

          {/* Tab description */}
          <div className="mt-4 bg-white border border-[#75379944] rounded-lg p-4 text-[#100428]">
            {activeTab === "all" && (
              <p className="text-sm text-gray-600">
                Lihat semua pesanan Anda di masa lalu dan saat ini.
              </p>
            )}
            {activeTab === "Processing" && (
              <p className="text-sm text-gray-600">
                Barang telah diproses dan siap dikirim.
              </p>
            )}
            {activeTab === "In Transit" && (
              <p className="text-sm text-gray-600">
                Pesanan sedang dalam perjalanan.
              </p>
            )}
            {activeTab === "Delivered" && (
              <p className="text-sm text-gray-600">
                Pesanan telah berhasil dikirim.
              </p>
            )}
            {activeTab === "Cancelled" && (
              <p className="text-sm text-gray-600">
                Pesanan yang telah dibatalkan.
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
          <input
            type="text"
            placeholder="Cari ID pesanan atau nama barang"
            className="w-full pl-10 pr-4 py-2 bg-[#ffffff22] border border-[#ffffff33] rounded-md text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#753799]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* List */}
        {filteredDeliveries.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-white mb-4" />
            <h3 className="text-lg font-medium mb-2">Tidak ada pesanan</h3>
            <p className="text-white">
              Ubah pencarian atau filter untuk menemukan pesanan.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((order) => (
              <div
                key={order.id}
                className="bg-white text-[#100428] border border-[#ffffff33] rounded-lg shadow-sm overflow-hidden"
              >
                {/* Row */}
                <div
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-[#75379911]"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-medium">{order.id}</h3>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    {expandedOrder === order.id ? (
                      <ChevronUp className="h-5 w-5 text-[#753799]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#753799]" />
                    )}
                  </div>
                </div>

                {/* Detail */}
                {expandedOrder === order.id && (
                  <div className="px-4 pb-4">
                    <hr className="mb-4 border-gray-200" />

                    {/* Alamat & detail */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* alamat */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Alamat Pengiriman
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.alamat?.nama},{" "}
                          {order.alamat?.alamat_lengkap} ({order.alamat?.no_hp})
                        </p>
                      </div>

                      {/* detail waktu */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Rincian
                        </h4>
                        {order.status === "Delivered" && (
                          <p className="text-sm text-gray-600">
                            Dikirim pada {order.date}
                          </p>
                        )}
                        {order.status === "In Transit" && (
                          <p className="text-sm text-gray-600">
                            Dalam perjalanan — harap ditunggu
                          </p>
                        )}
                        {order.status === "Processing" && (
                          <p className="text-sm text-gray-600">
                            Menunggu penjual memproses pesanan
                          </p>
                        )}
                        {order.status === "Cancelled" && (
                          <p className="text-sm text-gray-600">
                            Pesanan dibatalkan
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Box className="h-4 w-4 mr-1" />
                      Items
                    </h4>
                    <div className="bg-[#75379911] rounded-md p-3 mb-4">
                      {order.items?.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#75379933] rounded-md flex justify-center items-center">
                              <Package className="h-4 w-4 text-[#753799]" />
                            </div>
                            <span className="text-sm">
                              {it.name} × {it.qty}
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {toIDR(it.price)}
                          </span>
                        </div>
                      ))}
                      <hr className="my-2 border-gray-200" />
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium">Subtotal</span>
                        <span className="text-sm font-medium">
                          {toIDR(order.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium">Ongkir</span>
                        <span className="text-sm font-medium">
                          {toIDR(order.shippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-sm font-semibold">
                          {toIDR(order.totalBayar)}
                        </span>
                      </div>
                    </div>
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

export default DeliveryHistory;
