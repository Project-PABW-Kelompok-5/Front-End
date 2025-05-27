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
import DeliveryHistory from "./pages/kurir/historyPengiriman.jsx";
import Wishlist from "./pages/wishlist.jsx";
import ManageBalance from "./pages/admin/ManageBalance.jsx";
import ManageBarang from "./pages/users/managebarang.jsx";
import DashboardKurir from "./pages/Kurir/KurirDashboard.jsx";
import KurirBarang from "./pages/kurir/KurirBarang.jsx";
import Addresses from "./pages/Addressses.jsx";
import VerifikasiEmail from "./pages/verifikasiEmail.jsx";

import { startTokenRefreshListener } from "./authListener";

import "./index.css";

startTokenRefreshListener();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {/* Hapus atau ubah rute ini jika Dashboard hanya untuk Admin. */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verifikasi-email" element={<VerifikasiEmail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profil />} />
        <Route path="/myOrder" element={<MyOrder />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        {/* Rute ini dipindahkan ke Protected Kurir Routes */}
        {/* <Route path="/history" element={<DeliveryHistory />} /> */}
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/managebarang" element={<ManageBarang />} />
        {/* Rute ini dipindahkan ke Protected Kurir Routes */}
        {/* <Route path="/kurir/dashboard" element={<DashboardKurir />} /> */}
        {/* Rute ini dipindahkan ke Protected Kurir Routes */}
        {/* <Route path="/kurir/barang" element={<KurirBarang />} /> */}
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/history" element={<DeliveryHistory />} />

        {/* Protected User Routes */}
        <Route element={<PrivateRoute role="User" />}>
          <Route path="/users/dashboard" element={<EcommerceDashboard />} />
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
        <Route element={<PrivateRoute role="kurir" />}>
          <Route path="/kurir/dashboard" element={<DashboardKurir />} />
          <Route path="/kurir/barang" element={<KurirBarang />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
