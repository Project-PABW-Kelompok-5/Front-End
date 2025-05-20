import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar.jsx';

const API_URL = 'http://localhost:3000/api/admin/users'; 

const ManageBalance = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
  
      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = await response.json();
  
        // Sesuaikan jika responsnya dibungkus seperti { users: [...] }
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("Format respons tidak sesuai", data);
          setUsers([]);
        }
      } catch (err) {
        console.error("Gagal fetch data pengguna", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchUsers();
    }, []);
  

  return (
    <div className="flex">
      <AdminSidebar activePage="Manage Users" />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Daftar Pengguna</h1>
        </div>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="px-6 py-3">{user.nama}</td>
                  <td className="px-6 py-3">{user.email}</td>
                  <td className="px-6 py-3">
                    {user.saldo !== undefined ? `Rp ${user.saldo.toLocaleString()}` : 'Rp 0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageBalance;
