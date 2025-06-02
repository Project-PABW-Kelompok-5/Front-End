// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RegisterPage from "./pages/Register.jsx";
import LoginPage from "./pages/Login.jsx";
import Homepage from "./pages/homepage.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ManageProduct from "./pages/admin/ManageProduct.jsx";
import ManageCourier from "./pages/admin/ManageCourier.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import EcommerceDashboard from "./pages/users/DashboardV1.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx"; 
import Wallet from "./pages/users/wallet.jsx";
import Profil from "./pages/profil.jsx";
import MyOrder from "./pages/myOrder.jsx";
import Cart from "./pages/cart.jsx";
import Checkout from "./pages/checkout.jsx";
import DeliveryHistory from "./pages/users/historyPengiriman.jsx";
import Wishlist from "./pages/wishlist.jsx";
import ManageBalance from "./pages/admin/ManageBalance.jsx";
import ManageBarang from "./pages/users/managebarang.jsx";
import DashboardKurir from "./pages/kurir/KurirDashboard.jsx";
import KurirBarang from "./pages/kurir/KurirBarang.jsx";
import Addresses from "./pages/Addressses.jsx";
import VerifikasiEmail from "./pages/verifikasiEmail.jsx";
import HistoryPenjualan from "./pages/users/historyPenjualan.jsx";

import { startTokenRefreshListener } from "./authListener";

import "./index.css";

startTokenRefreshListener();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Routes yang dibatasi untuk Admin/Kurir */}
        {/* Jika admin/kurir sudah login, mereka akan dialihkan dari sini */}
        <Route element={<PrivateRoute allowLoggedInUser={false} />}>
          <Route path="/" element={<Homepage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verifikasi-email" element={<VerifikasiEmail />} />

        {/* Protected User Routes */}
        <Route element={<PrivateRoute role="User" />}>
          <Route path="/users/dashboard" element={<EcommerceDashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profil />} />
          <Route path="/myOrder" element={<MyOrder />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/managebarang" element={<ManageBarang />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/history" element={<DeliveryHistory />} />
          <Route path="/history-penjualan" element={<HistoryPenjualan />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<PrivateRoute role="admin" />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/manageUsers" element={<ManageUsers />} />
          <Route path="/admin/manageProduct" element={<ManageProduct />} />
          <Route path="/admin/manageCourier" element={<ManageCourier />} />
          <Route path="/admin/manageBalance" element={<ManageBalance />} />
        </Route>

        {/* --- Protected Kurir Routes --- */}
        {/* <Route element={<PrivateRoute role="kurir" />}>
          <Route path="/kurir/dashboard" element={<DashboardKurir />} />
          <Route path="/kurir/barang" element={<KurirBarang />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
