import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";

const Profil = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
      setNewName(storedUser.name || "");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleSaveName = () => {
    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto py-12 px-6 w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Profil Pengguna</h2>
        <div className="bg-white shadow-md rounded-xl p-6">
          {/* Nama */}
          <div className="mb-4">
            <label className="font-semibold text-gray-700">Nama:</label>
            {isEditing ? (
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border border-gray-300 px-3 py-1 rounded-md text-gray-800"
                />
                <button
                  onClick={handleSaveName}
                  className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center mt-1">
                <p className="text-gray-800">{user.name || "Nama tidak tersedia"}</p>
                <button
                  onClick={handleEditToggle}
                  className="text-blue-500 hover:underline text-sm"
                >
                  Ubah
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="font-semibold text-gray-700">Email:</label>
            <p className="text-gray-800">{user.email || "Email tidak tersedia"}</p>
          </div>

          {/* Peran */}
          <div className="mb-4">
            <label className="font-semibold text-gray-700">Peran:</label>
            <p className="text-gray-800 capitalize">{user.role || "user"}</p>
          </div>

          {/* Logout */}
          <div className="flex justify-end">
            <button
              onClick={handleLogout}
              className="mt-6 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profil;
