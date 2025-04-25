// src/pages/admin/Dashboard.jsx
import Sidebar, {SidebarItem} from '../../components/Sidebar.jsx';
import { LayoutDashboard, Home, Flag, LifeBuoy, Settings, UserCog, Truck, Package } from "lucide-react";

const ManageCourirer = () => {
  return (
    <>
      <div className="flex">
        <Sidebar>
          <SidebarItem icon={<Home size={20} />} text="Home" to="/" />
          <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" to='/admin/dashboard'/>
          <SidebarItem icon={<UserCog size={20} />} text="Manage Users" to='/admin/manageUsers' />
          <SidebarItem icon={<Truck size={20} />} text="Manage Courier" to='/admin/manageCourier' active/>
          <SidebarItem icon={<Package size={20} />} text="Manage Product" to='/admin/manageProduct' />
          <SidebarItem icon={<Flag size={20} />} text="Reporting" />
          <hr className="my-3" />
          <SidebarItem icon={<Settings size={20} />} text="Settings" />
          <SidebarItem icon={<LifeBuoy size={20} />} text="Help" />
        </Sidebar>
      </div>
    </>
  )
}

export default ManageCourirer;
