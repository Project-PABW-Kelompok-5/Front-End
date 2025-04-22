import { useState } from "react";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    no_telepon: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:3000/api/auth/register", form);
      setSuccess("Registrasi berhasil! Silakan login.");
      setForm({
        username: "",
        email: "",
        password: "",
        no_telepon: "",
      });
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Terjadi kesalahan saat registrasi.");
      }
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          name="no_telepon"
          placeholder="No Telepon"
          value={form.no_telepon}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
