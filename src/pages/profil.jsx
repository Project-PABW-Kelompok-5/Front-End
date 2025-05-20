"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Camera,
  Edit,
  LogOut,
  Shield,
} from "lucide-react";

// Data dummy untuk profil pengguna
const userData = {
  name: "John Doe",
  email: "johndoe@example.com",
  phone: "+62 812 3456 7890",
  username: "johndoe",
  address: "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta, 10220",
  profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
  isEmailVerified: true,
  isPhoneVerified: false,
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State untuk form edit profil
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    username: userData.username,
    address: userData.address,
  });

  // State untuk form ubah kata sandi
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const historyPengiriman = () => {
    navigate("/historyPengiriman");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #4a2362 0%, #08001a 100%)",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div
              className="rounded-lg shadow p-6 mb-6"
              style={{ backgroundColor: "#ffffff" }}
            >
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <img
                    src={userData.profilePicture || "/placeholder.svg"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <button
                    className="absolute bottom-0 right-0 p-2 rounded-full transition"
                    style={{
                      backgroundColor: "#753799",
                      color: "#ffffff",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#5a2d7a")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#753799")
                    }
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold" style={{ color: "#100428" }}>
                  {userData.name}
                </h2>
                <p className="text-sm" style={{ color: "#753799" }}>
                  {userData.username}
                </p>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`group w-full flex items-center px-4 py-3 rounded-md text-left ${
                    activeTab === "profile"
                      ? "text-white"
                      : "hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === "profile" ? "#753799" : "transparent",
                    color: activeTab === "profile" ? "#ffffff" : "#100428",
                    transition: "all 0.3s ease",
                  }}
                >
                  <User
                    className={`w-5 h-5 mr-3 ${
                      activeTab === "profile"
                        ? "text-white"
                        : "text-[#753799] group-hover:text-white"
                    }`}
                  />
                  <span>{`Profil Saya`}</span>
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`group w-full flex items-center px-4 py-3 rounded-md text-left ${
                    activeTab === "security"
                      ? "text-white"
                      : "hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === "security" ? "#753799" : "transparent",
                    color: activeTab === "security" ? "#ffffff" : "#100428",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Shield
                    className={`w-5 h-5 mr-3 ${
                      activeTab === "security"
                        ? "text-white"
                        : "text-[#753799] group-hover:text-white"
                    }`}
                  />
                  <span>Keamanan</span>
                </button>

                <button
                  onClick={historyPengiriman}
                  className={`group w-full flex items-center px-4 py-3 rounded-md text-left ${
                    activeTab === "orders"
                      ? "text-white"
                      : "hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === "orders" ? "#753799" : "transparent",
                    color: activeTab === "orders" ? "#ffffff" : "#100428",
                    transition: "all 0.3s ease",
                  }}
                >
                  <ShoppingBag
                    className={`w-5 h-5 mr-3 ${
                      activeTab === "orders"
                        ? "text-white"
                        : "text-[#753799] group-hover:text-white"
                    }`}
                  />
                  <span>History Pembelian</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow">
                <div
                  className="p-6 border-b"
                  style={{
                    borderColor: "#753799",
                    background:
                      "linear-gradient(90deg, #753799 0%, #100428 100%)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                      Informasi Profil
                    </h2>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center text-white hover:text-[#d6b3ff]"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {!isEditingProfile ? (
                    <div className="space-y-4">
                      {/* Item */}
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-[#753799] mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-[#100428]">
                            Nama Lengkap
                          </h3>
                          <p>{userData.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-[#753799] mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-[#100428]">
                            Email
                          </h3>
                          <p className="flex items-center">
                            {userData.email}
                            {userData.isEmailVerified && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-[#753799] text-white rounded-full">
                                Terverifikasi
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Phone className="w-5 h-5 text-[#753799] mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-[#100428]">
                            Nomor Telepon
                          </h3>
                          <p className="flex items-center">
                            {userData.phone}
                            {userData.isPhoneVerified ? (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-[#753799] text-white rounded-full">
                                Terverifikasi
                              </span>
                            ) : (
                              <button className="ml-2 px-2 py-0.5 text-xs bg-[#100428] text-white rounded-full hover:bg-[#753799] transition">
                                Verifikasi Sekarang
                              </button>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <User className="w-5 h-5 text-[#753799] mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-[#100428]">
                            Username
                          </h3>
                          <p>{userData.username}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-[#753799] mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-[#100428]">
                            Alamat Pengiriman
                          </h3>
                          <p>{userData.address}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form className="space-y-4">
                      {/* Inputs */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-[#100428] mb-1"
                        >
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#100428]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-[#100428] mb-1"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#100428]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-[#100428] mb-1"
                        >
                          Nomor Telepon
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#100428]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="username"
                          className="block text-sm font-medium text-[#100428] mb-1"
                        >
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#100428]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium text-[#100428] mb-1"
                        >
                          Alamat Pengiriman
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          rows={3}
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#100428]"
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2 border border-[#753799] rounded-md text-[#753799] hover:bg-[#100428] hover:text-white transition"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2 bg-gradient-to-r from-[#753799] to-[#100428] text-white rounded-md hover:from-[#632f86] hover:to-[#0d041f] transition"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-lg shadow">
                <div
                  className="p-6 border-b"
                  style={{
                    borderColor: "#753799",
                    background:
                      "linear-gradient(90deg, #753799 0%, #100428 100%)",
                  }}
                >
                  <h2 className="text-xl font-bold text-white">
                    Pengaturan Keamanan
                  </h2>
                </div>

                <div className="p-6">
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-[#100428]">
                        Ubah Kata Sandi
                      </h3>
                      {!isChangingPassword && (
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className="flex items-center text-[#753799] hover:text-[#100428]"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          <span>Ubah</span>
                        </button>
                      )}
                    </div>

                    {isChangingPassword && (
                      <form className="space-y-4">
                        <div>
                          <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-[#100428] mb-1"
                          >
                            Kata Sandi Saat Ini
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#100428]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-[#100428] mb-1"
                          >
                            Kata Sandi Baru
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#100428]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-[#100428] mb-1"
                          >
                            Konfirmasi Kata Sandi Baru
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799] focus:border-[#100428]"
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setIsChangingPassword(false)}
                            className="px-4 py-2 border border-[#753799] rounded-md text-[#753799] hover:bg-[#100428] hover:text-white transition"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsChangingPassword(false)}
                            className="px-4 py-2 bg-gradient-to-r from-[#753799] to-[#100428] text-white rounded-md hover:from-[#632f86] hover:to-[#0d041f] transition"
                          >
                            Perbarui Kata Sandi
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-4 text-[#100428]">
                      Verifikasi
                    </h3>

                    <div className="flex items-center justify-between p-4 border border-[#753799] rounded-lg">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-[#753799] mr-3" />
                        <div>
                          <p className="font-medium text-[#100428]">
                            Verifikasi Email
                          </p>
                          <p className="text-sm text-[#100428]">
                            {userData.email}
                          </p>
                        </div>
                      </div>
                      {userData.isEmailVerified ? (
                        <span className="px-3 py-1 bg-[#753799] text-white rounded-full text-sm">
                          Terverifikasi
                        </span>
                      ) : (
                        <button className="px-3 py-1 bg-gradient-to-r from-[#753799] to-[#100428] text-white rounded-md text-sm hover:from-[#632f86] hover:to-[#0d041f] transition">
                          Verifikasi
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 border border-[#753799] rounded-lg">
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-[#753799] mr-3" />
                        <div>
                          <p className="font-medium text-[#100428]">
                            Verifikasi Nomor Telepon
                          </p>
                          <p className="text-sm text-[#100428]">
                            {userData.phone}
                          </p>
                        </div>
                      </div>
                      {userData.isPhoneVerified ? (
                        <span className="px-3 py-1 bg-[#753799] text-white rounded-full text-sm">
                          Terverifikasi
                        </span>
                      ) : (
                        <button className="px-3 py-1 bg-gradient-to-r from-[#753799] to-[#100428] text-white rounded-md text-sm hover:from-[#632f86] hover:to-[#0d041f] transition">
                          Verifikasi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;