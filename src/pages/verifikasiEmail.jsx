import { useState, useEffect } from "react"; // Import useEffect
import { useNavigate } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import { firestore, auth } from "../firebase";
import { onAuthStateChanged, reload, sendEmailVerification } from "firebase/auth"; // Import sendEmailVerification
import { toast } from "react-toastify"; // Import toast for better notifications

const VerifikasiEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [verified, setVerified] = useState(false);
  const [user, setUser] = useState(null); // State to hold the Firebase user object

  // This effect runs once on component mount to check initial verification status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Reload user to get the latest emailVerified status
        await reload(currentUser);
        if (currentUser.emailVerified) {
          setVerified(true);
          // Directly attempt to save data if already verified on mount
          handleSaveUserData(currentUser);
        } else {
          setVerified(false);
        }
      } else {
        // No user logged in, navigate to register or login
        toast.warn("Anda belum login atau terdaftar. Silakan registrasi atau login.");
        navigate("/register"); // Or "/login" based on your flow
      }
      setLoading(false); // Done with initial check
    });

    return () => unsubscribe(); // Cleanup the listener
  }, [navigate]); // Depend on navigate

  // Function to handle saving user data to Firestore
  const handleSaveUserData = async (currentUser) => {
    const pendingUserDataString = localStorage.getItem("pendingUserForFirestore"); // Use the correct key

    if (pendingUserDataString) {
      try {
        const pendingUserData = JSON.parse(pendingUserDataString);

        // Ensure user data has necessary fields before saving
        if (!pendingUserData.username || !pendingUserData.noTelepon) {
          toast.error("Data pengguna tidak lengkap di penyimpanan lokal. Silakan coba registrasi ulang.");
          localStorage.removeItem("pendingUserForFirestore"); // Clear incomplete data
          navigate("/register");
          return;
        }

        await setDoc(doc(firestore, "users", currentUser.uid), {
          username: pendingUserData.username,
          email: currentUser.email, // Use email from currentUser for reliability
          no_telepon: pendingUserData.noTelepon,
          uid: currentUser.uid,
          role: "User", // Default role
          saldo: 0, // Default saldo
          tanggal_registrasi: new Date(),
        });

        localStorage.removeItem("pendingUserForFirestore");
        toast.success("Email berhasil diverifikasi dan data berhasil disimpan!");
        navigate("/login"); // Or navigate to dashboard user, e.g., "/dashboard-user"
      } catch (err) {
        console.error("Gagal menyimpan data user ke Firestore:", err);
        toast.error("Terjadi kesalahan saat menyimpan data pengguna.");
      }
    } else {
      // This case might happen if user is already verified and pending data was processed/deleted,
      // or if they directly navigated here after manual email verification.
      toast.info("Data pengguna tambahan tidak ditemukan, mungkin sudah tersimpan atau tidak diperlukan. Silakan login.");
      navigate("/login");
    }
  };

  // Function to handle "Cek Status Verifikasi" button click
  const handleCekLagi = async () => {
    setLoading(true);
    if (user) {
      await reload(user); // Force reload user data
      if (user.emailVerified) {
        setVerified(true);
        await handleSaveUserData(user); // Attempt to save data immediately
      } else {
        toast.warn("Email Anda masih belum diverifikasi. Silakan cek kotak masuk atau spam.");
        setVerified(false);
      }
    } else {
      toast.error("Tidak ada pengguna aktif. Silakan login atau registrasi ulang.");
      navigate("/login"); // Direct to login if no user
    }
    setLoading(false);
  };

  // Function to resend verification email
  const handleResendEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        toast.info("Email verifikasi baru telah dikirim. Cek kotak masuk Anda.");
      } catch (error) {
        console.error("Error resending email:", error);
        toast.error("Gagal mengirim ulang email verifikasi. Silakan coba lagi.");
      }
    } else {
      toast.error("Tidak ada pengguna untuk mengirim ulang email verifikasi.");
      navigate("/login");
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-blue-100 to-blue-300 px-4">
        <div className="text-xl font-semibold text-blue-700">Memuat dan memeriksa status verifikasi...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 to-blue-300 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">Verifikasi Email</h1>
        <p className="text-gray-600 mb-6">
          Kami telah mengirim email verifikasi ke akun Anda. Silakan buka email
          dan klik tautan verifikasi sebelum melanjutkan.
        </p>

        {!verified ? (
          <>
            <button
              onClick={handleCekLagi}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg mb-4 transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              }`}
            >
              {loading ? "Mengecek..." : "Cek Status Verifikasi"}
            </button>
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg border mb-4 transition ${
                loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "text-blue-600 border-blue-600 hover:bg-blue-50 cursor-pointer"
              }`}
            >
              Kirim Ulang Email Verifikasi
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Belum menerima email? Cek folder spam atau klik "Cek Status Verifikasi" setelah
              beberapa saat.
            </p>
          </>
        ) : (
          <>
            <p className="text-lg text-green-600 font-semibold mb-4">
              Email Anda telah berhasil diverifikasi!
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2 px-4 rounded-lg bg-[#753799] text-white hover:bg-purple-700 transition cursor-pointer"
            >
              Lanjutkan ke Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifikasiEmail;