
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
      <SidebarItem 
      icon={<LayoutDashboard size={20} color="white" />} 
      text={<span style={{ color: "white" }}>Dashboard</span>} 
      to="/kurir/dashboard" 
      active={activePage === "Dashboard"} 
      />
      <SidebarItem 
      icon={<Package size={20} color="white" />} 
      text={<span style={{ color: "white" }}>barang</span>} 
      to="/kurir/barang" 
      active={activePage === "barang"} 
      />
      <hr className="my-3" />
      <SidebarItem 
      icon={<Settings size={20} color="white" />} 
      text={<span style={{ color: "white" }}>Settings</span>} 
      active={activePage === "Settings"} 
      />
      <SidebarItem 
      icon={<LifeBuoy size={20} color="white" />} 
      text={<span style={{ color: "white" }}>Help</span>} 
      active={activePage === "Help"} 
      />
    </Sidebar>
    );
};

export default KurirSidebar;
