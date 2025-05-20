
import Sidebar, { SidebarItem } from "./Sidebar.jsx";                                                                   
import { 
  Home, 
  LayoutDashboard, 
  UserCog, 
  Truck, 
  Package, 
  Flag, 
  Settings, 
  LifeBuoy 
} from "lucide-react";

const KurirSidebar = ({ activePage }) => {
  return (
    <Sidebar>
      <SidebarItem icon={<Home size={20} />} text="Home" to="/" active={activePage === "Home"} />
      <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" to="/kurir/dashboard" active={activePage === "Dashboard"} />
      <SidebarItem icon={<Package size={20} />} text="barang" to="/kurir/barang" active={activePage === "barang"} />
      <hr className="my-3" />
      <SidebarItem icon={<Settings size={20} />} text="Settings" active={activePage === "Settings"} />
      <SidebarItem icon={<LifeBuoy size= {20} />} text="Help" active={activePage === "Help"} />
    </Sidebar>
  );
};

export default KurirSidebar;
