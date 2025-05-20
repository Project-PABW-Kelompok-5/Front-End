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

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/wallet" element={<Wallet />} />

        {/* Protected User Routes */}
        <Route element={<PrivateRoute role="user" />}>
          {/* <Route path="/" element={<Homepage />} /> */}
          <Route path="/users/dashboard" element={<EcommerceDashboard />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<PrivateRoute role="admin" />}>
          <Route path="/admin/manageUsers" element={<ManageUsers />} />
          <Route path="/admin/manageProduct" element={<ManageProduct />} />
          <Route path="/admin/manageCourier" element={<ManageCourier />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
