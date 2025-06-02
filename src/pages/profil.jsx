"use client";


import { useState, useEffect } from "react";
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
  Plus,
  PenSquare,
  Trash2,
  Eye,
  EyeOff,
  BadgeDollarSign
} from "lucide-react";
import { FaHome } from "react-icons/fa";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import DropdownAlamatKaltim from "../components/DropdownAlamatKaltim";

import { 
  getAuth, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "firebase/auth";

const initialUserData = {
  name: "Pengguna Baru",
  email: "pengguna@example.com",
  phone: "+62 800 0000 0000",
  username: "pengguna_baru",
  profilePicture: "https://placehold.co/150",
  isEmailVerified: false,
  isPhoneVerified: false,
};


const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const userId = loggedInUser?.uid || loggedInUser?.id;

  const [userData, setUserData] = useState(initialUserData);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // Inisialisasi profileFormData dengan struktur yang sama tapi bisa kosong atau dari initialUserData
  const [profileFormData, setProfileFormData] = useState({
    name: initialUserData.name,
    email: initialUserData.email,
    phone: initialUserData.phone,
    username: initialUserData.username,
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addressList, setAddressList] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [currentAddressForm, setCurrentAddressForm] = useState({
    name: "",
    phone: "",
    addressDetail: "",
    provinsi: "Kalimantan Timur",
    kota: "",
    kecamatan: "",
    kodePos: "",
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // 1. useEffect untuk memuat data pengguna utama
  useEffect(() => {
    if (!userId) {
      console.warn("User ID tidak ditemukan. Tidak dapat memuat data pengguna.");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, "users", userId);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const fetchedDbData = userSnap.data();
          const newUserData = {
            name: fetchedDbData.nama || initialUserData.name,
            email: loggedInUser?.email || fetchedDbData.email || initialUserData.email,
            phone: fetchedDbData.no_telepon || initialUserData.phone,
            username: fetchedDbData.username || loggedInUser?.displayName || initialUserData.username,
            profilePicture: fetchedDbData.profilePicture || initialUserData.profilePicture,
            isEmailVerified: loggedInUser?.emailVerified || false,
            isPhoneVerified: !!fetchedDbData.no_telepon,
          };
          setUserData(newUserData);
          // JANGAN setProfileFormData di sini lagi untuk menghindari reset saat mengetik
        } else {
          console.log("Dokumen pengguna tidak ditemukan di Firestore. Menggunakan initial data.");
          setUserData(initialUserData); // Set ke initial jika tidak ditemukan
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData(initialUserData); // Fallback ke initial jika error
      }
    };

    const fetchAddresses = async () => {
      // ... (logika fetchAddresses tetap sama)
      try {
        const alamatCol = collection(firestore, `users/${userId}/alamat`);
        const snap = await getDocs(alamatCol);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAddressList(data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchUserData();
    fetchAddresses();
  }, [userId, loggedInUser]); // Perhatikan loggedInUser di sini, jika objeknya sering ganti referensi, bisa jadi masalah

  // 2. useEffect untuk menginisialisasi/menyinkronkan profileFormData dari userData
  //    HANYA jika tidak sedang dalam mode edit.
  useEffect(() => {
    if (!isEditingProfile) {
      setProfileFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        username: userData.username,
      });
    }
  }, [userData, isEditingProfile]); // Jalankan ketika userData atau isEditingProfile berubah

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Saat tombol "Edit" diklik, salin userData ke profileFormData
  const handleStartEditingProfile = () => {
    setProfileFormData({ // Salin dari userData saat ini untuk memulai edit
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      username: userData.username,
    });
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    // profileFormData akan otomatis di-reset oleh useEffect di atas karena isEditingProfile menjadi false
  };

  const handleProfileSubmit = async () => {
    if (!userId) return alert("User tidak ditemukan.");
    try {
      const userDocRef = doc(firestore, "users", userId);
      const dataToUpdate = {
        nama: profileFormData.name,
        no_telepon: profileFormData.phone,
        username: profileFormData.username,
      };
      await setDoc(userDocRef, dataToUpdate, { merge: true });

      // Update userData lokal agar UI langsung berubah (ini akan memicu useEffect no.2)
      setUserData(prev => ({
        ...prev,
        name: profileFormData.name,
        phone: profileFormData.phone,
        username: profileFormData.username,
      }));
      setIsEditingProfile(false); // Ini juga akan memicu useEffect no.2
      alert("Profil berhasil diperbarui.");
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert("Gagal memperbarui profil: " + error.message);
    }
  };

  // ... (sisa fungsi handleAddress, password, navigasi, dll tetap sama)
  const handleAddressFormChange = (e) => {
    setCurrentAddressForm({
      ...currentAddressForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAlamatKaltimChange = ({ kota, kecamatan, kodePos }) => {
    setCurrentAddressForm((prev) => ({
      ...prev,
      provinsi: "Kalimantan Timur",
      kota,
      kecamatan,
      kodePos,
    }));
  };

  const handleOpenAddModal = () => {
    setCurrentAddressForm({
      name: userData.name || "", 
      phone: userData.phone || "", 
      addressDetail: "",
      provinsi: "Kalimantan Timur",
      kota: "",
      kecamatan: "",
      kodePos: "",
    });
    setEditingAddressId(null);
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (address) => {
    setCurrentAddressForm({
      name: address.name,
      phone: address.phone,
      addressDetail: address.addressDetail,
      provinsi: address.provinsi || "Kalimantan Timur",
      kota: address.kota,
      kecamatan: address.kecamatan,
      kodePos: address.kodePos,
    });
    setEditingAddressId(address.id);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!userId) return alert("User tidak ditemukan.");
    const payload = {
      ...currentAddressForm,
      address: [
        currentAddressForm.addressDetail,
        currentAddressForm.kecamatan,
        currentAddressForm.kota,
        currentAddressForm.provinsi,
        currentAddressForm.kodePos,
      ].filter(Boolean).join(', '),
    };
    try {
      if (editingAddressId) {
        const addressDocRef = doc(firestore, `users/${userId}/alamat/${editingAddressId}`);
        await setDoc(addressDocRef, payload, { merge: true });
        setAddressList((prevList) =>
          prevList.map((addr) =>
            addr.id === editingAddressId ? { ...payload, id: editingAddressId } : addr
          )
        );
        alert("Alamat berhasil diperbarui.");
      } else {
        const alamatCol = collection(firestore, `users/${userId}/alamat`);
        const docRef = await addDoc(alamatCol, payload);
        setAddressList((prevList) => [...prevList, { ...payload, id: docRef.id }]);
        alert("Alamat baru berhasil disimpan.");
      }
      setShowAddressModal(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error("Error saving address: ", error);
      alert("Gagal menyimpan alamat: " + error.message);
    }
  };

  const handleDeleteAddress = async (addressIdToDelete) => {
    if (!userId || !addressIdToDelete) return;
    if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      try {
        const addressDocRef = doc(firestore, `users/${userId}/alamat/${addressIdToDelete}`);
        await deleteDoc(addressDocRef);
        setAddressList((prevList) => prevList.filter((addr) => addr.id !== addressIdToDelete));
        alert("Alamat berhasil dihapus.");
      } catch (error) {
        console.error("Error deleting address: ", error);
        alert("Gagal menghapus alamat: " + error.message);
      }
    }
  };
  
  //Enhanced handlePasswordChange dengan validasi real-time
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation untuk new password
    if (name === 'newPassword') {
      // const validation = validatePasswordStrength(value);
      // Bisa set state untuk menampilkan indikator kekuatan password
      // setPasswordStrength(validation);
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // const handleCancelPasswordChange = () => {
  //   setPasswordData({
  //     currentPassword: "",
  //     newPassword: "",
  //     confirmPassword: "",
  //   });
  //   setPasswordVisibility({
  //     currentPassword: false,
  //     newPassword: false,
  //     confirmPassword: false,
  //   });
  //   setIsChangingPassword(false);
  // };
  const handlePasswordSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Validasi input
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Semua field harus diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Kata sandi baru dan konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Kata sandi baru harus minimal 6 karakter.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("User tidak ditemukan. Silakan login ulang.");
        return;
      }

      // Re-authenticate user dengan password lama
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      // Reset form dan state
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordVisibility({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      setIsChangingPassword(false);

      alert("Kata sandi berhasil diperbarui!");

    } catch (error) {
      console.error("Error updating password:", error);

      // Handle specific error codes
      switch (error.code) {
        case 'auth/wrong-password':
          alert("Kata sandi saat ini salah.");
          break;
        case 'auth/weak-password':
          alert("Kata sandi baru terlalu lemah. Gunakan minimal 6 karakter.");
          break;
        case 'auth/requires-recent-login':
          alert("Untuk keamanan, silakan logout dan login ulang sebelum mengubah kata sandi.");
          break;
        case 'auth/too-many-requests':
          alert("Terlalu banyak percobaan. Silakan coba lagi nanti.");
          break;
        default:
          alert("Gagal mengubah kata sandi: " + error.message);
      }
    }
  };

  //Fungsi untuk logout dan redirect ke login (opsional untuk keamanan ekstra)
  // const handleLogoutAfterPasswordChange = () => {
  //   const auth = getAuth();
  //   auth.signOut().then(() => {
  //     localStorage.removeItem("user");
  //     navigate("/login");
  //     alert("Kata sandi berhasil diubah. Silakan login ulang untuk keamanan.");
  //   });
  // };

  //Fungsi untuk validasi password strength (opsional)
  const validatePasswordStrength = (password) => {
    const minLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength,
      strength: [minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length,
      suggestions: [
        !minLength && "Minimal 6 karakter",
        !hasUpperCase && "Tambahkan huruf besar",
        !hasLowerCase && "Tambahkan huruf kecil",
        !hasNumbers && "Tambahkan angka",
        !hasSpecialChar && "Tambahkan karakter khusus"
      ].filter(Boolean)
    };
  };

// Komponen untuk menampilkan kekuatan password (opsional)
const PasswordStrengthIndicator = ({ password }) => {
  const validation = validatePasswordStrength(password);
  const colors = ['red', 'orange', 'yellow', 'lightgreen', 'green'];
  
  return (
    <div className="mt-2">
      <div className="flex space-x-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div 
            key={i}
            className={`h-1 flex-1 rounded ${
              i <= validation.strength ? `bg-${colors[validation.strength-1]}-500` : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {validation.suggestions.length > 0 && (
        <p className="text-xs text-gray-600">
          Saran: {validation.suggestions.join(', ')}
        </p>
      )}
    </div>
  );
};
  
  const handleChangeProfilePicture = () => {
    alert("Fitur ganti foto profil belum diimplementasikan.");
  };

  const historyPengiriman = () => navigate("/history");
  const historyPenjualan = () => navigate("/history-penjualan");
  const manageBarang = () => navigate("/managebarang");
  const homepage = () => navigate("/");
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  }

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
            <div className="rounded-lg shadow p-6 mb-6" style={{ backgroundColor: "#ffffff" }}>
              {/* ... Bagian Foto Profil & Navigasi Sidebar ... */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <img
                    src={userData.profilePicture || "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <button
                    className="absolute bottom-0 right-0 p-2 rounded-full transition"
                    style={{ backgroundColor: "#753799", color: "#ffffff" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5a2d7a")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#753799")}
                    onClick={handleChangeProfilePicture}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold" style={{ color: "#100428" }}>
                  {userData.name}
                </h2>
                <p className="text-sm" style={{ color: "#753799" }}>
                  @{userData.username}
                </p>
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`group w-full flex items-center px-4 py-3 rounded-md text-left ${
                    activeTab === "profile" ? "text-white" : "hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                  }`}
                  style={{ backgroundColor: activeTab === "profile" ? "#753799" : "transparent", color: activeTab === "profile" ? "#ffffff" : "#100428", transition: "all 0.3s ease" }}
                >
                  <User className={`w-5 h-5 mr-3 ${activeTab === "profile" ? "text-white" : "text-[#753799] group-hover:text-white"}`} />
                  <span>Profil Saya</span>
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`group w-full flex items-center px-4 py-3 rounded-md text-left ${
                    activeTab === "addresses" ? "text-white" : "hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                  }`}
                  style={{ backgroundColor: activeTab === "addresses" ? "#753799" : "transparent", color: activeTab === "addresses" ? "#ffffff" : "#100428", transition: "all 0.3s ease" }}
                >
                  <MapPin className={`w-5 h-5 mr-3 ${activeTab === "addresses" ? "text-white" : "text-[#753799] group-hover:text-white"}`} />
                  <span>Alamat Saya</span>
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`group w-full flex items-center px-4 py-3 rounded-md text-left ${
                    activeTab === "security" ? "text-white" : "hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                  }`}
                  style={{ backgroundColor: activeTab === "security" ? "#753799" : "transparent", color: activeTab === "security" ? "#ffffff" : "#100428", transition: "all 0.3s ease" }}
                >
                  <Shield className={`w-5 h-5 mr-3 ${activeTab === "security" ? "text-white" : "text-[#753799] group-hover:text-white"}`} />
                  <span>Keamanan</span>
                </button>
                <button
                  onClick={historyPengiriman}
                  className="group w-full flex items-center px-4 py-3 rounded-md text-left text-[#100428] hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                >
                  <ShoppingBag className="w-5 h-5 mr-3 text-[#753799] group-hover:text-white" />
                  <span>History Pembelian</span>
                </button>
                <button
                  onClick={manageBarang}
                  className="group w-full flex items-center px-4 py-3 rounded-md text-left text-[#100428] hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                >
                  <ShoppingBag className="w-5 h-5 mr-3 text-[#753799] group-hover:text-white" />
                  <span>Produk Saya</span>
                </button>
                <button
                  onClick={historyPenjualan}
                  className="group w-full flex items-center px-4 py-3 rounded-md text-left text-[#100428] hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                >
                  <BadgeDollarSign className="w-5 h-5 mr-3 text-[#753799] group-hover:text-white" />
                  <span>History Penjualan</span>
                </button>
                <hr className="my-3 border-gray-200" />
                <button
                  onClick={homepage}
                  className="w-full flex items-center px-4 py-3 rounded-md text-left text-black hover:bg-purple-300"
                >
                  <FaHome className="w-5 h-5 mr-3 text-[#753799]" />
                  <span>Kembali ke Beranda</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 rounded-md text-left text-red-600 hover:bg-red-200">
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Keluar</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b" style={{ borderColor: "#753799", background: "linear-gradient(90deg, #753799 0%, #100428 100%)" }}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Informasi Profil</h2>
                    {!isEditingProfile && (
                      // Ganti setIsEditingProfile(true) dengan handleStartEditingProfile
                      <button onClick={handleStartEditingProfile} className="flex items-center text-white hover:text-[#d6b3ff]">
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {!isEditingProfile ? (
                    // Tampilkan data dari userData
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-[#753799] mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-[#100428]">Nama Lengkap</h3>
                          <p>{userData.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-[#753799] mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-[#100428]">Email</h3>
                          <p className="flex items-center">
                            {userData.email}
                            {userData.isEmailVerified && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-[#753799] text-white rounded-full">Terverifikasi</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 text-[#753799] mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-[#100428]">Nomor Telepon</h3>
                          <p className="flex items-center">
                            {userData.phone || "-"}
                            {userData.isPhoneVerified && userData.phone ? (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-[#753799] text-white rounded-full">Terverifikasi</span>
                            ) : (
                              userData.phone && <button className="ml-2 px-2 py-0.5 text-xs bg-[#100428] text-white rounded-full hover:bg-[#753799] transition">Verifikasi</button>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-[#753799] mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-[#100428]">Username</h3>
                          <p>{userData.username}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Form menggunakan profileFormData
                    <form onSubmit={(e) => { e.preventDefault(); handleProfileSubmit(); }} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[#100428] mb-1">Nama Lengkap</label>
                        <input type="text" id="name" name="name" value={profileFormData.name} onChange={handleProfileInputChange} className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799]" />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#100428] mb-1">Email (Tidak bisa diubah)</label>
                        <input type="email" id="email" name="email" value={profileFormData.email} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-[#100428] mb-1">Nomor Telepon</label>
                        <input type="tel" id="phone" name="phone" value={profileFormData.phone} onChange={handleProfileInputChange} className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799]" />
                      </div>
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-[#100428] mb-1">Username</label>
                        <input type="text" id="username" name="username" value={profileFormData.username} onChange={handleProfileInputChange} className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799]" />
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        {/* Panggil handleCancelEditProfile untuk tombol Batal */}
                        <button type="button" onClick={handleCancelEditProfile} className="px-4 py-2 border border-[#753799] rounded-md text-[#753799] hover:bg-[#100428] hover:text-white transition">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#753799] to-[#100428] text-white rounded-md hover:from-[#632f86] hover:to-[#0d041f] transition">Simpan Perubahan</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-lg shadow">
                 {/* ... Konten Addresses Tab ... */}
                 <div className="p-6 border-b" style={{ borderColor: "#753799", background: "linear-gradient(90deg, #753799 0%, #100428 100%)" }}>
                  <h2 className="text-xl font-bold text-white">Alamat Saya</h2>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#100428]">Daftar Alamat</h2>
                    <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#753799] to-[#100428] text-white rounded-md hover:from-[#632f86] hover:to-[#0d041f] transition">
                      <Plus className="w-4 h-4" /> Tambah Alamat
                    </button>
                  </div>
                  {addressList.length === 0 ? (
                     <p className="text-gray-500">Anda belum menambahkan alamat.</p>
                  ) : (
                    addressList.map((address) => (
                      <div key={address.id} className="border border-[#753799] rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-[#100428]">{address.name} ({address.phone})</h3>
                            <p className="text-gray-600">{address.addressDetail}</p>
                            <p className="text-gray-600">{`${address.kecamatan}, ${address.kota}, ${address.provinsi}, ${address.kodePos}`}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={() => handleOpenEditModal(address)} className="text-[#753799] hover:text-[#100428] p-1">
                              <PenSquare className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteAddress(address.id)} className="text-red-500 hover:text-red-700 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
             {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-lg shadow">
                {/* ... Konten Security Tab ... */}
                <div className="p-6 border-b" style={{ borderColor: "#753799", background: "linear-gradient(90deg, #753799 0%, #100428 100%)" }}>
                  <h2 className="text-xl font-bold text-white">Pengaturan Keamanan</h2>
                </div>
                <div className="p-6">
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-[#100428]">Ubah Kata Sandi</h3>
                      {!isChangingPassword && (
                        <button onClick={() => setIsChangingPassword(true)} className="flex items-center text-[#753799] hover:text-[#100428]">
                          <Edit className="w-4 h-4 mr-1" /> Ubah
                        </button>
                      )}
                    </div>
                    {isChangingPassword && (
                      <form onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }} className="space-y-4">
                        {/* Current Password Field */}
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-[#100428] mb-1">
                            Kata Sandi Saat Ini
                          </label>
                          <div className="relative">
                            <input
                              type={passwordVisibility.currentPassword ? "text" : "password"}
                              id="currentPassword"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-2 pr-12 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799]"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('currentPassword')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#753799] hover:text-[#100428] transition-colors"
                            >
                              {passwordVisibility.currentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password Field */}
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-[#100428] mb-1">
                            Kata Sandi Baru
                          </label>
                          <div className="relative">
                            <input
                              type={passwordVisibility.newPassword ? "text" : "password"}
                              id="newPassword"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-2 pr-12 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799]"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('newPassword')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#753799] hover:text-[#100428] transition-colors"
                            >
                              {passwordVisibility.newPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#100428] mb-1">
                            Konfirmasi Kata Sandi Baru
                          </label>
                          <div className="relative">
                            <input
                              type={passwordVisibility.confirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full px-4 py-2 pr-12 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799]"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirmPassword')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#753799] hover:text-[#100428] transition-colors"
                            >
                              {passwordVisibility.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setIsChangingPassword(false)}
                            className="px-4 py-2 border border-[#753799] rounded-md text-[#753799] hover:bg-[#100428] hover:text-white transition"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-[#753799] to-[#100428] text-white rounded-md hover:from-[#632f86] hover:to-[#0d041f] transition"
                          >
                            Perbarui Kata Sandi
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit Alamat */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
           {/* ... Konten Modal Alamat ... */}
           <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowAddressModal(false)}/>
          <div className="bg-white p-6 w-[560px] rounded-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#100428]">
                {editingAddressId ? "Edit Alamat" : "Tambah Alamat Baru"}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div className="flex gap-4">
                <input
                  name="name"
                  value={currentAddressForm.name}
                  onChange={handleAddressFormChange}
                  placeholder="Nama Lengkap Penerima"
                  required
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
                <input
                  name="phone"
                  value={currentAddressForm.phone}
                  onChange={handleAddressFormChange}
                  placeholder="No. Telepon Penerima"
                  required
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <DropdownAlamatKaltim 
                onChange={handleAlamatKaltimChange} 
                initialData={editingAddressId ? { 
                    kota: currentAddressForm.kota,
                    kecamatan: currentAddressForm.kecamatan,
                    kodePos: currentAddressForm.kodePos,
                } : undefined}
              />
              <textarea
                name="addressDetail"
                value={currentAddressForm.addressDetail}
                onChange={handleAddressFormChange}
                placeholder="Nama Jalan, Gedung, No. Rumah, Detail Patokan (Contoh: RT 01/RW 02, Sebelah Masjid)"
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#753799] to-[#100428] text-white rounded-md hover:from-[#632f86] hover:to-[#0d041f] transition"
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;