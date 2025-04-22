import React, { useState } from "react";
import Background from "../assets/background.jpg";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Email:", email);
    console.log("Password:", password);
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
          Start Your Shopping Journey!
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
            Register
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
              Email or Phone Number
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
          <button
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
            Register
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
              href="/login"
              style={{
                color: "#6941C6",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
