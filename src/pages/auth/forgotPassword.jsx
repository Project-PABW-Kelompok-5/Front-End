import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/dashboardAdmin/logo.png";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Invalid email format.");
      return;
    }

    setIsLoading(true);

    try {
        await sendPasswordResetEmail(auth, email);
        // Show success message
        toast.success("Password reset email sent! You will be redirected to the login page shortly.");
        setEmail(""); 
  
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000); // 3000 milliseconds = 3 seconds
    } catch (error) {
      console.error("Firebase Error:", error.message);
      let errorMessage = "Failed to send password reset email. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with that email address.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error("Error: " + errorMessage);
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
            Forgot Password
          </h2>

          <div className="mb-4">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
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
            {isLoading ? "Sending..." : "Send Reset Email"}
          </button>

          <p className="text-center mt-3 text-xs sm:text-sm text-gray-600">
            Remember your password?{" "}
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

export default ForgotPassword;