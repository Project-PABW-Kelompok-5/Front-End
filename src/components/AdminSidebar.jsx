// src/components/admin/AdminSidebar.jsx
import Sidebar, { SidebarItem } from "../components/Sidebar.jsx";
import {
  Home,
  LayoutDashboard,
  UserCog,
  Truck,
  Package,
  Flag,
  Settings,
  LifeBuoy,
  Wallet,
} from "lucide-react";

const AdminSidebar = ({ activePage }) => {
  return (
    <Sidebar>
      <SidebarItem
        icon={<Home size={20} />}
        text="Home"
        to="/"
        active={activePage === "Home"}
      />
      <SidebarItem
        icon={<LayoutDashboard size={20} />}
        text="Dashboard"
        to="/admin/dashboard"
        active={activePage === "Dashboard"}
      />
      <SidebarItem
        icon={<UserCog size={20} />}
        text="Manage Users"
        to="/admin/manageUsers"
        active={activePage === "Manage Users"}
      />
      <SidebarItem
        icon={<Truck size={20} />}
        text="Manage Courier"
        to="/admin/manageCourier"
        active={activePage === "Manage Courier"}
      />
      <SidebarItem
        icon={<Package size={20} />}
        text="Manage Product"
        to="/admin/manageProduct"
        active={activePage === "Manage Product"}
      />
      <SidebarItem
        icon={<Wallet size={20} />}
        text="Manage Balance"
        to="/admin/manageBalance"
        active={activePage === "Manage Balance"}
      />
      <hr className="my-3" />
      <SidebarItem
        icon={<Settings size={20} />}
        text="Settings"
        active={activePage === "Settings"}
      />
      <SidebarItem
        icon={<LifeBuoy size={20} />}
        text="Help"
        active={activePage === "Help"}
      />
    </Sidebar>
  );
};

export default AdminSidebar;
