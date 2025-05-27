import React, { useState } from "react";
import Background from "../assets/homepage/background.svg";
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

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !username || !noTelepon) {
      return alert("Semua field wajib diisi.");
    }

    if (!isValidEmail(email)) {
      return alert("Format email tidak valid.");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      alert("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.");

      // Simpan data user sementara di localStorage
      localStorage.setItem(
        "pendingUser",
        JSON.stringify({
          username,
          email,
          noTelepon,
          uid: user.uid,
        })
      );

      window.location.href = "/verifikasi-email";
    } catch (error) {
      console.error("Firebase Error:", error.message);
      alert("Registrasi gagal: " + error.message);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${Background})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <h1 className="text-white text-3xl sm:text-4xl text-center font-bold mb-8">
          Start Your Shopping Journey!
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200"
        >
          <h2 className="text-center text-2xl sm:text-3xl font-semibold mb-6">
            Register
          </h2>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-2 text-gray-700 font-medium"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block mb-2 text-gray-700 font-medium"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Username */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block mb-2 text-gray-700 font-medium"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label
              htmlFor="phone"
              className="block mb-2 text-gray-700 font-medium"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-lg text-lg font-semibold transition duration-300 cursor-pointer"
          >
            Register
          </button>

          {/* Link */}
          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-purple-700 hover:underline font-medium"
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
