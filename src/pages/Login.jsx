import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import {
  signInWithEmailAndPassword
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import Background from "../assets/background.jpg"; // Tetap diimpor, meskipun tidak digunakan secara langsung di className jika background diatur di CSS lain
import Logo from "../assets/dashboardAdmin/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      // Menggunakan alert browser standar. Bisa diganti dengan UI modal kustom.
      return alert("Email dan password wajib diisi.");
    }

    setIsLoading(true);

    try {
      // Percobaan login sebagai kurir (courier) terlebih dahulu
      const kurirQuery = query(
        collection(firestore, "kurir"),
        where("email", "==", email),
        where("password", "==", password) // PENTING: Menyimpan dan mengkueri password seperti ini sangat tidak aman.
                                         // Password HARUS di-hash (misalnya menggunakan bcrypt) dan dibandingkan dengan aman.
      );
      const kurirSnapshot = await getDocs(kurirQuery);

      if (!kurirSnapshot.empty) {
        const kurirDoc = kurirSnapshot.docs[0];
        const kurirData = kurirDoc.data();

        localStorage.setItem("user", JSON.stringify({
          id: kurirDoc.id,
          email: kurirData.email,
          role: "kurir",
        }));

        navigate("/kurir/dashboard");
        return; // Hentikan eksekusi jika berhasil login sebagai kurir
      }

      // Jika bukan kurir, coba otentikasi Firebase (untuk admin/pengguna biasa)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verifikasi email pengguna
      if (!user.emailVerified) {
        alert("Email belum diverifikasi. Silakan cek email Anda.");
        // Opsional: signOut pengguna jika email belum diverifikasi
        // await auth.signOut();
        return;
      }

      const token = await user.getIdToken();
      // Ambil data peran pengguna dari Firestore
      const userDoc = await getDoc(doc(firestore, "users", user.uid));

      if (!userDoc.exists()) {
        throw new Error("Data pengguna tidak ditemukan.");
      }

      const userData = userDoc.data();

      // Simpan token dan data pengguna ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({
        id: user.uid,
        email: user.email,
        role: userData.role,
      }));

      // Navigasi berdasarkan peran pengguna
      navigate(userData.role === "admin" ? "/admin/dashboard" : "/");
    } catch (error) {
      // Tangani berbagai jenis kesalahan login
      let errorMessage = "Login gagal. Silakan coba lagi.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Email atau password salah.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Format email tidak valid.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert("Login gagal: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Kontainer utama - background, flex, center konten
    <div
      className="relative flex flex-col items-center justify-center min-h-screen "
      // Jika Anda ingin menggunakan gambar background, uncomment baris di bawah ini dan sesuaikan
      // style={{ backgroundImage: `url(${Background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#753799] to-[#100428] bg-opacity-50 z-10" />

      {/* Kontainer konten (form) - di tengah di atas overlay */}
      <div className="flex flex-col items-center justify-center min-h-screen w-full z-20 p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm p-6 border border-gray-300 rounded-lg bg-white shadow-lg"
        >
          {/* Bagian Logo */}
          <div className="text-center mb-6">
            <img
              src={Logo}
              alt="Logo"
              className="w-24 h-auto block mx-auto" // Lebar 96px, di tengah secara horizontal
            />
          </div>
          <h2 className="text-center text-3xl font-poppins font-bold mb-6 text-purple-700">
            Login
          </h2>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="text-left mb-6">
            <a
              href="/forgot-password"
              className="text-purple-700 hover:underline text-sm"
            >
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-full text-lg font-semibold hover:bg-purple-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center mt-4 text-sm text-gray-600">
            <span>Belum punya akun? </span>
            <a
              href="/register"
              className="text-purple-700 hover:underline cursor-pointer"
            >
              Register
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;