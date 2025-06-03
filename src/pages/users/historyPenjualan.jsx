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
  UserCheck,
} from "lucide-react";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { firestore, auth } from "../../firebase";

function formatFirestoreTimestampToDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") {
    return "Tanggal Tidak Diketahui";
  }
  try {
    const dateObj = timestamp.toDate();
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Makassar",
    };
    return dateObj.toLocaleDateString("id-ID", options);
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
  const [isUpdatingItem, setIsUpdatingItem] = useState(null);
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

  const ordersCollectionPath = "orders";

  const fetchOrders = useCallback(async () => {
    if (!userId || !firestore) {
      if (!userId) {
        setOrders([]);
        setIsLoading(false);
      }
      if (!firestore && userId) {
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
      const fetchedOrdersData = querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      setOrders(fetchedOrdersData);
    } catch (err) {
      console.error("Error mengambil dokumen pesanan: ", err);
      setError(err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && firestore) {
      fetchOrders();
    }
  }, [userId, fetchOrders]);

  const handleChangeItemStatus = useCallback(
    async (orderId, productIdToUpdate, newStatus) => {
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

        const updatedItems = currentItems.map((item) => {
          if (item.productId === productIdToUpdate) {
            itemFound = true;
            return { ...item, status_barang: newStatus };
          }
          return item;
        });

        if (!itemFound)
          throw new Error(`Barang ${productIdToUpdate} tidak ditemukan.`);

        await updateDoc(orderRef, { items: updatedItems });
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === orderId ? { ...o, items: updatedItems } : o
          )
        );
        console.log(
          `Status barang ${productIdToUpdate} di pesanan ${orderId} -> ${newStatus}`
        );
      } catch (err) {
        console.error(`Gagal mengubah status barang ke ${newStatus}:`, err);
        setError(
          typeof err === "string"
            ? err
            : err.message || `Gagal update ke ${newStatus}.`
        );
      } finally {
        setIsUpdatingItem(null);
      }
    },
    []
  );

  const processedItems = useMemo(() => {
    let allSellerItems = [];
    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items
          .filter((item) => item.id_penjual === userId)
          .forEach((item) => {
            allSellerItems.push({
              ...item,
              orderId: order.id,
              orderDate: formatFirestoreTimestampToDate(order.createdAt),
              itemStatus: item.status_barang || "baru",
            });
          });
      }
    });

    const itemsFilteredByStatus =
      statusFilter === "all"
        ? allSellerItems
        : allSellerItems.filter((itemL) => {
            if (!itemL.itemStatus) return false;

            const currentItemStatus = itemL.itemStatus.toLowerCase();

            console.log(
              "Filtering item:",
              itemL.nama,
              "Status:",
              currentItemStatus
            );
            console.log("Active statusFilter:", statusFilter);

            if (Array.isArray(statusFilter)) {
              const isIncluded = statusFilter.includes(currentItemStatus);
              console.log("Is included in array filter?", isIncluded);
              return isIncluded;
            } else {
              const isMatch = currentItemStatus === statusFilter.toLowerCase();
              console.log("Is exact match for string filter?", isMatch);
              return isMatch;
            }
          });
    if (!searchQuery.trim()) return itemsFilteredByStatus;

    const lowerSearchQuery = searchQuery.toLowerCase();
    return itemsFilteredByStatus.filter(
      (itemL) =>
        (itemL.nama && itemL.nama.toLowerCase().includes(lowerSearchQuery)) ||
        (itemL.orderId &&
          itemL.orderId.toLowerCase().includes(lowerSearchQuery)) ||
        (itemL.productId &&
          itemL.productId.toLowerCase().includes(lowerSearchQuery))
    );
  }, [orders, statusFilter, searchQuery, userId]);

  const homepage = () => navigate("/profile");

  const getStatusIcon = (itemStatus) => {
    const statusLower = itemStatus ? itemStatus.toLowerCase() : "baru";
    switch (statusLower) {
      case "menunggu penjual":
        return <UserCheck className="h-5 w-5 text-gray-500" />;
      case "diproses penjual":
        return <Package className="h-5 w-5 text-indigo-500" />;
      case "menunggu kurir":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "menunggu dikirim balik":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "sedang dikirim":
      case "in transit":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "dikirim balik":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "sampai di tujuan":
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "diterima pembeli":
        return <CheckCircle className="h-5 w-5 text-green-700" />;
      case "dikomplain":
      case "dibatalkan":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (itemStatus) => {
    const statusLower = itemStatus ? itemStatus.toLowerCase() : "baru";
    switch (statusLower) {
      case "menunggu penjual":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-300">
            {" "}
            Menunggu Penjual{" "}
          </span>
        );
      case "diproses penjual":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
            {" "}
            Diproses Penjual{" "}
          </span>
        );
      case "menunggu kurir":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
            {" "}
            Menunggu Kurir{" "}
          </span>
        );
      case "menunggu dikirim balik":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
            {" "}
            Menunggu Dikirim Balik{" "}
          </span>
        );
      case "sedang dikirim":
      case "in transit":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {" "}
            Sedang Dikirim{" "}
          </span>
        );
      case "dikirim balik":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {" "}
            Dikirim Balik{" "}
          </span>
        );
      case "sampai di tujuan":
      case "delivered":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 w-max">
            {" "}
            Sampai di Tujuan{" "}
          </span>
        );
      case "diterima pembeli":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-400 text-green-900 w-max">
            {" "}
            Diterima Pembeli{" "}
          </span>
        );
      case "dikomplain":
      case "dibatalkan":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            {" "}
            Dikomplain{" "}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-300">
            {" "}
            {itemStatus || "Baru"}{" "}
          </span>
        );
    }
  };

  const KNOWN_STATUSES = {
    MENUNGGU_PENJUAL: "menunggu penjual",
    DIPROSES_PENJUAL: "diproses penjual",
    MENUNGGU_KURIR: "menunggu kurir",
    MENUNGGU_DIKIRIM_BALIK: "menunggu dikirim balik",
    SEDANG_DIKIRIM: "sedang dikirim",
    DIKIRIM_BALIK: "dikirim balik",
    IN_TRANSIT: "in transit",
    SAMPAI_DI_TUJUAN: "sampai di tujuan",
    DELIVERED: "delivered",
    DITERIMA_PEMBELI: "diterima pembeli",
    DIKOMPLAIN: "dikomplain",
    DIBATALKAN: "dibatalkan",
  };

  if (isLoading && orders.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #4a2362 0%, #08001a 100%)",
        }}
      >
        {" "}
        <div className="text-center">
          {" "}
          <svg
            className="animate-spin h-10 w-10 text-white mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            {" "}
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>{" "}
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>{" "}
          </svg>{" "}
          <p className="text-white text-lg">Memuat riwayat penjualan...</p>{" "}
        </div>{" "}
      </div>
    );
  }

  if (error && !isUpdatingItem) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #4a2362 0%, #08001a 100%)",
        }}
      >
        {" "}
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-lg shadow-xl">
          {" "}
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />{" "}
          <h2 className="text-2xl font-bold text-white mb-2">
            Terjadi Kesalahan
          </h2>{" "}
          <p className="text-red-300 mb-4">
            {typeof error === "string"
              ? error
              : error.message || "Error tidak diketahui"}
          </p>{" "}
          <button
            onClick={() => {
              setError(null);
              if (userId) fetchOrders();
              else window.location.reload();
            }}
            className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            {" "}
            Coba Lagi{" "}
          </button>{" "}
        </div>{" "}
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
          {" "}
          <HomeIcon className="h-6 w-6 mr-2 text-white group-hover:text-purple-300 transition-colors" />{" "}
          <p className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
            Kembali
          </p>{" "}
        </div>
        <div className="flex items-center mb-6">
          {" "}
          <Package className="h-6 w-6 mr-2 text-white" />{" "}
          <h1 className="text-2xl font-bold text-white">
            History Penjualan Barang Anda
          </h1>{" "}
        </div>
        {userId && (
          <p className="text-xs text-gray-400 mb-4">
            User ID Penjual: {userId}
          </p>
        )}
        {error && isUpdatingItem && (
          <p className="text-sm text-red-400 bg-red-100 p-2 rounded-md mb-4">
            Gagal update item:{" "}
            {typeof error === "string" ? error : error.message}
          </p>
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
            ].map((tab) => {
              let filterValue = tab.toLowerCase();
              let tabLabel = tab;
              if (tab === "Menunggu Penjual") {
                filterValue = KNOWN_STATUSES.MENUNGGU_PENJUAL;
                tabLabel = "Menunggu Penjual";
              }
              if (tab === "Diproses Penjual") {
                filterValue = KNOWN_STATUSES.DIPROSES_PENJUAL;
                tabLabel = "Diproses Penjual";
              }
              if (tab === "Menunggu Kurir") {
                filterValue = [
                  KNOWN_STATUSES.MENUNGGU_KURIR,
                  KNOWN_STATUSES.MENUNGGU_DIKIRIM_BALIK,
                ];
                tabLabel = "Menunggu Kurir";
              }
              if (tab === "Sedang Dikirim") {
                filterValue = [
                  KNOWN_STATUSES.SEDANG_DIKIRIM,
                  KNOWN_STATUSES.DIKIRIM_BALIK,
                ];
                tabLabel = "Sedang Dikirim";
              }
              if (tab === "Sampai di Tujuan") {
                filterValue = KNOWN_STATUSES.SAMPAI_DI_TUJUAN;
                tabLabel = "Sampai di Tujuan";
              }
              if (tab === "Diterima Pembeli") {
                filterValue = KNOWN_STATUSES.DITERIMA_PEMBELI;
                tabLabel = "Diterima Pembeli";
              }
              if (tab === "Dikomplain") {
                filterValue = KNOWN_STATUSES.DIKOMPLAIN;
                tabLabel = "Dikomplain";
              }
              if (tab === "all") {
                tabLabel = "Semua";
              }

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
            })}
          </div>
          <div className="mt-4 bg-white border border-[#75379944] rounded-lg p-4 text-[#100428]">
            {activeTab === "all" && (
              <div>
                {" "}
                <h2 className="text-lg font-semibold">
                  Semua Barang Terjual
                </h2>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  Menampilkan semua barang dari semua status.{" "}
                </p>{" "}
              </div>
            )}
            {activeTab === "Menunggu Penjual" && (
              <div>
                {" "}
                <h2 className="text-lg font-semibold">
                  Barang Perlu Diproses
                </h2>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  Pesanan yang baru masuk, menunggu untuk Anda proses.{" "}
                </p>{" "}
              </div>
            )}
            {activeTab === "Diproses Penjual" && (
              <div>
                {" "}
                <h2 className="text-lg font-semibold">
                  Barang Diproses Penjual
                </h2>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  Barang yang sedang Anda siapkan agar siap dikirim.{" "}
                </p>{" "}
              </div>
            )}
            {activeTab === "Menunggu Kurir" && (
              <div>
                {" "}
                <h2 className="text-lg font-semibold">
                  Barang Menunggu Kurir
                </h2>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  Barang siap dijemput kurir.{" "}
                </p>{" "}
              </div>
            )}
            {activeTab === "Sedang Dikirim" && (
              <div>
                {" "}
                <h2 className="text-lg font-semibold">
                  Barang Dalam Pengiriman
                </h2>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  Barang sedang dikirim ke pembeli.{" "}
                </p>{" "}
              </div>
            )}
            {activeTab === "Sampai di Tujuan" && (
              <div>
                {" "}
                <h2 className="text-lg font-semibold">
                  Barang Sampai di Tujuan
                </h2>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  Barang sudah sampai di alamat pembeli.{" "}
                </p>{" "}
              </div>
            )}
            {activeTab === "Diterima Pembeli" && (
              <div>
                {" "}
                <h2 className="text-lg font-semibold">Barang Diterima</h2>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  Barang sudah diterima pembeli.{" "}
                </p>{" "}
              </div>
            )}
            {activeTab === "Dikomplain" && (
              <div>
                {" "}
                <h2 className="text-lg font-semibold">
                  Barang Dikomplain
                </h2>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  Penjualan barang ini dikomplain/dibatalkan.{" "}
                </p>{" "}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {" "}
          <div className="relative flex-1">
            {" "}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />{" "}
            <input
              type="text"
              placeholder="Cari nama barang, ID produk, atau ID pesanan"
              className="w-full pl-10 pr-4 py-2 border border-[#ffffff33] rounded-md bg-[#ffffff22] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#753799]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />{" "}
          </div>{" "}
        </div>

        {processedItems.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            {" "}
            <Box className="h-12 w-12 mx-auto text-gray-400 mb-4" />{" "}
            <h3 className="text-lg font-medium mb-2 text-white">
              {" "}
              Tidak ada barang penjualan ditemukan{" "}
            </h3>{" "}
            <p className="text-gray-300">
              {" "}
              Sesuaikan filter atau Anda belum memiliki barang yang cocok.{" "}
            </p>{" "}
          </div>
        ) : (
          <div className="space-y-4">
            {processedItems.map((item, index) => {
              const itemStatusLower = item.itemStatus
                ? item.itemStatus.toLowerCase()
                : KNOWN_STATUSES.BARU;

              const showProsesButton =
                itemStatusLower === KNOWN_STATUSES.MENUNGGU_PENJUAL;
              const showPanggilKurirUntukJemput =
                item.status_barang === KNOWN_STATUSES.DIPROSES_PENJUAL;
              const showPanggilKurirUntukPengembalian =
                item.status_barang === KNOWN_STATUSES.DIKOMPLAIN;

              return (
                <div
                  key={`${item.orderId}-${item.productId || "item"}-${index}`}
                  className="border border-[#ffffff33] rounded-lg shadow-sm bg-white text-[#100428] p-4 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      {getStatusIcon(item.itemStatus)}
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg">
                          {item.nama || "Nama Barang Tidak Ada"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Produk ID: {item.productId || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-left sm:text-right">
                      <p className="text-sm font-medium text-purple-700">
                        Rp{Number(item.harga || 0).toLocaleString("id-ID")}{" "}
                        &times; {item.qty || 0}
                      </p>
                      <p className="text-sm font-bold text-purple-800">
                        Subtotal Item: Rp
                        {Number(
                          item.subtotal || item.harga * item.qty || 0
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <hr className="my-3 border-gray-200" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-600">
                    <div className="mb-2 sm:mb-0">
                      <p>
                        <span className="font-medium">Dari Pesanan ID:</span>{" "}
                        {item.orderId}
                      </p>
                      <p>
                        <span className="font-medium">Tanggal Pesan:</span>{" "}
                        {item.orderDate}
                      </p>
                    </div>
                    <div className="flex flex-col items-stretch sm:items-end space-y-1 mt-2 sm:mt-0 w-full sm:w-auto">
                      <div className="self-stretch sm:self-end">
                        {getStatusBadge(item.itemStatus)}
                      </div>
                      {showProsesButton && (
                        <button
                          onClick={() =>
                            handleChangeItemStatus(
                              item.orderId,
                              item.productId,
                              KNOWN_STATUSES.DIPROSES_PENJUAL
                            )
                          }
                          disabled={
                            isUpdatingItem ===
                            `${item.productId}_${KNOWN_STATUSES.DIPROSES_PENJUAL}`
                          }
                          className={`py-1 px-3 text-xs rounded-full transition-colors w-full mt-1
                                      ${
                                        isUpdatingItem ===
                                        `${item.productId}_${KNOWN_STATUSES.DIPROSES_PENJUAL}`
                                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                          : "bg-blue-600 hover:bg-blue-700 text-white"
                                      }`}
                        >
                          {isUpdatingItem ===
                          `${item.productId}_${KNOWN_STATUSES.DIPROSES_PENJUAL}`
                            ? "Memproses..."
                            : "Proses Pesanan"}
                        </button>
                      )}
                      {showPanggilKurirUntukJemput && (
                        <button
                          onClick={() =>
                            handleChangeItemStatus(
                              item.orderId,
                              item.productId,
                              KNOWN_STATUSES.MENUNGGU_KURIR
                            )
                          }
                          disabled={
                            isUpdatingItem ===
                            `${item.productId}_${KNOWN_STATUSES.MENUNGGU_KURIR}`
                          }
                          className={`py-1 px-3 text-xs rounded-full transition-colors w-full mt-1
                                      ${
                                        isUpdatingItem ===
                                        `${item.productId}_${KNOWN_STATUSES.MENUNGGU_KURIR}`
                                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                          : "bg-orange-500 hover:bg-orange-600 text-white"
                                      }`}
                        >
                          {isUpdatingItem ===
                          `${item.productId}_${KNOWN_STATUSES.MENUNGGU_KURIR}`
                            ? "Memanggil..."
                            : "Panggil Kurir"}
                        </button>
                      )}
                      {showPanggilKurirUntukPengembalian && (
                        <button
                          onClick={() =>
                            handleChangeItemStatus(
                              item.orderId,
                              item.productId,
                              KNOWN_STATUSES.MENUNGGU_DIKIRIM_BALIK
                            )
                          }
                          disabled={
                            isUpdatingItem ===
                            `${item.productId}_${KNOWN_STATUSES.MENUNGGU_DIKIRIM_BALIK}`
                          }
                          className={`py-1 px-3 text-xs rounded-full transition-colors w-full mt-1
                                      ${
                                        isUpdatingItem ===
                                        `${item.productId}_${KNOWN_STATUSES.MENUNGGU_DIKIRIM_BALIK}`
                                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                          : "bg-orange-500 hover:bg-orange-600 text-white"
                                      }`}
                        >
                          {isUpdatingItem ===
                          `${item.productId}_${KNOWN_STATUSES.MENUNGGU_DIKIRIM_BALIK}`
                            ? "Memanggil..."
                            : "Panggil Kurir"}
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
