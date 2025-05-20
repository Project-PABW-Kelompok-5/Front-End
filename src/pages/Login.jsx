import Background from "../assets/background.jpg";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase"; 
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth"; 

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
      // 1. Login dengan Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // // verifikasi email
      // if (!user.emailVerified) {
      //   alert("Email belum diverifikasi. Silakan cek email Anda untuk verifikasi.");
      //   setIsLoading(false);
      //   return;
      // }

      // 2. Ambil token JWT
      const token = await user.getIdToken();

      // 3. Ambil data user dari Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("Data pengguna tidak ditemukan di Firestore.");
      }

      const userData = userDoc.data();

      // 4. Simpan token dan user info ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({
        id: user.uid,
        email: user.email,
        role: userData.role,
      }));

      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userData.role === "user") {
        navigate("/");
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
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // ubah 0.5 jadi lebih kecil/besar sesuai gelapnya
          zIndex: 1,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          zIndex: 2,
        }}
      >
        <h1 style={{ marginBottom: "40px", color: "#fff", fontSize: "40px" }}>
          Let’s Get Back to Shopping!
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{
            width: "400px",
            padding: "35px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "32px",
              marginBottom: "20px",
            }}
          >
            Login
          </h2>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "16px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or phone number"
              style={{
                width: "93%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
              required
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "16px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "93%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                fontSize: "14px",
              }}
              required
            />
          </div>
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <a
              href="/forgot-password"
              style={{
                color: "#6941C6",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Forgot Password?
            </a>
          </div>
          <button
            href="/"
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#A100ED",
              color: "#fff",
              border: "none",
              borderRadius: "32px",
              cursor: "pointer",
              fontSize: "18px",
              marginBottom: "12px",
            }}
          >
            Login
          </button>
          <div
            style={{ display: "flex", alignItems: "center", margin: "12px 0" }}
          ></div>
          <button
            type="button"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#FFF",
              color: "#344054",
              border: "1px solid #ccc",
              borderRadius: "32px",
              cursor: "pointer",
              fontSize: "16px",
              marginBottom: "12px",
            }}
          >
            Continue with Google
          </button>
          <div
            style={{ textAlign: "center", marginTop: "12px", fontSize: "16px" }}
          >
            <span>Already have an account? </span>
            <a
              href="/register"
              style={{
                color: "#6941C6",
                textDecoration: "none",
                cursor: "pointer",
              }}
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
