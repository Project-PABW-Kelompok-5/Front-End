import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import { firestore, auth } from "../firebase";

const VerifikasiEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleCekLagi = async () => {
    setLoading(true);
    const user = auth.currentUser;
    await user.reload();

    if (user.emailVerified) {
      setVerified(true);

      const pendingUser = JSON.parse(localStorage.getItem("pendingUser"));

      if (pendingUser) {
        try {
          await setDoc(doc(firestore, "users", user.uid), {
            username: pendingUser.username,
            email: pendingUser.email,
            no_telepon: pendingUser.noTelepon,
            uid: user.uid,
            role: "User",
            saldo: 0,
            tanggal_registrasi: new Date(),
          });

          localStorage.removeItem("pendingUser");
          alert("Email berhasil diverifikasi dan data berhasil disimpan!");
        } catch (err) {
          console.error("Gagal menyimpan data user ke Firestore:", err);
          alert("Terjadi kesalahan saat menyimpan data.");
        }
      } else {
        alert("Data pengguna tidak ditemukan.");
      }
    } else {
      alert("Email belum diverifikasi. Silakan cek kembali.");
    }

    setLoading(false);
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
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifikasiEmail;
