import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { firestore } from "../firebase";
import Header from "../components/header";
import Footer from "../components/footer";
import AddressSelectModal from "../components/AddressSelectModal";
import DropdownAlamatKaltim from "../components/DropdownAlamatKaltim";

const Checkout = () => {
  /* ─────────────────────────────  USER  ───────────────────────────── */
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  /* ──────────────────────────  ALAMAT STATE  ───────────────────────── */
  const [form, setForm] = useState({
    name: user?.displayName || "",
    phone: "",
    addressDetail: "",
    provinsi: "Kalimantan Timur",
    kota: "",
    kecamatan: "",
    kodePos: "",
  });

  const handleAlamatChange = ({ kota, kecamatan, kodePos }) => {
    setForm((prev) => ({
      ...prev,
      provinsi: "Kalimantan Timur",
      kota,
      kecamatan,
      kodePos,
    }));
  };

  const [addressList, setAddressList] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  /* ────────────────────  MUAT ALAMAT DARI FIRESTORE (REVISED) ───────────────── */
  useEffect(() => {
    if (!userId) {
      setAddressList([]);
      setSelectedAddressIndex(null); // Kosongkan jika tidak ada user
      return;
    }

    let isMounted = true; // Flag untuk mencegah update state jika komponen unmount
    const fetchAddresses = async () => {
      const alamatCol = collection(firestore, `users/${userId}/alamat`);
      try {
        const snap = await getDocs(alamatCol);
        if (isMounted) {
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setAddressList(data);
          // Logika pemilihan otomatis akan ditangani oleh useEffect di bawah
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        if (isMounted) {
          setAddressList([]); // Kosongkan list jika ada error
        }
      }
    };

    fetchAddresses();

    return () => {
      isMounted = false; // Set flag ke false saat komponen unmount
    };
  }, [userId]); // Hanya bergantung pada userId

  /* ───────────────── SINKRONISASI SELECTEDADDRESSINDEX DENGAN ADDRESSLIST ───────────────── */
  useEffect(() => {
    console.log("SYNC EFFECT: Mulai. selectedAddressIndex awal:", selectedAddressIndex, "Panjang addressList:", addressList.length);
    let newSelectedAddressIndex = selectedAddressIndex;
    let selectionChanged = false;

    if (addressList.length > 0) {
      // Jika ada alamat di list
      if (selectedAddressIndex === null || selectedAddressIndex >= addressList.length) {
        // Jika tidak ada yang dipilih, atau pilihan keluar dari batas (misal setelah delete)
        newSelectedAddressIndex = 0; // Pilih alamat pertama
        if (selectedAddressIndex !== newSelectedAddressIndex) {
          selectionChanged = true;
        }
      }
      // Jika selectedAddressIndex sudah valid (0 s/d addressList.length - 1), biarkan saja.
    } else {
      // Jika addressList kosong
      if (selectedAddressIndex !== null) {
        newSelectedAddressIndex = null; // Kosongkan pilihan
        selectionChanged = true;
      }
    }

    if (selectionChanged) {
      setSelectedAddressIndex(newSelectedAddressIndex);
    }
  }, [addressList, selectedAddressIndex, setSelectedAddressIndex]); // Dependensi


  /* ─────────────────────────  DATA PRODUK  ─────────────────────────── */
  const { state } = useLocation();
  const navigate = useNavigate();
  const selectedItems = state?.items || [];

  const shippingCost = 8000;
  const subtotal = selectedItems.reduce(
    (acc, item) => acc + (item.harga || 0) * item.jumlah,
    0
  );
  const grandTotal = subtotal + shippingCost;
  const totalQty = selectedItems.reduce((acc, it) => acc + it.jumlah, 0);

  /* ─────────────────────────  ALAMAT MODAL HANDLERS  ───────────────── */
  const handleFormInputChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleOpenAddNewAddressModal = () => {
    setForm({
      name: user?.displayName || "",
      phone: "",
      addressDetail: "",
      provinsi: "Kalimantan Timur",
      kota: "",
      kecamatan: "",
      kodePos: "",
    });
    setEditIndex(null);
    setShowAddressModal(true);
    setShowSelectModal(false);
  };
  
  const handleOpenEditAddressInModal = (indexToEdit) => {
    const addressToEdit = addressList[indexToEdit];
    setForm({
        name: addressToEdit.name,
        phone: addressToEdit.phone,
        addressDetail: addressToEdit.addressDetail,
        provinsi: addressToEdit.provinsi || "Kalimantan Timur",
        kota: addressToEdit.kota,
        kecamatan: addressToEdit.kecamatan,
        kodePos: addressToEdit.kodePos,
    });
    setEditIndex(indexToEdit);
    setShowAddressModal(true);
    setShowSelectModal(false);
  };

  // REVISED saveNewAddressToFirestore
  const saveNewAddressToFirestore = async (addrData) => {
    const alamatCol = collection(firestore, `users/${userId}/alamat`);
    const docRef = await addDoc(alamatCol, addrData);
    const newAddress = { ...addrData, id: docRef.id };
    
    setAddressList((prevList) => {
      const newList = [...prevList, newAddress];
      // Langsung pilih alamat yang baru ditambahkan
      setSelectedAddressIndex(newList.length - 1); 
      return newList;
    });
    return newAddress;
  };

  // REVISED updateExistingAddressInFirestore
  const updateExistingAddressInFirestore = async (addrData, addressId, indexInList) => {
    const ref = doc(firestore, `users/${userId}/alamat/${addressId}`);
    await setDoc(ref, addrData, { merge: true });
    const updatedAddress = { ...addrData, id: addressId };

    setAddressList((prevList) =>
      prevList.map((a, i) => (i === indexInList ? updatedAddress : a))
    );
    // Pastikan alamat yang diedit tetap terpilih
    setSelectedAddressIndex(indexInList); 
    return updatedAddress;
  };

  const handleSubmitAddressForm = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      address: `${form.addressDetail}, ${form.kecamatan}, ${form.kota}, ${form.provinsi}, ${form.kodePos}`,
    };

    try {
      if (editIndex !== null) {
        const addressToUpdate = addressList[editIndex];
        await updateExistingAddressInFirestore(payload, addressToUpdate.id, editIndex);
        alert("Alamat berhasil diperbarui.");
      } else {
        await saveNewAddressToFirestore(payload);
        alert("Alamat baru berhasil disimpan.");
      }
      setShowAddressModal(false);
      setEditIndex(null);
    } catch (error) {
        console.error("Gagal menyimpan alamat:", error);
        alert("Terjadi kesalahan saat menyimpan alamat.");
    }
  };

  /* ─────────────────────────  SUBMIT CHECKOUT  ─────────────────────── */
  const [submitted, setSubmitted] = useState(false);

  const handleCheckout = async () => {
    if (!userId) return alert("Silakan login.");
    if (selectedItems.length === 0)
      return alert("Tidak ada produk yang dipesan.");
    if (selectedAddressIndex === null || !addressList[selectedAddressIndex])
      return alert("Pilih atau tambah alamat pengiriman dulu.");
    
    const userSnap = await getDoc(doc(firestore, `users/${userId}`));
    const userData = userSnap.data();
    if (!userData || userData.saldo < grandTotal) {
      alert("Saldo tidak mencukupi untuk melakukan pembayaran.");
      return;
    }

    try {
      const alamat = addressList[selectedAddressIndex];
      const orderData = {
        userId,
        items: selectedItems.map((it) => ({
          productId: it.id,
          nama: it.nama_barang,
          harga: it.harga,
          qty: it.jumlah,
          subtotal: it.harga * it.jumlah,
        })),
        alamat: {
          namaPenerima: alamat.name,
          teleponPenerima: alamat.phone,
          detailAlamat: alamat.addressDetail,
          alamatLengkap: alamat.address,
          kota: alamat.kota,
          kecamatan: alamat.kecamatan,
          provinsi: alamat.provinsi,
          kodePos: alamat.kodePos,
        },
        subtotal,
        shippingCost,
        totalBayar: grandTotal,
        status_pengiriman: "menunggu penjual",
        createdAt: serverTimestamp(),
      };

      const historyCol = collection(firestore, `history/${userId}/orders`);
      await addDoc(historyCol, orderData);

      const batch = writeBatch(firestore);
      selectedItems.forEach((item) => {
        const cartRef = doc(firestore, `carts/${userId}/items/${item.id}`);
        batch.delete(cartRef);
        const barangRef = doc(firestore, `barang/${item.id}`);
        batch.update(barangRef, {
          stok: increment(-item.jumlah),
        });
      });
      const userRef = doc(firestore, `users/${userId}`);
      batch.update(userRef, {
        saldo: increment(-grandTotal),
      });
      await batch.commit();

      setSubmitted(true);
      alert("Checkout berhasil! Pesanan menunggu penjual.");
    } catch (err) {
      console.error("Checkout gagal:", err);
      alert("Terjadi kesalahan saat checkout.");
    }
  };

  /* ──────────────────────────────  UI  ─────────────────────────────── */
  if (submitted)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Terima kasih!</h1>
        <p>Pesanan Anda sedang diproses</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-purple-700 text-white rounded"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
    
  // TAMBAHKAN LOGS DI SINI SEBELUM RETURN ATAU DEFINISI currentSelectedAddress
  console.log("CHECKOUT RENDER: selectedAddressIndex state:", selectedAddressIndex);
  console.log("CHECKOUT RENDER: addressList state:", addressList);
  const currentSelectedAddress = addressList[selectedAddressIndex]; // Pastikan ini didefinisikan setelah addressList dan selectedAddressIndex di-log
  console.log("CHECKOUT RENDER: currentSelectedAddress (hasil dari addressList[selectedAddressIndex]):", currentSelectedAddress);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      <Header />
      <div className="flex flex-col items-center">

        {/* ─── Alamat Pengiriman  ───  */}
        <div className="w-full max-w-3xl mt-7 p-7 border border-gray-200 rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-6">Alamat Pengiriman</h2>

          {/* Kondisi ini seharusnya sekarang bekerja dengan benar */}
          {selectedAddressIndex === null || !currentSelectedAddress ? (
            <div className="text-center">
              <p className="mb-5">Belum ada alamat pengiriman atau alamat belum dipilih.</p>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded mr-2"
                onClick={handleOpenAddNewAddressModal}
              >
                Tambah Alamat Baru
              </button>
              {addressList.length > 0 && (
                 <button
                    onClick={() => setShowSelectModal(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded"
                  >
                    Pilih dari Alamat Tersimpan
                  </button>
              )}
            </div>
          ) : (
            <div className="flex mb-4 justify-between items-start">
              <div className="w-2/5">
                <p className="font-bold">{currentSelectedAddress?.name}</p>
                <p>{currentSelectedAddress?.phone}</p>
              </div>
              <div className="w-3/5 pr-4">
                <p>{currentSelectedAddress?.addressDetail}</p>
                <p>{`${currentSelectedAddress?.kecamatan}, ${currentSelectedAddress?.kota}, ${currentSelectedAddress?.provinsi}, ${currentSelectedAddress?.kodePos}`}</p>
              </div>
              <button
                onClick={() => setShowSelectModal(true)}
                className="self-start text-blue-500 text-sm cursor-pointer whitespace-nowrap"
              >
                Ubah Alamat
              </button>
            </div>
          )}
        </div>

        {/* ─── Produk Dipesan  ───  */}
        <div className="w-full max-w-3xl mt-4 p-7 border-1 border-gray-200 rounded-t-lg bg-white shadow flex flex-col">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold mb-6">Produk Dipesan</h1>
            <div className="hidden md:flex text-right text-gray-500">
              <p className="w-32 md:w-40 lg:w-50">Harga Satuan</p>
              <p className="w-20 md:w-24 lg:w-50">Jumlah</p>
              <p className="w-32 md:w-40 lg:w-50">Subtotal</p>
            </div>
          </div>

          {selectedItems.map((it) => (
            <div key={it.id} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7">
              <div className="flex items-center w-full md:w-auto mb-2 md:mb-0">
                <img
                  src={it.image || `https://placehold.co/50?text=${it.nama_barang}`}
                  alt={it.nama_barang}
                  className="w-12 h-12 mr-4 rounded"
                />
                <div className="flex-grow md:w-64 lg:w-125">
                  <h2 className="text-md lg:text-lg font-semibold">{it.nama_barang}</h2>
                  {it.deskripsi && <p className="text-sm text-gray-500">{it.deskripsi.substring(0,50)}...</p>}
                </div>
              </div>

              <div className="flex w-full md:w-auto text-right md:text-left justify-around md:justify-end items-center">
                <p className="w-1/3 md:w-32 lg:w-50"><span className="md:hidden">Harga: </span>Rp{Number(it.harga).toLocaleString("id-ID")}</p>
                <p className="w-1/3 md:w-20 lg:w-50"><span className="md:hidden">Jml: </span>{it.jumlah}</p>
                <p className="w-1/3 md:w-32 lg:w-50 font-semibold"><span className="md:hidden">Sub: </span>Rp{(it.harga * it.jumlah).toLocaleString("id-ID")}</p>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-7 border-t border-dashed border-gray-300">
            <div className="flex items-center gap-4 font-semibold">
              <span>Jasa Pengiriman:</span>
              <span>Berkah Express</span>
            </div>
            <span className="font-semibold">
              Rp{shippingCost.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Total Pesanan ringkas  */}
        <div className="w-full max-w-3xl py-4 border border-gray-200 rounded-b-lg bg-white shadow flex flex-col">
          <div className="flex items-center justify-end px-6 md:px-7">
            <p className="text-gray-500">
              Total Pesanan ({totalQty} produk):
            </p>
            <p className="min-w-35 text-xl font-semibold pl-4 md:px-6 py-2">
              Rp{grandTotal.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Ringkasan Pembayaran  */}
        <div className="w-full max-w-3xl mt-4 p-7 mb-8 border border-gray-200 rounded-lg bg-white shadow flex flex-col">
          <div className="flex justify-end mb-4 items-center">
            <p className="w-auto md:w-35 text-left">Subtotal Pesanan</p>
            <p className="w-auto md:w-45 text-right ml-auto">Rp{subtotal.toLocaleString("id-ID")}</p>
          </div>
          <div className="flex justify-end mb-4 items-center">
            <p className="w-auto md:w-35 text-left">Ongkos Kirim</p>
            <p className="w-auto md:w-45 text-right ml-auto">Rp{shippingCost.toLocaleString("id-ID")}</p>
          </div>
          <div className="flex justify-end mb-4 items-center">
            <p className="font-semibold w-auto md:w-35 text-left">Total Pembayaran</p>
            <p className="font-semibold text-2xl w-auto md:w-45 text-right ml-auto">
              Rp{grandTotal.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="flex justify-end mt-4 md:pr-8">
            <button
              onClick={() => {
                const confirmed = window.confirm("Apakah Anda yakin ingin membuat pesanan?\n\nIni akan mengurangi saldo Anda sesuai total pembayaran.");
                if (confirmed) {
                  handleCheckout();
                }
              }}
              className="w-full md:w-55 mt-6 py-2 bg-purple-600 text-white text-lg font-semibold rounded hover:bg-purple-700"
            >
              Buat Pesanan
            </button>
          </div>
        </div>

        {/* Modal Pilih Alamat  */}
        {showSelectModal && (
          <AddressSelectModal
            addressList={addressList}
            selectedAddressIndex={selectedAddressIndex}
            setSelectedAddressIndex={setSelectedAddressIndex} // <--- KEMBALIKAN BARIS INI
            handleEditAddress={handleOpenEditAddressInModal}
            onClose={() => setShowSelectModal(false)}
            onAddNew={() => {
                setShowSelectModal(false);
                handleOpenAddNewAddressModal();
            }}
            onConfirm={(selectedIndex) => {
                // Memanggil setSelectedAddressIndex di sini memastikan
                // indeks yang dikonfirmasi dari modal benar-benar diterapkan.
                // Ini mungkin redundan jika klik item di modal sudah memanggilnya,
                // tapi aman untuk dipertahankan.
                console.log("MODAL ONCONFIRM: Index dari modal:", selectedIndex); //
                console.log("MODAL ONCONFIRM: addressList saat ini:", addressList); //
                setSelectedAddressIndex(selectedIndex);
                setShowSelectModal(false);
            }}
          />
        )}

        {/* Modal Tambah / Edit Alamat  */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-30" />
            <div className="bg-white p-6 w-[560px] rounded-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddressModal(false)}
                className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
              <h3 className="text-lg font-semibold mb-4">
                {editIndex !== null ? "Edit Alamat" : "Tambah Alamat Baru"}
              </h3>

              <form onSubmit={handleSubmitAddressForm} className="space-y-3">
                <div className="flex gap-4">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormInputChange}
                    placeholder="Nama Lengkap Penerima"
                    required
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleFormInputChange}
                    placeholder="No. Telepon Penerima"
                    required
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <DropdownAlamatKaltim 
                    onChange={handleAlamatChange} 
                    initialData={editIndex !== null ? {
                        kota: form.kota,
                        kecamatan: form.kecamatan,
                        kodePos: form.kodePos,
                    } : undefined}
                />

                <textarea
                  name="addressDetail"
                  value={form.addressDetail}
                  onChange={handleFormInputChange}
                  placeholder="Nama Jalan, Gedung, No. Rumah, Detail Patokan (Contoh: RT 01/RW 02)"
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
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Simpan Alamat
                    </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;