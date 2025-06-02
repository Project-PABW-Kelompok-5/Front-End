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
import { LogOut } from "lucide-react"; // Import icon LogOut
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getAuth, signOut } from "firebase/auth"; // Import Firebase auth functions
import { app } from "../../firebase.js"; // Import Firebase app instance

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [userData, setUserData] = useState(0);
  const [courierData, setCourierData] = useState(0);
  const [productData, setProductData] = useState(0);
  const [transactionData, setTransactionData] = useState(0);
  const [balanceData, setBalanceData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const navigate = useNavigate(); // Inisialisasi useNavigate
  const auth = getAuth(app); // Inisialisasi Firebase Auth

  const showCustomDialog = (message) => {
    setDialogMessage(message);
    setShowAlertDialog(true);
  };

  // Fungsi handleLogout untuk tombol di header
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      showCustomDialog("Terjadi kesalahan saat logout. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersCollectionRef = collection(db, "users");
        const couriersCollectionRef = collection(db, "kurir");
        const productsCollectionRef = collection(db, "barang");
        const transactionsCollectionRef = collection(db, "pesanan");

        const [usersSnapshot, couriersSnapshot, productsSnapshot, transactionsSnapshot] = await Promise.all([
          getDocs(usersCollectionRef),
          getDocs(couriersCollectionRef),
          getDocs(productsCollectionRef),
          getDocs(transactionsCollectionRef),
        ]);

        setUserData(usersSnapshot.size);
        setCourierData(couriersSnapshot.size);
        setProductData(productsSnapshot.size);
        setTransactionData(transactionsSnapshot.size);

        let totalBalance = 0;
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          totalBalance += userData.saldo || 0;
        });
        setBalanceData(totalBalance);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showCustomDialog("Gagal mengambil data dashboard. Silakan coba lagi.");
        setUserData(0);
        setCourierData(0);
        setProductData(0);
        setTransactionData(0);
        setBalanceData(0);
      } finally {
        setLoading(false);
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
          'rgba(59, 130, 246, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
        borderRadius: 8,
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
        font: {
          size: 18,
          weight: 'bold',
        },
        color: '#333',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#555',
                font: { size: 12 },
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
                color: '#555',
                font: { size: 12 },
                precision: 0,
            },
        },
    }
  };

  return (
    <>
      <div className="flex font-sans">
        <AdminSidebar activePage="Dashboard" />
        <div className="flex-1 p-6 bg-gray-100 min-h-screen overflow-y-auto">
          {/* Header dengan judul dan tombol logout */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 shadow-md"
              title="Logout"
            >
              <LogOut size={20} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-600">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Memuat data dashboard...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Pengguna</p>
                  <h2 className="text-3xl font-extrabold text-blue-600">{userData}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Kurir</p>
                  <h2 className="text-3xl font-extrabold text-green-600">{courierData}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Produk</p>
                  <h2 className="text-3xl font-extrabold text-yellow-600">{productData}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 transform hover:scale-105 transition-transform duration-200">
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Transaksi</p>
                  <h2 className="text-3xl font-extrabold text-red-600">{transactionData}</h2>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 transform hover:scale-105 transition-transform duration-200 col-span-full md:col-span-2 lg:col-span-4">
                  <p className="text-gray-600 text-sm font-medium mb-1">Saldo Beredar</p>
                  <h2 className="text-3xl font-extrabold text-purple-600">Rp {balanceData.toLocaleString('id-ID')}</h2>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-[450px] flex items-center justify-center">
                <Bar data={chartData} options={options} />
              </div>
            </>
          )}
        </div>
      </div>

      {showAlertDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Informasi</h3>
            <p className="mb-6 text-gray-700">{dialogMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAlertDialog(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;