import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import Background from "../assets/background.jpg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return alert("Email dan password wajib diisi.");
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("Data pengguna tidak ditemukan di Firestore.");
      }

      const userData = userDoc.data();

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({
        id: user.uid,
        email: user.email,
        role: userData.role,
      }));

      console.log("User data:", userData);
      console.log("User ID:", user.uid);

      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      alert("Login gagal: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen bg-cover bg-center" style={{ backgroundImage: `url(${Background})` }}>
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-white text-4xl mb-10 font-semibold text-center">Let’s Get Back to Shopping!</h1>
        <form onSubmit={handleSubmit} className="w-[400px] bg-white p-9 rounded-xl shadow-lg">
          <h2 className="text-center text-2xl font-semibold mb-5">Login</h2>

          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="text-right mb-5">
            <a href="/forgot-password" className="text-sm text-purple-600 hover:underline">Forgot Password?</a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition font-semibold text-lg mb-3"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            className="w-full py-3 bg-white text-gray-800 border border-gray-300 rounded-full hover:bg-gray-100 transition text-sm font-medium"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm mt-4">
            Belum punya akun?{' '}
            <a href="/register" className="text-purple-600 hover:underline">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
