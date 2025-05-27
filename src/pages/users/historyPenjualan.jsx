"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  CheckCircle,
  Truck,
  Clock,
  AlertCircle,
  Box,
  HomeIcon,
  Send, // Icon baru untuk Panggil Kurir
  UserCheck, // Icon baru untuk Diproses Penjual
} from "lucide-react";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { firestore, auth } from "../../firebase";

function formatFirestoreTimestampToDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return "Tanggal Tidak Diketahui";
  }
  try {
    const dateObj = timestamp.toDate();
    const options = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Makassar',
    };
    return dateObj.toLocaleDateString('id-ID', options);
  } catch (error) {
    console.error("Error formatting Firestore Timestamp:", error);
    return "Gagal Format";
  }
}

const HistoryPenjualan = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingItem, setIsUpdatingItem] = useState(null); // Format: `${productId}_${targetStatus}`
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) {
      setError("Layanan Firebase Auth tidak tersedia.");
      setIsLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else {
        setUserId(null);
        setError("Pengguna belum login.");
        setIsLoading(false);
        setOrders([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Definisikan fetchOrders di scope komponen, dibungkus useCallback
  const ordersCollectionPath = "orders"; // Bisa didefinisikan di sini jika konstan

  const fetchOrders = useCallback(async () => {
    // Guard clause: hanya fetch jika userId dan firestore tersedia
    if (!userId || !firestore) {
      // Jika userId tidak ada (misalnya saat logout), pastikan orders kosong dan loading berhenti
      if (!userId) {
        setOrders([]);
        setIsLoading(false); 
      }
      // Jika firestore tidak ada, mungkin tampilkan error spesifik atau biarkan
      if (!firestore && userId) { // Jika user ada tapi firestore tidak, ini error konfigurasi
          setError("Layanan Firestore tidak tersedia untuk fetchOrders.");
          setIsLoading(false);
          setOrders([]);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const q = query(
        collection(firestore, ordersCollectionPath),
        where("item_ids_penjual", "array-contains", userId)
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrdersData = querySnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
      setOrders(fetchedOrdersData);
    } catch (err) {
      console.error("Error mengambil dokumen pesanan: ", err);
      setError(err); // Simpan objek error
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Dependensi utama adalah userId. firestore dan ordersCollectionPath diasumsikan stabil.
                  // Setter (setIsLoading, setError, setOrders) stabil dan tidak perlu dependensi.

  // 2. Efek untuk mengambil data pesanan ketika userId berubah
  useEffect(() => {
    if (userId && firestore) { // Panggil fetchOrders jika userId dan firestore sudah siap
      fetchOrders();
    }
    // Jika userId menjadi null (logout), fetchOrders di atas akan handle clear state
  }, [userId, fetchOrders]);

  const handleChangeItemStatus = useCallback(async (orderId, productIdToUpdate, newStatus) => {
    if (!firestore) {
      setError("Layanan Firestore tidak tersedia.");
      return;
    }
    setIsUpdatingItem(`${productIdToUpdate}_${newStatus}`);
    setError(null);
    const orderRef = doc(firestore, "orders", orderId);

    try {
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) throw new Error("Pesanan tidak ditemukan.");
      
      const orderData = orderSnap.data();
      const currentItems = orderData.items || [];
      let itemFound = false;

      const updatedItems = currentItems.map(item => {
        if (item.productId === productIdToUpdate) {
          itemFound = true;
          return { ...item, status_barang: newStatus };
        }
        return item;
      });

      if (!itemFound) throw new Error(`Barang ${productIdToUpdate} tidak ditemukan.`);
      
      await updateDoc(orderRef, { items: updatedItems });
      setOrders(prevOrders =>
        prevOrders.map(o => o.id === orderId ? { ...o, items: updatedItems } : o)
      );
      console.log(`Status barang ${productIdToUpdate} di pesanan ${orderId} -> ${newStatus}`);
    } catch (err) {
      console.error(`Gagal mengubah status barang ke ${newStatus}:`, err);
      setError(typeof err === 'string' ? err : err.message || `Gagal update ke ${newStatus}.`);
    } finally {
      setIsUpdatingItem(null);
    }
  }, []); // setOrders, setError, setIsLoading dihapus dari dependensi karena setter dari useState stabil

  const processedItems = useMemo(() => {
    let allSellerItems = [];
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items
          .filter(item => item.id_penjual === userId)
          .forEach(item => {
            allSellerItems.push({
              ...item,
              orderId: order.id,
              orderDate: formatFirestoreTimestampToDate(order.createdAt),
              itemStatus: item.status_barang || "baru", // Default ke "baru" jika status_barang kosong
            });
          });
      }
    });

    const itemsFilteredByStatus = statusFilter === "all"
      ? allSellerItems
      : allSellerItems.filter(itemL => itemL.itemStatus && itemL.itemStatus.toLowerCase() === statusFilter.toLowerCase());

    if (!searchQuery.trim()) return itemsFilteredByStatus;
    
    const lowerSearchQuery = searchQuery.toLowerCase();
    return itemsFilteredByStatus.filter(itemL => 
      (itemL.nama && itemL.nama.toLowerCase().includes(lowerSearchQuery)) ||
      (itemL.orderId && itemL.orderId.toLowerCase().includes(lowerSearchQuery)) ||
      (itemL.productId && itemL.productId.toLowerCase().includes(lowerSearchQuery))
    );
  }, [orders, statusFilter, searchQuery, userId]);

  const homepage = () => navigate("/profile");

  const getStatusIcon = (itemStatus) => {
    const statusLower = itemStatus ? itemStatus.toLowerCase() : 'baru';
    switch (statusLower) {
      case "baru": return <Package className="h-5 w-5 text-gray-500" />; // Status awal
      case "diproses penjual": return <UserCheck className="h-5 w-5 text-indigo-500" />;
      case "menunggu kurir": return <Clock className="h-5 w-5 text-orange-500" />;
      case "dalam perjalanan": case "in transit": return <Truck className="h-5 w-5 text-blue-500" />;
      case "dikirim": case "delivered": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "dibatalkan": case "cancelled": return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (itemStatus) => {
    const statusLower = itemStatus ? itemStatus.toLowerCase() : 'baru';
    switch (statusLower) {
      case "baru": return ( <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-300"> Baru </span> );
      case "diproses penjual": return ( <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800"> Diproses Penjual </span> );
      case "menunggu kurir": return ( <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800"> Menunggu Kurir </span> );
      case "dalam perjalanan": case "in transit": return ( <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"> Dlm Perjalanan </span> );
      case "dikirim": case "delivered": return ( <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 w-max"> Terkirim </span> );
      case "dibatalkan": case "cancelled": return ( <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"> Dibatalkan </span> );
      default: return ( <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-300"> {itemStatus || "Baru"} </span> );
    }
  };
  
  // Nilai-nilai status yang diketahui (untuk logika tombol dan filter tab)
  const KNOWN_STATUSES = {
    BARU: "menunggu penjual", // Atau status awal Anda jika berbeda
    DIPROSES_PENJUAL: "diproses penjual",
    MENUNGGU_KURIR: "menunggu kurir",
    DALAM_PERJALANAN: "dalam perjalanan", // gabung dengan in transit
    IN_TRANSIT: "in transit",
    DIKIRIM: "dikirim", // gabung dengan delivered
    DELIVERED: "delivered",
    DIBATALKAN: "dibatalkan", // gabung dengan cancelled
    CANCELLED: "cancelled",
  };


  if (isLoading && orders.length === 0) {
    // ... loading UI ...
    return ( <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4a2362 0%, #08001a 100%)" }}> <div className="text-center"> <svg className="animate-spin h-10 w-10 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <p className="text-white text-lg">Memuat riwayat penjualan...</p> </div> </div> );
  }

  if (error && !isUpdatingItem) {
    // ... error UI ...
    return ( <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4a2362 0%, #08001a 100%)" }}> <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-xl"> <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" /> <h2 className="text-2xl font-bold text-white mb-2">Terjadi Kesalahan</h2> <p className="text-red-300 mb-4">{typeof error === 'string' ? error : error.message || "Error tidak diketahui"}</p> <button onClick={() => { setError(null); if(userId) fetchOrders(); else window.location.reload(); }} className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"> Coba Lagi </button> </div> </div> );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #4a2362 0%, #08001a 100%)" }}>
      <div className="container rounded-2xl mx-auto px-4 py-8 max-w-5xl shadow-2xl">
        <div onClick={homepage} className="flex items-center mb-6 cursor-pointer group"> <HomeIcon className="h-6 w-6 mr-2 text-white group-hover:text-purple-300 transition-colors" /> <p className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">Kembali</p> </div>
        <div className="flex items-center mb-6"> <Package className="h-6 w-6 mr-2 text-white" /> <h1 className="text-2xl font-bold text-white">History Penjualan Barang Anda</h1> </div>
        {userId && <p className="text-xs text-gray-400 mb-4">User ID Penjual: {userId}</p>}
        {error && isUpdatingItem && <p className="text-sm text-red-400 bg-red-100 p-2 rounded-md mb-4">Gagal update item: {typeof error === 'string' ? error : error.message}</p>}

        <div className="mb-6">
          <div className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 bg-[#ffffff22] p-1 rounded-lg">
            {/* Disesuaikan dengan alur status baru */}
            {["all", "New", "ProcessingSeller", "WaitingCourier", "InTransit", "Delivered", "Cancelled"].map(
              (tab) => {
                let filterValue = tab.toLowerCase();
                let tabLabel = tab;
                if (tab === "New") { filterValue = KNOWN_STATUSES.BARU; tabLabel = "Menunggu Penjual"; }
                if (tab === "ProcessingSeller") { filterValue = KNOWN_STATUSES.DIPROSES_PENJUAL; tabLabel = "Diproses"; }
                if (tab === "WaitingCourier") { filterValue = KNOWN_STATUSES.MENUNGGU_KURIR; tabLabel = "Menunggu Kurir"; }
                if (tab === "InTransit") { filterValue = KNOWN_STATUSES.DALAM_PERJALANAN; tabLabel = "Dikirim"; } // Atau gabung dengan IN_TRANSIT
                if (tab === "Delivered") { filterValue = KNOWN_STATUSES.DIKIRIM; tabLabel = "Selesai"; } // Atau gabung dengan DELIVERED
                if (tab === "Cancelled") { filterValue = KNOWN_STATUSES.DIBATALKAN; tabLabel = "Batal"; } // Atau gabung dengan CANCELLED
                if (tab === "all") {tabLabel = "Semua";}


                return (
                  <button
                    key={tab}
                    className={`py-2 px-1 cursor-pointer text-xs sm:text-sm font-medium rounded-md transition-colors text-white ${
                      activeTab === tab
                        ? "bg-black bg-opacity-50 text-[#a774d0] shadow"
                        : "hover:bg-[#ffffff33]"
                    }`}
                    onClick={() => {
                      setStatusFilter(filterValue);
                      setActiveTab(tab);
                    }}
                  >
                    {tabLabel}
                  </button>
                );
              }
            )}
          </div>
          {/* ... Deskripsi Tab disesuaikan ... */}
          <div className="mt-4 bg-white border border-[#75379944] rounded-lg p-4 text-[#100428]">
            {activeTab === "all" && ( <div> <h2 className="text-lg font-semibold">Semua Barang Terjual</h2> <p className="text-sm text-gray-600"> Menampilkan semua barang dari semua status. </p> </div> )}
            {activeTab === "New" && ( <div> <h2 className="text-lg font-semibold">Barang Baru / Perlu Diproses</h2> <p className="text-sm text-gray-600"> Barang yang baru masuk atau menunggu untuk Anda proses. </p> </div> )}
            {activeTab === "ProcessingSeller" && ( <div> <h2 className="text-lg font-semibold">Barang Diproses Penjual</h2> <p className="text-sm text-gray-600"> Barang yang sedang Anda siapkan. </p> </div> )}
            {activeTab === "WaitingCourier" && ( <div> <h2 className="text-lg font-semibold">Barang Menunggu Kurir</h2> <p className="text-sm text-gray-600"> Barang siap dijemput kurir. </p> </div> )}
            {activeTab === "InTransit" && ( <div> <h2 className="text-lg font-semibold">Barang Dalam Pengiriman</h2> <p className="text-sm text-gray-600"> Barang sedang dikirim ke pembeli. </p> </div> )}
            {activeTab === "Delivered" && ( <div> <h2 className="text-lg font-semibold">Barang Terkirim</h2> <p className="text-sm text-gray-600"> Barang sudah diterima pembeli. </p> </div> )}
            {activeTab === "Cancelled" && ( <div> <h2 className="text-lg font-semibold">Barang Dibatalkan</h2> <p className="text-sm text-gray-600"> Penjualan barang ini dibatalkan. </p> </div> )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6"> <div className="relative flex-1"> <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" /> <input type="text" placeholder="Cari nama barang, ID produk, atau ID pesanan" className="w-full pl-10 pr-4 py-2 border border-[#ffffff33] rounded-md bg-[#ffffff22] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#753799]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> </div> </div>

        {processedItems.length === 0 && !isLoading ? (
          <div className="text-center py-12"> <Box className="h-12 w-12 mx-auto text-gray-400 mb-4" /> <h3 className="text-lg font-medium mb-2 text-white"> Tidak ada barang penjualan ditemukan </h3> <p className="text-gray-300"> Sesuaikan filter atau Anda belum memiliki barang yang cocok. </p> </div>
        ) : (
          <div className="space-y-4">
            {processedItems.map((item, index) => {
              const itemStatusLower = item.itemStatus ? item.itemStatus.toLowerCase() : KNOWN_STATUSES.BARU;
              
              // Tentukan apakah tombol "Proses Pesanan" harus ditampilkan
              // Tampil jika statusnya adalah "baru" (atau state awal yang Anda definisikan)
              const showProsesButton = itemStatusLower === KNOWN_STATUSES.BARU;

              // Tentukan apakah tombol "Panggil Kurir" harus ditampilkan
              // Tampil hanya jika statusnya adalah "diproses penjual"
              const showPanggilKurirButton = itemStatusLower === KNOWN_STATUSES.DIPROSES_PENJUAL;

              return (
                <div
                  key={`${item.orderId}-${item.productId || 'item'}-${index}`}
                  className="border border-[#ffffff33] rounded-lg shadow-sm bg-white text-[#100428] p-4 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      {getStatusIcon(item.itemStatus)}
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg">{item.nama || "Nama Barang Tidak Ada"}</h3>
                        <p className="text-xs text-gray-500">Produk ID: {item.productId || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-left sm:text-right">
                      <p className="text-sm font-medium text-purple-700">Rp{Number(item.harga || 0).toLocaleString('id-ID')} &times; {item.qty || 0}</p>
                      <p className="text-sm font-bold text-purple-800">Subtotal Item: Rp{Number(item.subtotal || (item.harga * item.qty) || 0).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <hr className="my-3 border-gray-200" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-600">
                    <div className="mb-2 sm:mb-0">
                      <p><span className="font-medium">Dari Pesanan ID:</span> {item.orderId}</p>
                      <p><span className="font-medium">Tanggal Pesan:</span> {item.orderDate}</p>
                    </div>
                    <div className="flex flex-col items-stretch sm:items-end space-y-1 mt-2 sm:mt-0 w-full sm:w-auto"> {/* Container untuk badge & tombol */}
                      <div className="self-stretch sm:self-end">
                        {getStatusBadge(item.itemStatus)}
                      </div>
                      {showProsesButton && (
                        <button
                          onClick={() => handleChangeItemStatus(item.orderId, item.productId, KNOWN_STATUSES.DIPROSES_PENJUAL)}
                          disabled={isUpdatingItem === `${item.productId}_${KNOWN_STATUSES.DIPROSES_PENJUAL}`}
                          className={`py-1 px-3 text-xs rounded-full transition-colors w-full mt-1
                                      ${isUpdatingItem === `${item.productId}_${KNOWN_STATUSES.DIPROSES_PENJUAL}`
                                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                        >
                          {isUpdatingItem === `${item.productId}_${KNOWN_STATUSES.DIPROSES_PENJUAL}` ? "Memproses..." : "Proses Pesanan"}
                        </button>
                      )}
                      {showPanggilKurirButton && (
                        <button
                          onClick={() => handleChangeItemStatus(item.orderId, item.productId, KNOWN_STATUSES.MENUNGGU_KURIR)}
                          disabled={isUpdatingItem === `${item.productId}_${KNOWN_STATUSES.MENUNGGU_KURIR}`}
                          className={`py-1 px-3 text-xs rounded-full transition-colors w-full mt-1
                                      ${isUpdatingItem === `${item.productId}_${KNOWN_STATUSES.MENUNGGU_KURIR}`
                                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                        : "bg-orange-500 hover:bg-orange-600 text-white"}`}
                        >
                          {isUpdatingItem === `${item.productId}_${KNOWN_STATUSES.MENUNGGU_KURIR}` ? "Memanggil..." : "Panggil Kurir"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPenjualan;