import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/dashboardAdmin/logo.png";
import { auth, firestore } from "../firebase"; // Import auth dan firestore
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import fungsi Firestore
import { toast } from "react-toastify";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error("Email dan password harus diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 1. Cek apakah email sudah diverifikasi
      if (!user.emailVerified) {
        // Jika belum diverifikasi, berikan pesan dan mungkin opsi untuk mengirim ulang verifikasi
        toast.error("Email Anda belum diverifikasi. Silakan cek kotak masuk email Anda.");
        setIsLoading(false);
        // Opsional: berikan opsi untuk mengirim ulang email verifikasi
        // await sendEmailVerification(user);
        // toast.info("Email verifikasi telah dikirim ulang.");
        return;
      }

      // 2. Cek apakah ada data pengguna tertunda di localStorage
      const pendingUserDataString = localStorage.getItem("pendingUserForFirestore");
      let pendingUserData = null;

      if (pendingUserDataString) {
        try {
          pendingUserData = JSON.parse(pendingUserDataString);
        } catch (parseError) {
          console.error("Error parsing pending user data from localStorage:", parseError);
          localStorage.removeItem("pendingUserForFirestore"); // Hapus data yang rusak
        }
      }

      // 3. Jika email terverifikasi DAN ada data tertunda, simpan ke Firestore
      if (pendingUserData && pendingUserData.uid === user.uid) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) { // Pastikan dokumen belum ada
          await setDoc(userDocRef, {
            uid: user.uid,
            username: pendingUserData.username,
            email: user.email, // Gunakan email dari Firebase Auth untuk kepastian
            noTelepon: pendingUserData.noTelepon,
            role: "user", // Tetapkan peran default
            isEmailVerified: true,
            saldoUangElektronik: 0,
            createdAt: new Date(),
            verifiedAt: new Date(), // Waktu verifikasi
          });
          toast.success("Profil Anda berhasil dibuat!");
          localStorage.removeItem("pendingUserForFirestore"); // Hapus data dari localStorage
        } else {
          // Jika dokumen sudah ada (misalnya, pengguna login dari perangkat lain)
          // Anda bisa memperbarui isEmailVerified jika perlu atau abaikan
          await setDoc(userDocRef, {
             isEmailVerified: true,
             verifiedAt: new Date(),
          }, { merge: true }); // Gunakan merge agar tidak menimpa field lain
          localStorage.removeItem("pendingUserForFirestore");
          toast.info("Selamat datang kembali!");
        }
      } else {
        // Jika tidak ada data tertunda atau UID tidak cocok,
        // cek apakah pengguna sudah ada di Firestore 'users' atau belum.
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            // Ini bisa terjadi jika pengguna langsung login tanpa melewati flow register dengan localStorage.
            // Buat dokumen dasar untuk mereka.
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                username: user.displayName || "Pengguna Baru", // Jika tidak ada username dari register, pakai displayName atau default
                noTelepon: null, // Jika tidak ada noTelepon dari register, set null atau minta user untuk mengisi
                role: "user",
                isEmailVerified: true,
                saldoUangElektronik: 0,
                createdAt: new Date(),
                verifiedAt: new Date(),
            });
            toast.success("Selamat datang!");
        } else {
            // Pengguna sudah ada di Firestore. Login berhasil.
            toast.success("Login berhasil!");
        }
      }

      // Arahkan pengguna ke dashboard atau halaman selanjutnya
      navigate("/"); // Ganti dengan path dashboard pengguna Anda
    } catch (error) {
      console.error("Firebase Login Error:", error.message);
      let errorMessage = "Login gagal. Silakan coba lagi.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Email atau password salah.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Format email tidak valid.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error("Login gagal: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#753799] to-[#100428] z-0" />
      <div
        className="flex flex-col items-center justify-center w-full z-20 p-4 sm:p-6 md:p-8 lg:p-10"
        style={{ minHeight: '100vh' }}
      >
        <form
          onSubmit={handleLogin}
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
            Login
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

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 text-white rounded-full text-base font-semibold hover:bg-purple-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Masuk..." : "Masuk"}
          </button>

          <p className="text-center mt-3 text-xs sm:text-sm text-gray-600">
            Belum punya akun?{" "}
            <a
              href="/register"
              className="text-purple-700 hover:underline cursor-pointer"
            >
              Daftar
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;