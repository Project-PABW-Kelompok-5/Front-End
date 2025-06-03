import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/dashboardAdmin/logo.png"; // Pastikan path ini sesuai dengan struktur folder Anda
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fungsi untuk memvalidasi format email
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handler untuk submit form registrasi
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah perilaku default form submit

    // Validasi input kosong
    if (!email || !password || !username || !noTelepon) {
      // Menggunakan alert sederhana, pertimbangkan modal kustom untuk UX yang lebih baik
      alert("Semua field wajib diisi.");
      return;
    }

    // Validasi format email
    if (!isValidEmail(email)) {
      alert("Format email tidak valid.");
      return;
    }

    setIsLoading(true); // Aktifkan status loading

    try {
      // Membuat user baru dengan email dan password menggunakan Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Mengirim email verifikasi ke user
      await sendEmailVerification(user);

      alert("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");

      // Menyimpan data user sementara di localStorage untuk digunakan setelah verifikasi email
      localStorage.setItem(
        "pendingUser",
        JSON.stringify({
          username,
          email,
          noTelepon,
          uid: user.uid,
        })
      );

      // Navigasi ke halaman verifikasi email setelah registrasi berhasil
      navigate("/verifikasi-email");
    } catch (error) {
      console.error("Firebase Error:", error.message); // Log error ke console

      // Menentukan pesan error yang lebih user-friendly
      let errorMessage = "Registrasi gagal. Silakan coba lagi.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email sudah terdaftar. Silakan gunakan email lain atau login.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password terlalu lemah. Minimal 6 karakter.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert("Registrasi gagal: " + errorMessage); // Tampilkan pesan error
    } finally {
      setIsLoading(false); // Nonaktifkan status loading setelah proses selesai (berhasil/gagal)
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden"
    >
      {/* Overlay: Menggunakan overlay hitam transparan untuk kontras dengan teks judul */}
      <div className="absolute inset-0 bg-gray-100 z-0" />

      {/* Kontainer form: flexbox untuk centering, mengambil tinggi penuh viewport, padding responsif */}
      <div
        className="flex flex-col items-center justify-center w-full z-20 p-4 sm:p-6 md:p-8 lg:p-10"
        style={{ minHeight: '100vh' }} // Memastikan kontainer ini juga mengambil tinggi penuh viewport
      >
        {/* Judul atas form: Ukuran font dan margin disesuaikan agar lebih responsif */}
        <h1 className="text-white text-2xl sm:text-3xl text-center font-bold font-poppins mb-6 sm:mb-8 md:mb-10">
          Start Your Shopping Journey!
        </h1>

        {/* Form registrasi: max-width untuk kontrol lebar, padding responsif, flex-col untuk layout vertikal */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm p-5 sm:p-6 rounded-lg bg-white shadow-lg border border-gray-200 flex flex-col justify-center"
        >
          {/* Bagian Logo: Centered dan ukuran disesuaikan */}
          <div className="text-center mb-6">
            <img
              src={Logo}
              alt="Logo"
              className="w-24 h-auto block mx-auto" // Lebar 96px, di tengah secara horizontal
            />
          </div>

          {/* Judul dalam form: Ukuran font dan margin disesuaikan */}
          <h2 className="text-center text-2xl font-poppins font-semibold mb-5 text-gray-800">
            Register
          </h2>

          {/* Email Input */}
          <div className="mb-3"> {/* Margin-bottom dikurangi */}
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1" // Ukuran font dan margin dikurangi
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" // Padding dan ukuran teks dikurangi
            />
          </div>

          {/* Password Input */}
          <div className="mb-3"> {/* Margin-bottom dikurangi */}
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Username Input */}
          <div className="mb-3"> {/* Margin-bottom dikurangi */}
            <label
              htmlFor="username"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number Input */}
          <div className="mb-4"> {/* Margin-bottom dikurangi */}
            <label
              htmlFor="phone"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              value={noTelepon}
              onChange={(e) => setNoTelepon(e.target.value)}
              placeholder="Enter your phone number"
              required
              className="w-full p-2 sm:p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 text-white rounded-full text-base font-semibold hover:bg-purple-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" // Padding dan ukuran teks dikurangi
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>

          {/* Link to Login */}
          <p className="text-center mt-3 text-xs sm:text-sm text-gray-600"> {/* Margin-top dan ukuran teks dikurangi */}
            Already have an account?{" "}
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
