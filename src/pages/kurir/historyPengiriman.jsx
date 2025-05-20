"use client";

import { useState } from "react";
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
  Backpack,
  HomeIcon,
} from "lucide-react";

// Mock data for delivery history
const deliveryHistory = [
  {
    id: "ORD-7829",
    date: "May 18, 2025",
    status: "Delivered",
    address: "123 Main St, Apt 4B, New York, NY 10001",
    items: [
      { name: "Wireless Headphones", quantity: 1, price: "$129.99" },
      { name: "Phone Case", quantity: 1, price: "$24.99" },
    ],
    trackingNumber: "TRK928374651",
    deliveredDate: "May 18, 2025",
    carrier: "FedEx",
    total: "$154.98",
  },
  {
    id: "ORD-6543",
    date: "May 10, 2025",
    status: "Delivered",
    address: "123 Main St, Apt 4B, New York, NY 10001",
    items: [
      { name: "Smart Watch", quantity: 1, price: "$249.99" },
      { name: "Watch Band", quantity: 2, price: "$29.99" },
    ],
    trackingNumber: "TRK837465192",
    deliveredDate: "May 12, 2025",
    carrier: "UPS",
    total: "$309.97",
  },
  {
    id: "ORD-5421",
    date: "May 5, 2025",
    status: "In Transit",
    address: "123 Main St, Apt 4B, New York, NY 10001",
    items: [
      { name: "Laptop", quantity: 1, price: "$1299.99" },
      { name: "Laptop Sleeve", quantity: 1, price: "$39.99" },
      { name: "Wireless Mouse", quantity: 1, price: "$49.99" },
    ],
    trackingNumber: "TRK746519283",
    estimatedDelivery: "May 22, 2025",
    carrier: "DHL",
    total: "$1389.97",
  },
  {
    id: "ORD-4398",
    date: "April 28, 2025",
    status: "Processing",
    address: "123 Main St, Apt 4B, New York, NY 10001",
    items: [
      { name: "Coffee Maker", quantity: 1, price: "$89.99" },
      { name: "Coffee Beans", quantity: 2, price: "$14.99" },
    ],
    estimatedShipping: "May 22, 2025",
    total: "$119.97",
  },
  {
    id: "ORD-3276",
    date: "April 15, 2025",
    status: "Cancelled",
    address: "123 Main St, Apt 4B, New York, NY 10001",
    items: [{ name: "Bluetooth Speaker", quantity: 1, price: "$79.99" }],
    cancelledDate: "April 16, 2025",
    cancelReason: "Item out of stock",
    total: "$79.99",
  },
];

const DeliveryHistory = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const navigate = useNavigate();

  const homepage = () => {
    navigate("/");
  };

  const filteredDeliveries = deliveryHistory.filter((delivery) => {
    const matchesSearch =
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" ||
      delivery.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in transit":
        return <Truck className="h-5 w-5 text-blue-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Proses Pengiriman
          </span>
        );
      case "delivered":
        return (
          <div className="flex flex-col space-y-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 w-max">
              Dikirim
            </span>
            <label className="text-sm text-gray-700">
              Apakah barang telah sampai kepada anda?
              <select
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                defaultValue=""
              >
                <option value="" disabled>
                  Pilih jawaban
                </option>
                <option value="ya">Ya</option>
                <option value="tidak">Tidak</option>
              </select>
            </label>
          </div>
        );
      case "in transit":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Dalam Perjalanan
          </span>
        );
      case "cancelled":
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <HomeIcon onClick={homepage} className="h-6 cursor-pointer w-6 mr-2" />
        <p className="text-xl cursor-pointer font-bold">Kembali</p>
      </div>
      <div className="flex items-center mb-6">
        <Package className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">History Pengiriman</h1>
      </div>

      {/* Custom Tabs */}
      <div className="mb-6">
        <div className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
          <button
            className={`py-2 cursor-pointer text-sm font-medium rounded-md transition-colors ${
              activeTab === "all" ? "bg-white shadow" : "hover:bg-gray-200"
            }`}
            onClick={() => {
              setStatusFilter("all");
              setActiveTab("all");
            }}
          >
            Semua Pesanan
          </button>
          <button
            className={`py-2 cursor-pointer text-sm font-medium rounded-md transition-colors ${
              activeTab === "Processing"
                ? "bg-white shadow"
                : "hover:bg-gray-200"
            }`}
            onClick={() => {
              setStatusFilter("Processing");
              setActiveTab("Processing");
            }}
          >
            Proses Pengiriman
          </button>
          <button
            className={`py-2 cursor-pointer text-sm font-medium rounded-md transition-colors ${
              activeTab === "In Transit"
                ? "bg-white shadow"
                : "hover:bg-gray-200"
            }`}
            onClick={() => {
              setStatusFilter("In Transit");
              setActiveTab("In Transit");
            }}
          >
            Dalam Perjalanan
          </button>
          <button
            className={`py-2 cursor-pointer text-sm font-medium rounded-md transition-colors ${
              activeTab === "delivered"
                ? "bg-white shadow"
                : "hover:bg-gray-200"
            }`}
            onClick={() => {
              setStatusFilter("delivered");
              setActiveTab("delivered");
            }}
          >
            Dikirim
          </button>
          <button
            className={`py-2 cursor-pointer text-sm font-medium rounded-md transition-colors ${
              activeTab === "Cancelled"
                ? "bg-white shadow"
                : "hover:bg-gray-200"
            }`}
            onClick={() => {
              setStatusFilter("Cancelled");
              setActiveTab("Cancelled");
            }}
          >
            Dibatalkan
          </button>
        </div>

        <div className="mt-4 bg-white border rounded-lg p-4">
          {activeTab === "all" && (
            <div>
              <h2 className="text-lg font-semibold">Semua Pesanan</h2>
              <p className="text-sm text-gray-500">
                Lihat semua pesanan Anda di masa lalu dan saat ini
              </p>
            </div>
          )}
          {activeTab === "Processing" && (
            <div>
              <h2 className="text-lg font-semibold">Proses Pengiriman</h2>
              <p className="text-sm text-gray-500">
                Barang telah diproses dan siap untuk dikirim
              </p>
            </div>
          )}
          {activeTab === "In Transit" && (
            <div>
              <h2 className="text-lg font-semibold">Dalam Perjalanan</h2>
              <p className="text-sm text-gray-500">
                Pesanan sedang dalam perjalanan
              </p>
            </div>
          )}
          {activeTab === "delivered" && (
            <div>
              <h2 className="text-lg font-semibold">Dikirim</h2>
              <p className="text-sm text-gray-500">
                Pesanan telah berhasil dikirim
              </p>
            </div>
          )}
          {activeTab === "Cancelled" && (
            <div>
              <h2 className="text-lg font-semibold">Pesanan Dibatalkan</h2>
              <p className="text-sm text-gray-500">
                Pesanan yang telah dibatalkan
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or item name"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No deliveries found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleOrderDetails(delivery.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(delivery.status)}
                    <div>
                      <h3 className="font-medium">{delivery.id}</h3>
                      <p className="text-sm text-gray-500">{delivery.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(delivery.status)}
                    {expandedOrder === delivery.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
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
                        <MapPin className="h-4 w-4 mr-1" /> Delivery Address
                      </h4>
                      <p className="text-sm text-gray-600">
                        {delivery.address}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" /> Delivery Details
                      </h4>
                      {delivery.status === "Delivered" && (
                        <p className="text-sm text-gray-600">
                          Delivered on {delivery.deliveredDate} via{" "}
                          {delivery.carrier}
                        </p>
                      )}
                      {delivery.status === "In Transit" && (
                        <p className="text-sm text-gray-600">
                          Estimated delivery: {delivery.estimatedDelivery} via{" "}
                          {delivery.carrier}
                        </p>
                      )}
                      {delivery.status === "Processing" && (
                        <p className="text-sm text-gray-600">
                          Estimated shipping: {delivery.estimatedShipping}
                        </p>
                      )}
                      {delivery.status === "Cancelled" && (
                        <p className="text-sm text-gray-600">
                          Cancelled on {delivery.cancelledDate}:{" "}
                          {delivery.cancelReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Box className="h-4 w-4 mr-1" /> Items
                  </h4>
                  <div className="bg-gray-50 rounded-md p-3 mb-4">
                    {delivery.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-500" />
                          </div>
                          <span className="text-sm">
                            {item.name} × {item.quantity}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {item.price}
                        </span>
                      </div>
                    ))}
                    <hr className="my-2 border-gray-200" />
                    <div className="flex justify-between py-2">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-sm font-medium">
                        {delivery.total}
                      </span>
                    </div>
                  </div>

                  {(delivery.status === "Delivered" ||
                    delivery.status === "In Transit") && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <button className="ml-auto px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                          Track Package
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      Order Details
                    </button>
                    {delivery.status !== "Cancelled" && (
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        Get Help
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default DeliveryHistory;
