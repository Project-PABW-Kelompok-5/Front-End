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
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "../firebase"; // Pastikan path ini benar
import DropdownAlamatKaltim from "../components/DropdownAlamatKaltim"; // Pastikan path ini benar

// Data dummy untuk profil pengguna (bisa diganti dengan data dari Firestore jika diperlukan)
const initialUserData = {
  name: "Pengguna Baru",
  email: "pengguna@example.com",
  phone: "+62 800 0000 0000",
  username: "pengguna_baru",
  profilePicture: "https://via.placeholder.com/150",
  isEmailVerified: false,
  isPhoneVerified: false,
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // USER DATA (ambil dari localStorage atau Firestore)
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const userId = loggedInUser?.id;
  const [userData, setUserData] = useState(initialUserData); // Akan di-override jika ada data Firestore

  // State untuk form edit profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState(userData);

  // State untuk form ubah kata sandi
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* ────────────────────────── ALAMAT STATE & LOGIC ───────────────────────── */
  const [addressList, setAddressList] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null untuk add, id untuk edit
  const [currentAddressForm, setCurrentAddressForm] = useState({
    name: "",
    phone: "",
    addressDetail: "",
    provinsi: "Kalimantan Timur",
    kota: "",
    kecamatan: "",
    kodePos: "",
  });

  // Muat data user & alamat dari Firestore
  useEffect(() => {
    if (!userId) {
      // alert("Anda belum login. Mengarahkan ke halaman login...");
      // navigate("/login"); // Contoh redirect jika belum login
      return;
    }

    const fetchUserData = async () => {
      const userDocRef = doc(firestore, "users", userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const fetchedData = userSnap.data();
        setUserData({ // Gabungkan dengan initialUserData sebagai fallback
          name: fetchedData.nama || initialUserData.name,
          email: fetchedData.email || initialUserData.email, // Email biasanya dari auth
          phone: fetchedData.telepon || initialUserData.phone,
          username: fetchedData.username || loggedInUser?.displayName || initialUserData.username,
          profilePicture: fetchedData.profilePicture || initialUserData.profilePicture,
          isEmailVerified: loggedInUser?.emailVerified || initialUserData.isEmailVerified,
          isPhoneVerified: !!fetchedData.telepon, // Anggap terverifikasi jika ada nomor telepon
        });
        setProfileFormData({
          name: fetchedData.nama || initialUserData.name,
          email: fetchedData.email || initialUserData.email,
          phone: fetchedData.telepon || initialUserData.phone,
          username: fetchedData.username || loggedInUser?.displayName || initialUserData.username,
        });
      } else {
        console.log("No such user document!");
        // Mungkin perlu membuat dokumen user jika belum ada
      }
    };

    const fetchAddresses = async () => {
      const alamatCol = collection(firestore, `users/${userId}/alamat`);
      const snap = await getDocs(alamatCol);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAddressList(data);
    };

    fetchUserData();
    fetchAddresses();
  }, [userId, navigate, loggedInUser]);

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
      name: userData.name || "", // Pre-fill nama dari profil
      phone: userData.phone || "", // Pre-fill telepon dari profil
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
    // Jika DropdownAlamatKaltim perlu di-reset atau di-set nilainya secara eksplisit saat edit,
    // Anda mungkin perlu state tambahan atau cara untuk memberitahu DropdownAlamatKaltim
    // nilai awal dari `kota`, `kecamatan`, `kodePos` yang diedit.
    // Untuk kesederhanaan, saat ini kita mengandalkan DropdownAlamatKaltim untuk memilih ulang.
    // Atau, modifikasi DropdownAlamatKaltim untuk menerima initialValue.
    setEditingAddressId(address.id);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!userId) return alert("User tidak ditemukan.");

    const payload = {
      ...currentAddressForm,
      address: `${currentAddressForm.addressDetail}, ${currentAddressForm.kecamatan}, ${currentAddressForm.kota}, ${currentAddressForm.provinsi}, ${currentAddressForm.kodePos}`,
      // createdAt: serverTimestamp(), // Opsional
      // updatedAt: serverTimestamp(), // Opsional
    };

    try {
      if (editingAddressId) {
        // Update
        const addressDocRef = doc(
          firestore,
          `users/${userId}/alamat/${editingAddressId}`
        );
        await setDoc(addressDocRef, payload, { merge: true }); // merge: true agar tidak menghapus field lain jika ada
        setAddressList((prevList) =>
          prevList.map((addr) =>
            addr.id === editingAddressId ? { ...payload, id: editingAddressId } : addr
          )
        );
        alert("Alamat berhasil diperbarui.");
      } else {
        // Add new
        const alamatCol = collection(firestore, `users/${userId}/alamat`);
        const docRef = await addDoc(alamatCol, payload);
        setAddressList((prevList) => [
          ...prevList,
          { ...payload, id: docRef.id },
        ]);
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
        const addressDocRef = doc(
          firestore,
          `users/${userId}/alamat/${addressIdToDelete}`
        );
        await deleteDoc(addressDocRef);
        setAddressList((prevList) =>
          prevList.filter((addr) => addr.id !== addressIdToDelete)
        );
        alert("Alamat berhasil dihapus.");
      } catch (error) {
        console.error("Error deleting address: ", error);
        alert("Gagal menghapus alamat: " + error.message);
      }
    }
  };

  /* ────────────────────────── OTHER FUNCTIONS ────────────────────────── */

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async () => {
    if (!userId) return alert("User tidak ditemukan.");
    try {
      const userDocRef = doc(firestore, "users", userId);
      // Hanya update field yang relevan, jangan timpa semua
      await setDoc(userDocRef, {
        nama: profileFormData.name,
        telepon: profileFormData.phone,
        username: profileFormData.username,
        // email biasanya tidak diubah di sini, tapi melalui proses verifikasi email terpisah
      }, { merge: true });

      setUserData(prev => ({...prev, ...profileFormData})); // Update local state
      setIsEditingProfile(false);
      alert("Profil berhasil diperbarui.");
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert("Gagal memperbarui profil: " + error.message);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handlePasswordSubmit = () => {
    // Implementasi logika ubah password dengan Firebase Auth
    console.log("Password change submitted:", passwordData);
    alert("Fitur ubah kata sandi belum diimplementasikan.");
    setIsChangingPassword(false);
  };

  const historyPengiriman = () => navigate("/history"); // Sesuaikan path jika beda
  const manageBarang = () => navigate("/managebarang");
  const homepage = () => navigate("/");
  const handleLogout = () => {
    localStorage.removeItem("user");
    // Firebase signOut() jika menggunakan Firebase Auth
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
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5a2d7a")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#753799")}
                    // onClick={() => alert("Fitur ganti foto profil belum ada")}
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
                {/* Nav items */}
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`group w-full flex items-center px-4 py-3 rounded-md text-left ${
                    activeTab === "profile"
                      ? "text-white"
                      : "hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                  }`}
                  style={{
                    backgroundColor: activeTab === "profile" ? "#753799" : "transparent",
                    color: activeTab === "profile" ? "#ffffff" : "#100428",
                    transition: "all 0.3s ease",
                  }}
                >
                  <User className={`w-5 h-5 mr-3 ${activeTab === "profile" ? "text-white" : "text-[#753799] group-hover:text-white"}`} />
                  <span>Profil Saya</span>
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`group w-full flex items-center px-4 py-3 rounded-md text-left ${
                    activeTab === "addresses"
                      ? "text-white"
                      : "hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                  }`}
                  style={{
                    backgroundColor: activeTab === "addresses" ? "#753799" : "transparent",
                    color: activeTab === "addresses" ? "#ffffff" : "#100428",
                    transition: "all 0.3s ease",
                  }}
                >
                  <MapPin className={`w-5 h-5 mr-3 ${activeTab === "addresses" ? "text-white" : "text-[#753799] group-hover:text-white"}`} />
                  <span>Alamat Saya</span>
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`group w-full flex items-center px-4 py-3 rounded-md text-left ${
                    activeTab === "security"
                      ? "text-white"
                      : "hover:text-white hover:bg-gradient-to-r from-[#753799] to-[#602bca]"
                  }`}
                  style={{
                    backgroundColor: activeTab === "security" ? "#753799" : "transparent",
                    color: activeTab === "security" ? "#ffffff" : "#100428",
                    transition: "all 0.3s ease",
                  }}
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
                      <button onClick={() => setIsEditingProfile(true)} className="flex items-center text-white hover:text-[#d6b3ff]">
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {!isEditingProfile ? (
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
                            {userData.isPhoneVerified ? (
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
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="px-4 py-2 border border-[#753799] rounded-md text-[#753799] hover:bg-[#100428] hover:text-white transition">Batal</button>
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
                      <form onSubmit={(e) => {e.preventDefault(); handlePasswordSubmit();}} className="space-y-4">
                        {/* Password fields */}
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-[#100428] mb-1">Kata Sandi Saat Ini</label>
                          <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799]" required />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-[#100428] mb-1">Kata Sandi Baru</label>
                          <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799]" required />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#100428] mb-1">Konfirmasi Kata Sandi Baru</label>
                          <input type="password" id="confirmPassword" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 border border-[#753799] rounded-md focus:outline-none focus:ring-2 focus:ring-[#753799]" required />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <button type="button" onClick={() => setIsChangingPassword(false)} className="px-4 py-2 border border-[#753799] rounded-md text-[#753799] hover:bg-[#100428] hover:text-white transition">Batal</button>
                          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#753799] to-[#100428] text-white rounded-md hover:from-[#632f86] hover:to-[#0d041f] transition">Perbarui Kata Sandi</button>
                        </div>
                      </form>
                    )}
                  </div>
                  {/* Verification sections */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit Alamat */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
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
                initialData={editingAddressId ? { // Kirim data awal jika sedang edit
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