// src/pages/admin/Dashboard.jsx
import {   Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,} from "chart.js";
import { Bar} from "react-chartjs-2";
import AdminSidebar from "../../components/AdminSidebar.jsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['Pengguna', 'Kurir', 'Produk', 'Transaksi'],
  datasets: [
    {
      label: 'Jumlah',
      data: [123, 12, 87, 45], 
      backgroundColor: [
        'rgba(59, 130, 246, 0.5)',     
        'rgba(34, 197, 94, 0.5)',   
        'rgba(234, 179, 8, 0.5)',   
        'rgba(239, 68, 68, 0.5)',   
      ],
      borderRadius: 6,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Statistik Sistem E-Commerce',
      font: { size: 18 },
    },
  },
};


const Dashboard = () => {
  return (
    <>
      <div className="flex">
      <AdminSidebar activePage="Dashboard" />
        <div className="flex-1 p-6 bg-gray-100 min-h-screen overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Total Pengguna</p>
              <h2 className="text-xl font-bold">123</h2>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Total Kurir</p>
              <h2 className="text-xl font-bold">12</h2>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Transaksi Berjalan</p>
              <h2 className="text-xl font-bold">45</h2>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Saldo Beredar</p>
              <h2 className="text-xl font-bold">Rp 1.250.000</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md h-[400px]">
            <Bar data={data} options={options} />
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
