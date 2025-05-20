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
increment
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
    name: "",
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

  /* ────────────────────  MUAT ALAMAT DARI FIRESTORE  ───────────────── */
  useEffect(() => {
    if (!userId) return;

    const fetchAddresses = async () => {
      const alamatCol = collection(firestore, `users/${userId}/alamat`);
      const snap = await getDocs(alamatCol);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAddressList(data);
      if (data.length > 0) setSelectedAddressIndex(0);
    };
    fetchAddresses();
  }, [userId]);

  /* ─────────────────────────  DATA PRODUK  ─────────────────────────── */
  const { state } = useLocation();        // datang dari Cart
  const navigate = useNavigate();
  const selectedItems = state?.items || [];

  /*  hitung subtotal & total  */
  const shippingCost = 8000;
  const subtotal = selectedItems.reduce(
    (acc, item) => acc + (item.harga || 0) * item.jumlah,
    0
  );
  const grandTotal = subtotal + shippingCost;
  const totalQty = selectedItems.reduce((acc, it) => acc + it.jumlah, 0);

  /* ─────────────────────────  ALAMAT MODAL  ────────────────────────── */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddNewAddress = () => {
    setForm({
      name: "",
      phone: "",
      addressDetail: "",
      provinsi: "Kalimantan Timur",
      kota: "",
      kecamatan: "",
      kodePos: "",
    });
    setEditIndex(null);
    setShowAddressModal(true);
    setShowSelectModal(addressList.length > 0);
  };

  const saveAddressToFirestore = async (addr) => {
    const alamatCol = collection(firestore, `users/${userId}/alamat`);
    const docRef = await addDoc(alamatCol, addr);
    setAddressList((prev) => [...prev, { ...addr, id: docRef.id }]);
    setSelectedAddressIndex(addressList.length);
  };

  /* ─────────────────────────  SUBMIT CHECKOUT  ─────────────────────── */
  const [submitted, setSubmitted] = useState(false);

  const handleCheckout = async () => {
    if (!userId) return alert("Silakan login.");
    if (selectedItems.length === 0)
      return alert("Tidak ada produk yang dipesan.");
    if (selectedAddressIndex === null)
      return alert("Pilih / tambah alamat dulu.");
    // Ambil data saldo user
    const userSnap = await getDoc(doc(firestore, `users/${userId}`));
    const userData = userSnap.data();
    if (!userData || userData.saldo < grandTotal) {
      alert("Saldo tidak mencukupi untuk melakukan pembayaran.");
      return;
    }


    try {
      /* 1. Persiapkan data order */
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
          nama: alamat.name,
          phone: alamat.phone,
          detail: alamat.addressDetail,
          fullAddress: alamat.address,
        },
        subtotal,
        shippingCost,
        totalBayar: grandTotal,
        status_pengiriman: "menunggu penjual",
        createdAt: serverTimestamp(),
      };

      /* 2. Simpan ke history/{userId}/orders */
      const historyCol = collection(firestore, `history/${userId}/orders`);
      await addDoc(historyCol, orderData);

      /* 3. Hapus item ter‑checkout dari carts/{userId}/items */
      const batch = writeBatch(firestore);
      selectedItems.forEach((item) => {
        // a. Hapus item dari keranjang
        const cartRef = doc(firestore, `carts/${userId}/items/${item.id}`);
        batch.delete(cartRef);

        // b. Kurangi stok barang
        const barangRef = doc(firestore, `barang/${item.id}`);
        batch.update(barangRef, {
          stok: increment(-item.jumlah),
        });
      });

      // c. Kurangi saldo user
      const userRef = doc(firestore, `users/${userId}`);
      batch.update(userRef, {
        saldo: increment(-grandTotal),
      });

      await batch.commit();

      /* 4. Tandai submit & beri notifikasi */
      setSubmitted(true);
      alert("Checkout berhasil! Pesanan menunggu penjual.");

      // opsional: navigate("/history");
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      <Header />
      <div className="flex flex-col items-center">

        {/*  ─── Alamat Pengiriman  ───  */}
        <div className="w-300 mt-7 p-7 border border-gray-200 rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-6">Alamat Pengiriman</h2>

          {selectedAddressIndex === null ? (
            <div className="text-center">
              <p className="mb-5">Belum ada alamat pengiriman.</p>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded"
                onClick={handleAddNewAddress}
              >
                Tambah Alamat
              </button>
            </div>
          ) : (
            <div className="flex mb-4 justify-between">
              <div className="w-55 font-bold">
                <p>{addressList[selectedAddressIndex]?.name}</p>
                <p>{addressList[selectedAddressIndex]?.phone}</p>
              </div>
              <div className="w-195">
                <p>{addressList[selectedAddressIndex]?.addressDetail}</p>
                <p>{addressList[selectedAddressIndex]?.address}</p>
              </div>
              <span
                onClick={() => setShowSelectModal(true)}
                className="self-start text-blue-500 text-sm cursor-pointer"
              >
                Ubah
              </span>
            </div>
          )}
        </div>

        {/*  ─── Produk Dipesan  ───  */}
        <div className="w-300 mt-4 p-7 border-1 border-gray-200 rounded-t-lg bg-white shadow flex flex-col">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold mb-6">Produk Dipesan</h1>
            <div className="flex text-right text-gray-500">
              <p className="w-50">Harga Satuan</p>
              <p className="w-50">Jumlah</p>
              <p className="w-50">Subtotal</p>
            </div>
          </div>

          {selectedItems.map((it) => (
            <div key={it.id} className="flex justify-between items-center mb-7">
              <div className="flex items-center">
                <img
                  src={
                    it.image || `https://placehold.co/50?text=${it.nama_barang}`
                  }
                  className="w-12 h-12 mr-4"
                />
                <div className="w-125">
                  <h2 className="text-lg font-semibold">{it.nama_barang}</h2>
                  <p className="text-gray-500">{it.deskripsi}</p>
                </div>
              </div>

              <div className="flex text-right">
                <p className="w-50">
                  Rp{Number(it.harga).toLocaleString("id-ID")}
                </p>
                <p className="w-50">{it.jumlah}</p>
                <p className="w-50 font-semibold">
                  Rp{(it.harga * it.jumlah).toLocaleString("id-ID")}
                </p>
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

        {/*  Total Pesanan ringkas  */}
        <div className="w-300 py-4 border border-gray-200 rounded-b-lg bg-white shadow flex flex-col">
          <div className="flex items-center justify-end">
            <p className="text-gray-500">
              Total Pesanan ({totalQty} produk):
            </p>
            <p className="min-w-35 text-xl font-semibold px-6 py-2">
              Rp{grandTotal.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/*  Ringkasan Pembayaran  */}
        <div className="w-300 mt-4 p-7 mb-8 border border-gray-200 rounded-lg bg-white shadow flex flex-col">
          {/* <h1 className="text-xl font-semibold mb-6">Pembayaran</h1> */}

          <div className="flex justify-end mb-4 items-center">
            <p className="w-35 text-left">Subtotal Pesanan</p>
            <p className="w-45 text-right">Rp{subtotal.toLocaleString("id-ID")}</p>
          </div>
          <div className="flex justify-end mb-4 items-center">
            <p className="w-35 text-left">Ongkos Kirim</p>
            <p className="w-45 text-right">Rp{shippingCost.toLocaleString("id-ID")}</p>
          </div>
          <div className="flex justify-end mb-4 items-center">
            <p className="font-semibold w-35 text-left">Total Pembayaran</p>
            <p className="font-semibold text-2xl w-45 text-right">
              Rp{grandTotal.toLocaleString("id-ID")}
            </p>
          </div>
          {/*  Tombol Checkout  */}
          <div className="flex justify-end pr-8">
            <button
              onClick={() => {
                const confirmed = window.confirm("Apakah Anda yakin ingin membuat pesanan?\n\nIni akan mengurangi saldo Anda sesuai total pembayaran.");
                if (confirmed) {
                  handleCheckout();
                }
              }}
              className="w-55 mt-6 py-2 bg-purple-600 text-white text-lg font-semibold rounded hover:bg-purple-700"
            >
              Buat Pesanan
            </button>
          </div>

        </div>

        {/*  Modal Pilih Alamat  */}
        {showSelectModal && (
          <AddressSelectModal
            addressList={addressList}
            selectedAddressIndex={selectedAddressIndex}
            setSelectedAddressIndex={setSelectedAddressIndex}
            handleEditAddress={(idx) => {
              setEditIndex(idx);
              setShowAddressModal(true);
            }}
            onClose={() => setShowSelectModal(false)}
            onAddNew={saveAddressToFirestore}
            onConfirm={() => setShowSelectModal(false)}
          />
        )}

        {/*  Modal Tambah / Edit Alamat  */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-30"></div>
            <div className="bg-white p-6 w-[560px] rounded-lg shadow relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAddressModal(false)}
                className="absolute top-2 right-2 text-xl text-gray-500"
              >
                ×
              </button>
              <h3 className="text-lg font-semibold mb-4">
                {editIndex !== null ? "Edit Alamat" : "Tambah Alamat Baru"}
              </h3>

              {/* Form Alamat */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const payload = {
                    ...form,
                    address: `${form.kecamatan}, ${form.kota}, ${form.provinsi}, ${form.kodePos}`,
                  };

                  if (editIndex !== null) {
                    const ref = doc(
                      firestore,
                      `users/${userId}/alamat/${addressList[editIndex].id}`
                    );
                    await setDoc(ref, payload);
                    setAddressList((prev) =>
                      prev.map((a, i) => (i === editIndex ? { ...payload, id: a.id } : a))
                    );
                    setSelectedAddressIndex(editIndex);
                  } else {
                    await saveAddressToFirestore(payload);
                  }

                  setShowAddressModal(false);
                }}
                className="space-y-3"
              >
                <div className="flex gap-4">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nama Lengkap"
                    required
                    className="w-1/2 px-3 py-2 border rounded"
                  />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="No. Telepon"
                    required
                    className="w-1/2 px-3 py-2 border rounded"
                  />
                </div>

                <DropdownAlamatKaltim onChange={handleAlamatChange} />

                <textarea
                  name="addressDetail"
                  value={form.addressDetail}
                  onChange={handleChange}
                  placeholder="Nama Jalan, Gedung, No. Rumah"
                  required
                  className="w-full px-3 py-2 border rounded"
                />

                <button className="w-full py-2 bg-blue-600 text-white rounded">
                  Simpan
                </button>
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
