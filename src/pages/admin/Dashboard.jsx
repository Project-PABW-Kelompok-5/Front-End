import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import AdminSidebar from "../../components/AdminSidebar.jsx";
import { useState, useEffect } from "react"; 
import { db } from "../../firebase.js"; 
import { collection, getDocs } from "firebase/firestore";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [userData, setUserData] = useState(0);
  const [courierData, setCourierData] = useState(0);
  const [productData, setProductData] = useState(0);
  const [transactionData, setTransactionData] = useState(0);
  const [balanceData, setBalanceData] = useState(0); // For saldo beredar

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Count
        const usersCollectionRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollectionRef);
        setUserData(usersSnapshot.size);

        // Fetch Courier Count
        const couriersCollectionRef = collection(db, "kurir");
        const couriersSnapshot = await getDocs(couriersCollectionRef);
        setCourierData(couriersSnapshot.size);

        // Fetch Product Count
        const productsCollectionRef = collection(db, "barang");
        const productsSnapshot = await getDocs(productsCollectionRef);
        setProductData(productsSnapshot.size);

        // Fetch Transaction Count
        const transactionsCollectionRef = collection(db, "pesanan");
        const transactionsSnapshot = await getDocs(transactionsCollectionRef);
        setTransactionData(transactionsSnapshot.size);

        // Fetch Saldo Beredar from 'saldo' field in 'users' collection
        let totalBalance = 0;
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          totalBalance += userData.saldo || 0; // Assuming 'saldo' is a field in each user document
        });
        setBalanceData(totalBalance);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ['Pengguna', 'Kurir', 'Produk', 'Transaksi'],
    datasets: [
      {
        label: 'Jumlah',
        data: [userData, courierData, productData, transactionData],
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

  return (
    <>
      <div className="flex">
        <AdminSidebar activePage="Dashboard" />
        <div className="flex-1 p-6 bg-gray-100 min-h-screen overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Total Pengguna</p>
              <h2 className="text-xl font-bold">{userData}</h2>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Total Kurir</p>
              <h2 className="text-xl font-bold">{courierData}</h2>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Transaksi Berjalan</p>
              <h2 className="text-xl font-bold">{transactionData}</h2>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm">Saldo Beredar</p>
              <h2 className="text-xl font-bold">Rp {balanceData.toLocaleString('id-ID')}</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md h-[400px]">
            <Bar data={chartData} options={options} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;