// src/components/admin/AdminSidebar.jsx
import { useNavigate } from "react-router-dom";
import Sidebar, { SidebarItem } from "../components/Sidebar.jsx";
import {
  Home, LayoutDashboard, UserCog, Truck, Package, Settings, LifeBuoy, Wallet, LogOut,
} from "lucide-react";


const AdminSidebar = ({ activePage }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("LOGOUT_FLOW: 1. handleLogout called.");

    // Hapus data sesi dari localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    console.log("LOGOUT_FLOW: 2. localStorage cleared.");
    navigate("/login");
    console.log("LOGOUT_FLOW: 3. navigate('/login') called.");
  };

  return (
    <Sidebar>
      <SidebarItem
        icon={<LayoutDashboard size={20} color="white" />} text={<span style={{ color: "white" }}>Dashboard</span>} to="/admin/dashboard" active={activePage === "Dashboard"} />
      <SidebarItem
        icon={<UserCog size={20} color="white" />} text={<span style={{ color: "white" }}>Manage Users</span>} to="/admin/manageUsers" active={activePage === "Manage Users"} />
      <SidebarItem
        icon={<Truck size={20} color="white" />} text={<span style={{ color: "white" }}>Manage Courier</span>} to="/admin/manageCourier" active={activePage === "Manage Courier"} />
      <SidebarItem
        icon={<Package size={20} color="white" />} text={<span style={{ color: "white" }}>Manage Product</span>} to="/admin/manageProduct" active={activePage === "Manage Product"} />
      <SidebarItem
        icon={<Wallet size={20} color="white" />} text={<span style={{ color: "white" }}>Manage Balance</span>} to="/admin/manageBalance" active={activePage === "Manage Balance"} />
      <hr className="my-3" />
      <SidebarItem
        icon={<Settings size={20} color="white" />} text={<span style={{ color: "white" }}>Settings</span>} active={activePage === "Settings"} />
      <SidebarItem
        icon={<LifeBuoy size={20} color="white" />} text={<span style={{ color: "white" }}>Help</span>} active={activePage === "Help"} />
    </Sidebar>
  );
};

export default AdminSidebar;