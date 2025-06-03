import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import { firestore, auth } from "../firebase";
import { toast } from "react-toastify"; // Added Toastify for consistent notifications

const VerifikasiEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleCekLagi = async () => {
    setLoading(true);
    const user = auth.currentUser;

    if (!user) {
      toast.error("No active user found. Please register or log in again.");
      setLoading(false);
      navigate("/register"); // Redirect to register if no user is found
      return;
    }

    try {
      await user.reload(); // Reload user data to get latest verification status

      if (user.emailVerified) {
        setVerified(true);

        // --- CRITICAL FIX HERE: Ensured consistency with localStorage ---
        const pendingUser = JSON.parse(localStorage.getItem("pendingUser"));

        if (pendingUser && pendingUser.uid === user.uid) { // Added UID check for robustness
          try {
            await setDoc(doc(firestore, "users", user.uid), {
              username: pendingUser.username,
              email: pendingUser.email,
              no_telepon: pendingUser.noTelepon,
              uid: user.uid,
              role: "User",
              saldo: 0, // Initial saldo
              tanggal_registrasi: new Date(),
            });

            localStorage.removeItem("pendingUser"); // Clear pending data after successful save
            toast.success("Email successfully verified and user data saved!");
          } catch (err) {
            console.error("Failed to save user data to Firestore:", err);
            toast.error("An error occurred while saving your data. Please try again.");
          }
        } else if (pendingUser && pendingUser.uid !== user.uid) {
          toast.warn("Mismatch between current user and pending data. Please re-register if needed.");
          localStorage.removeItem("pendingUser"); // Clear stale pending data
        }
        else {
          toast.info("User data not found in local storage. Proceed to login if already registered.");
          // No pending user data, maybe the user already registered and verified or the data was lost.
          // We can still allow them to login if verified.
        }
      } else {
        toast.warn("Email is not yet verified. Please check your inbox and spam folder.");
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      toast.error("Failed to check verification status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-blue-100 to-blue-300 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-2">
          Verifikasi Email
        </h1>
        <p className="text-gray-600 mb-6">
          Kami telah mengirim email verifikasi ke akun Anda. Silakan buka email
          dan klik tautan verifikasi sebelum melanjutkan.
        </p>

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

        {verified && (
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2 px-4 rounded-lg border text-[#753799] hover:bg-blue-50 transition cursor-pointer"
          >
            Login Sekarang
          </button>
        )}

        {!verified && (
          <p className="text-sm text-gray-500 mt-4">
            Belum menerima email? Cek folder spam atau klik "Cek Lagi" setelah
            beberapa saat.
            {/* You could add a resend email button here if desired */}
            {/* <button onClick={handleResendEmail} disabled={loading} className="text-blue-500 hover:underline ml-1">Resend Email</button> */}
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifikasiEmail;