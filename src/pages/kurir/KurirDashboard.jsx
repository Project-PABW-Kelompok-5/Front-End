import { useEffect, useState, useCallback } from "react";
import {
  query,
  getDocs, // Kita akan menggunakan ini untuk subcollection alamat
  getDoc,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../../src/firebase.js";
import KurirSidebar from "../../components/KurirSidebar.jsx";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const auth = getAuth();

// const statusOptions = [
//   { value: "menunggu kurir", label: "📦 Menunggu Kurir" },
//   { value: "sedang dikirim", label: "🚚 Sedang Dikirim" },
//   { value: "menunggu dikirim balik", label: "📦 Menunggu Dikirim Balik" },
//   { value: "dikirim balik", label: "🔁 Dikirim Balik" },
// ];

const KurirDashboard = () => {
  const [selectedStatus, setSelectedStatus] = useState("menunggu kurir");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellersMap, setSellersMap] = useState({});
  const [statusCounts, setStatusCounts] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sellersLoading, setSellersLoading] = useState(true);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      navigate("/login");
      toast.success("Anda telah berhasil logout.");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Gagal logout. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    const fetchSellersData = async () => {
      if (!filteredOrders || filteredOrders.length === 0) {
        setSellersMap({});
        setSellersLoading(false);
        return;
      }

      const sellerIdsToFetch = new Set();

      filteredOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.id_penjual) {
            sellerIdsToFetch.add(item.id_penjual);
          }
        });
      });

      if (sellerIdsToFetch.size === 0) {
        setSellersLoading(false);
        return;
      }

      let fetchedSellerDetails = [];
      try {
        const promises = Array.from(sellerIdsToFetch).map(async (sellerId) => {
          const userDocRef = doc(db, "users", sellerId);
          const userSnap = await getDoc(userDocRef);

          let sellerAddress = "Alamat Tidak Ada";

          if (userSnap.exists()) {
            const userData = userSnap.data();

            // --- PERUBAHAN PENTING DI SINI ---
            // Mengambil dokumen dari subcollection 'alamat' dengan query
            const alamatCollectionRef = collection(
              db,
              "users",
              sellerId,
              "alamat"
            );
            const alamatSnap = await getDocs(alamatCollectionRef);

            if (!alamatSnap.empty) {
              // Periksa apakah ada dokumen di subcollection
              const alamatData = alamatSnap.docs[0].data(); // Ambil dokumen pertama
              // SESUAIKAN NAMA FIELD INI dengan struktur data alamat Anda di Firestore
              sellerAddress = `${alamatData.address || ""}, ${
                alamatData.addressDetail || ""
              }, ${alamatData.kecamatan || ""}`;
              // Berdasarkan screenshot, fields: address, addressDetail, kecamatan
            } else {
              console.warn(
                `Subcollection alamat untuk ID pengguna ${sellerId} kosong atau tidak ditemukan.`
              );
            }
            // --- AKHIR PERUBAHAN ---

            return {
              id: sellerId,
              username: userData.username || "Username Tidak Ada",
              address: sellerAddress,
            };
          } else {
            console.warn(
              `Dokumen pengguna dengan ID ${sellerId} tidak ditemukan.`
            );
            return {
              id: sellerId,
              username: "Penjual Tdk Ditemukan",
              address: "Alamat Tdk Ditemukan",
            };
          }
        });
        fetchedSellerDetails = await Promise.all(promises);
      } catch (err) {
        console.error("Error fetching seller details:", err);
      } finally {
        setSellersMap((prevSellersMap) => {
          const newMap = { ...prevSellersMap };
          let mapChanged = false;

          fetchedSellerDetails.forEach((seller) => {
            if (
              seller &&
              (!newMap[seller.id] ||
                newMap[seller.id].address !== seller.address ||
                newMap[seller.id].username !== seller.username)
            ) {
              newMap[seller.id] = {
                username: seller.username,
                address: seller.address,
              };
              mapChanged = true;
            }
          });

          Array.from(sellerIdsToFetch).forEach((id) => {
            if (!newMap[id] && !fetchedSellerDetails.some((s) => s.id === id)) {
              newMap[id] = {
                username: "Gagal Memuat",
                address: "Gagal Memuat",
              };
              mapChanged = true;
            }
          });

          if (!mapChanged) {
            return prevSellersMap;
          }
          return newMap;
        });
        setSellersLoading(false);
      }
    };

    fetchSellersData();
  }, [filteredOrders]);

  const fetchOrders = useCallback(async () => {
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

      const counts = {
        "menunggu kurir": 0,
        "sedang dikirim": 0,
        "menunggu dikirim balik": 0,
        "dikirim balik": 0,
      };

      allOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.status_barang && item.status_barang in counts) {
            counts[item.status_barang]++;
          }
        });
      });
      setStatusCounts(counts);

      const clientFiltered = allOrders.filter((order) =>
        order.items.some((item) => item.status_barang === selectedStatus)
      );

      setFilteredOrders(clientFiltered);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError("Gagal memuat pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [
    selectedStatus,
    setStatusCounts,
    setFilteredOrders,
    setLoading,
    setError,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCustomStatusChange = (value) => {
    setSelectedStatus(value);
    setIsDropdownOpen(false);
  };

  const updateItemStatusInFirestore = async (
    orderId,
    productIdToUpdate,
    newStatus
  ) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        console.error("Dokumen pesanan tidak ditemukan:", orderId);
        return false;
      }

      const orderData = orderSnap.data();

      const updatedItems = orderData.items.map((item) => {
        if (item.productId === productIdToUpdate) {
          return { ...item, status_barang: newStatus };
        }
        return item;
      });

      await updateDoc(orderRef, {
        items: updatedItems,
      });

      console.log(
        `Status barang dengan productId ${productIdToUpdate} di order ${orderId} berhasil diperbarui menjadi '${newStatus}'.`
      );
      return true;
    } catch (error) {
      console.error("Gagal update status:", error);
      return false;
    }
  };

  const handleTakeOrder = async (orderId, productId) => {
    if (window.confirm("Apakah Anda yakin ingin mengambil pesanan ini?")) {
      const success = await updateItemStatusInFirestore(
        orderId,
        productId,
        "sedang dikirim"
      );
      if (success) {
        toast.success(
          "Pesanan berhasil diambil! Status diperbarui menjadi 'Sedang Dikirim'."
        );
        fetchOrders();
      } else {
        toast.error("Terjadi kesalahan saat mengambil pesanan.");
      }
    }
  };

  const handleCompleteOrder = async (orderId, productId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin konfirmasi pesanan ini sampai ditujuan?"
      )
    ) {
      const success = await updateItemStatusInFirestore(
        orderId,
        productId,
        "sampai di tujuan"
      );
      if (success) {
        toast.success(
          "Pesanan berhasil dikonfirmasi sampai di tujuan! Status diperbarui menjadi 'Sampai di tujuan'."
        );
        fetchOrders();
      } else {
        toast.error("Terjadi kesalahan saat menyelesaikan pesanan.");
      }
    }
  };

  const handleTakeReturn = async (orderId, productId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengambil pengiriman balik pesanan ini?"
      )
    ) {
      const success = await updateItemStatusInFirestore(
        orderId,
        productId,
        "dikirim balik"
      );
      if (success) {
        toast.success(
          "Pengiriman balik pesanan berhasil diambil! Status diperbarui menjadi 'Dikirim balik'."
        );
        fetchOrders();
      } else {
        toast.error("Terjadi kesalahan saat mengambil pesanan.");
      }
    }
  };

  const handleConfirmReturn = async (orderId, productId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin konfirmasi pengembalian pesanan ini?"
      )
    ) {
      const success = await updateItemStatusInFirestore(
        orderId,
        productId,
        "menunggu penjual"
      );
      if (success) {
        toast.success(
          "Pengembalian pesanan berhasil dikonfirmasi! Status diperbarui menjadi 'Menunggu penjual'."
        );
        fetchOrders();
      } else {
        toast.error("Terjadi kesalahan saat mengkonfirmasi pengembalian.");
      }
    }
  };

  const renderActionButton = (status, orderId, productId) => {
    switch (status) {
      case "menunggu kurir":
        return (
          <button
            onClick={() => handleTakeOrder(orderId, productId)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Ambil
          </button>
        );
      case "sedang dikirim":
        return (
          <button
            onClick={() => handleCompleteOrder(orderId, productId)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Konfirmasi sampai ditujuan
          </button>
        );
      case "menunggu dikirim balik":
        return (
          <button
            onClick={() => handleTakeReturn(orderId, productId)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Ambil pengiriman balik
          </button>
        );
      case "dikirim balik":
        return (
          <button
            onClick={() => handleConfirmReturn(orderId, productId)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Konfirmasi pengembalian
          </button>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount) =>
    amount?.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

  const statusOptionsWithCounts = [
    {
      value: "menunggu kurir",
      label: "📦 Menunggu Kurir",
      count: statusCounts["menunggu kurir"] || 0,
    },
    {
      value: "sedang dikirim",
      label: "🚚 Sedang Dikirim",
      count: statusCounts["sedang dikirim"] || 0,
    },
    {
      value: "menunggu dikirim balik",
      label: "📦 Menunggu Dikirim Balik",
      count: statusCounts["menunggu dikirim balik"] || 0,
    },
    {
      value: "dikirim balik",
      label: "🔁 Dikirim Balik",
      count: statusCounts["dikirim balik"] || 0,
    },
  ];

  return (
    <div className="flex">
      <KurirSidebar activePage="Dashboard" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen overflow-y-auto relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md flex items-center space-x-2"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-4">Dashboard Kurir</h1>
        <div className="mb-4">
          <label className="text-sm text-gray-600 mr-2" htmlFor="status-filter">
            Filter Status:
          </label>
          <div className="inline-flex items-stretch gap-2">
            <button
              type="button"
              className="p-2 border rounded focus:ring-blue-500 focus:border-blue-500 inline-flex items-center w-60 bg-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="flex-1 text-left">
                {
                  statusOptionsWithCounts.find(
                    (opt) => opt.value === selectedStatus
                  )?.label
                }
              </span>
              {statusCounts[selectedStatus] > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-red-500 rounded-full ml-2">
                  {statusCounts[selectedStatus]}
                </span>
              )}
              <svg
                className="ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={fetchOrders}
              className="p-2 border rounded bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 focus:border-blue-500 inline-flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Refresh
            </button>
          </div>

          {/* Dropdown menu kustom */}
          {isDropdownOpen && (
            <div
              className="absolute z-10 mt-1 w-60 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              style={{ left: "108px" }}
            >
              <div className="py-1">
                {statusOptionsWithCounts.map((status) => (
                  <button
                    key={status.value}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    onClick={() => handleCustomStatusChange(status.value)}
                  >
                    {status.label}{" "}
                    {status.count > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-red-500 rounded-full ml-3">
                        {status.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Penjual</th>
                <th className="px-4 py-2 text-left">Alamat Penjual</th>
                <th className="px-4 py-2 text-left">Penerima</th>
                <th className="px-4 py-2 text-left">Telepon Penerima</th>
                <th className="px-4 py-2 text-left">Alamat Penerima</th>
                <th className="px-4 py-2 text-left">Barang</th>
                <th className="px-4 py-2 text-left">Qty</th>{" "}
                <th className="px-4 py-2 text-left">Subtotal Barang</th>{" "}
                <th className="px-4 py-2 text-left">Ongkir Order</th>{" "}
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Tanggal Pesan</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="12" className="text-center text-red-500 p-4">
                    {error}
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center p-4">
                    Tidak ada pesanan untuk status ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.flatMap((order) =>
                  order.items
                    .filter((item) => item.status_barang === selectedStatus)
                    .map((item, itemIndex) => {
                      const sellerInfo = sellersMap[item.id_penjual];
                      const sellerUsername = sellerInfo?.username || "N/A";
                      const sellerAddress =
                        sellerInfo?.address || "Memuat alamat...";
                      return (
                        <tr
                          key={`${order.id}-${item.id || itemIndex}`}
                          className="border-t align-top hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">{sellerUsername}</td>
                          <td
                            className="px-4 py-2 text-wrap"
                            style={{ maxWidth: "200px" }}
                          >
                            {sellersLoading
                              ? "Memuat alamat..."
                              : sellerAddress}
                          </td>
                          <td className="px-4 py-2">{order.namaPenerima}</td>
                          <td className="px-4 py-2">{order.teleponPenerima}</td>
                          <td
                            className="px-4 py-2 text-wrap"
                            style={{ maxWidth: "200px" }}
                          >
                            {order.alamatLengkap}
                          </td>
                          <td className="px-4 py-2">{item.nama}</td>
                          <td className="px-4 py-2">{item.qty}</td>
                          <td className="px-4 py-2">
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="px-4 py-2">
                            {formatCurrency(order.shippingCost)}
                          </td>
                          <td className="px-4 py-2 capitalize">
                            {item.status_barang}
                          </td>
                          <td className="px-4 py-2">{order.createdAt}</td>
                          <td className="px-4 py-2">
                            {renderActionButton(
                              item.status_barang,
                              order.id,
                              item.productId
                            )}
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
      <ToastContainer />
    </div>
  );
};

export default KurirDashboard;
