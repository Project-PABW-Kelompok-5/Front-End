// src/pages/admin/Dashboard.jsx
import AdminSidebar from '../../components/AdminSidebar.jsx';

const ManageProduct = () => {
  return (
    <>
      <div className="flex">
        <AdminSidebar activePage="Manage Product" />
        <div className="flex-1 p-6 bg-gray-100 min-h-screen">
          <h1 className="text-2xl font-semibold">Manage Product</h1>
          {/* Add your content here */}
        </div>
      </div>
    </>
  )
}

export default ManageProduct;
