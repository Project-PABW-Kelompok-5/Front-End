import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RegisterPage from './pages/Register.jsx'
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import LoginPage from './pages/Login.jsx';
import Homepage from './pages/homepage.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';
import ManageProduct from './pages/admin/ManageProduct.jsx';
import ManageCourier from './pages/admin/ManageCourier.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import EcommerceDashboard from './pages/users/DashboardV1.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/manageUsers" element={<ManageUsers />} />
        <Route path="/admin/manageProduct" element={<ManageProduct />} />
        <Route path="/admin/manageCourier" element={<ManageCourier />} />
        <Route path="/users/dashboard" element={< EcommerceDashboard/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
