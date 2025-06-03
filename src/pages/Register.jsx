import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/dashboardAdmin/logo.png";
import { auth } from "../firebase"; // HANYA import auth
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const regex = /^\+?[0-9]{7,15}$/;
    return regex.test(phoneNumber);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !username || !noTelepon) {
      toast.error("Semua kolom wajib diisi.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Format email tidak valid.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    {/* // ... (kode validasi lainnya) ... */}
    }

    if (!isValidPhoneNumber(noTelepon)) {
      toast.error("Format nomor telepon tidak valid. Gunakan 7-15 digit.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      // --- PERUBAHAN UTAMA DI SINI ---
      // Simpan data tambahan di localStorage, bukan sessionStorage
      localStorage.setItem(
        "pendingUserForFirestore",
        JSON.stringify({
          uid: user.uid,
          username: username,
          email: email, // Simpan email juga untuk konsistensi
          noTelepon: noTelepon,
        })
      );
      // --- AKHIR PERUBAHAN ---

      toast.success("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");
      navigate("/verifikasi-email");
    } catch (error) {
      console.error("Firebase Error:", error.message);
      let errorMessage = "Registrasi gagal. Silakan coba lagi.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email ini sudah terdaftar. Silakan gunakan email lain atau login.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password terlalu lemah. Seharusnya minimal 6 karakter dan idealnya mencakup campuran huruf besar, huruf kecil, angka, dan simbol.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error("Registrasi gagal: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... (JSX untuk form register, tidak ada perubahan di sini) ...
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#753799] to-[#100428]  z-0" />
      <div
        className="flex flex-col items-center justify-center w-full z-20 p-4 sm:p-6 md:p-8 lg:p-10"
        style={{ minHeight: '100vh' }}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm p-5 sm:p-6 rounded-lg bg-white shadow-lg border border-gray-200 flex flex-col justify-center"
        >
          <div className="text-center mb-6">
            <img
              src={Logo}
              alt="Logo"
              className="w-24 h-auto block mx-auto"
            />
          </div>
          <h2 className="text-center text-2xl font-poppins font-semibold mb-5 text-gray-800">
            Register
          </h2>

          <div className="mb-3">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              required
              className="w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
              required
              className="w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password Anda"
              required
              className="w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username Anda"
              required
              className="w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input
              type="tel"
              id="phone"
              value={noTelepon}
              onChange={(e) => setNoTelepon(e.target.value)}
              placeholder="Masukkan nomor telepon Anda (misal: +62812...)"
              required
              className="w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 text-white rounded-full text-base font-semibold hover:bg-purple-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Mendaftar..." : "Daftar"}
          </button>

          <p className="text-center mt-3 text-xs sm:text-sm text-gray-600">
            Sudah punya akun?{" "}
            <a
              href="/login"
              className="text-purple-700 hover:underline cursor-pointer"
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;