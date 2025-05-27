import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";

import AddressSelectModal from "../components/AddressSelectModal";
import DropdownAlamatKaltim from "../components/DropdownAlamatKaltim";

const Checkout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

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
  const [submitted, setSubmitted] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);

  const [editIndex, setEditIndex] = useState(null);

  const fullAddress = `${form.kecamatan}, ${form.kota}, ${form.provinsi}, ${form.kodePos}`;

  const newForm = {
    ...form,
    address: fullAddress,
  };

  useEffect(() => {
    if (!userId) return;

    const fetchAddresses = async () => {
      const alamatCol = collection(firestore, `users/${userId}/alamat`);
      const alamatSnapshot = await getDocs(alamatCol);
      const alamatData = alamatSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAddressList(alamatData);
      if (alamatData.length > 0) setSelectedAddressIndex(0);
    };

    fetchAddresses();
  }, [userId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddAddress = () => {
    setForm({
      name: "",
      provinsi: "Kalimantan Timur",
      kota: "",
      kecamatan: "",
      kodePos: "",
      addressDetail: "",
      phone: "",
    });
    setEditIndex(null);
    setShowAddressModal(true);
    setShowSelectModal(addressList.length > 0);
  };

  const handleAddNewAddress = async (form) => {
    const newForm = {
      ...form,
      address: `${form.kecamatan}, ${form.kota}, ${form.provinsi}, ${form.kodePos}`,
    };

    const alamatCol = collection(firestore, `users/${userId}/alamat`);
    const docRef = await addDoc(alamatCol, newForm);

    const newAddress = { ...newForm, id: docRef.id };
    const updatedList = [...addressList, newAddress];

    setAddressList(updatedList);
    setSelectedAddressIndex(updatedList.length - 1);
    setShowAddressModal(false); // pastikan modal ditutup di sini
    setShowSelectModal(true); // jika mau munculkan pemilih alamat
  };

  const handleEditAddress = (index) => {
    const addr = addressList[index];
    setForm(addr);
    setEditIndex(index);
    setShowAddressModal(true);
    setShowSelectModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("User belum login");
      return;
    }

    if (editIndex !== null) {
      const addrToEdit = addressList[editIndex];
      const addressDocRef = doc(
        firestore,
        `users/${userId}/alamat`,
        addrToEdit.id
      );
      await setDoc(addressDocRef, newForm);

      const updated = [...addressList];
      updated[editIndex] = { ...form, id: addrToEdit.id };
      setAddressList(updated);
      setSelectedAddressIndex(editIndex);
    } else {
      const alamatCol = collection(firestore, `users/${userId}/alamat`);
      const docRef = await addDoc(alamatCol, newForm);
      const newAddress = { ...newForm, id: docRef.id };
      const newAddressList = [...addressList, newAddress];
      setAddressList(newAddressList);
      setSelectedAddressIndex(newAddressList.length - 1);

      if (addressList.length === 0) {
        setShowSelectModal(false);
      } else {
        setShowSelectModal(true);
      }
    }

    setForm({
      name: "",
      provinsi: "Kalimantan Timur",
      kota: "",
      kecamatan: "",
      kodePos: "",
      addressDetail: "",
      phone: "",
    });
    setEditIndex(null);
    setShowAddressModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const { state } = useLocation();
  // const navigate = useNavigate();
  const selectedItems = state?.items || [];

  // hitung subtotal & total
  const shippingCost = 8000; // bebas di‑set
  const subtotal = selectedItems.reduce(
    (acc, item) => acc + (item.harga || 0) * item.jumlah,
    0
  );
  const grandTotal = subtotal + shippingCost;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="w-300 mt-4 p-7 border border-gray-200 rounded-lg bg-white shadow">
        <h2 className="text-xl font-semibold mb-6">Alamat Pengiriman</h2>
        {submitted ? (
          <div>
            <h3 className="text-lg font-bold mb-2">
              Terima kasih atas pesanan Anda!
            </h3>
            <p>Pesanan Anda sedang diproses.</p>
          </div>
        ) : selectedAddressIndex === null ? (
          <div className="text-center">
            <p className="mb-5">Belum ada alamat pengiriman.</p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={handleAddAddress}
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
            <div className="flex items-center">
              <span
                onClick={() => setShowSelectModal(true)}
                className="text-blue-500 font-semibold text-sm cursor-pointer"
              >
                Ubah
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Panggil komponen modal pilih alamat */}
      {showSelectModal && (
        <AddressSelectModal
          addressList={addressList}
          selectedAddressIndex={selectedAddressIndex}
          setSelectedAddressIndex={setSelectedAddressIndex}
          handleEditAddress={handleEditAddress}
          onClose={() => setShowSelectModal(false)}
          onAddNew={handleAddNewAddress}
          onConfirm={() => setShowSelectModal(false)}
        />
      )}

      {/* Modal tambah/edit alamat */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-30"></div>
          <div className="bg-white p-6 rounded-lg shadow-lg w-[560px] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editIndex !== null ? "Edit Alamat" : "Tambah Alamat Baru"}
            </h3>
            <form className="space-y-3" onSubmit={handleModalSubmit}>
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  required
                  className="w-1/2 px-3 py-2 border rounded"
                />
                <input
                  type="tel"
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
                className="w-full mb-4 px-3 py-2 border rounded"
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="w-300 mt-4 p-7 border-1 border-gray-200 rounded-t-lg bg-white shadow flex flex-col">
        <div className="flex justify-between">
          <h1 className="text-xl font-semibold mb-6">Produk Dipesan</h1>
          <div className="flex text-right text-gray-500">
            <p className="w-50">Harga Satuan</p>
            <p className="w-50">Jumlah</p>
            <p className="w-50">Subtotal Produk</p>
          </div>
        </div>

        {selectedItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between mb-7">
            <div className="flex items-center">
              <img
                src={
                  item.image ||
                  `https://placehold.co/50?text=${item.nama_barang}`
                }
                alt={item.nama_barang}
                className="w-12 h-12 mr-4"
              />
              <div className="w-125">
                <h2 className="text-lg font-semibold">{item.nama_barang}</h2>
                <p className="text-gray-500">{item.deskripsi}</p>
              </div>
            </div>

            <div className="flex text-right">
              <p className="w-50">
                Rp{Number(item.harga).toLocaleString("id-ID")}
              </p>
              <p className="w-50">{item.jumlah}</p>
              <p className="w-50 font-semibold">
                Rp{(item.harga * item.jumlah).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-7 border-t border-dashed border-gray-300">
          <div className="flex items-center gap-8">
            <p className="font-semibold">Jasa Pengiriman:</p>
            <p className="font-semibold">Berkah Express</p>
          </div>
          <p className="font-semibold">
            Rp{shippingCost.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
      <div>
        <div className="w-300 py-4 border border-gray-200 rounded-b-lg bg-white shadow flex flex-col">
          <div className="flex items-center justify-end">
            <p className="text-gray-500">
              Total Pesanan (
              {selectedItems.reduce((total, item) => total + item.jumlah, 0)}{" "}
              produk):
            </p>
            <p className="min-w-35 text-xl font-semibold px-6 py-2">
              Rp{grandTotal.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="w-300 mt-4 p-7 border border-gray-200 rounded-b-lg bg-white shadow flex flex-col">
          <h1 className="text-xl font-semibold mb-6">Ringkasan Pembayaran</h1>

          <div className="flex justify-between mb-4">
            <p>Subtotal Pesanan</p>
            <p>Rp{subtotal.toLocaleString("id-ID")}</p>
          </div>

          <div className="flex justify-between mb-4">
            <p>Ongkos Kirim</p>
            <p>Rp{shippingCost.toLocaleString("id-ID")}</p>
          </div>

          <div className="flex justify-between mb-4">
            <p className="font-semibold">Total Pembayaran</p>
            <p className="font-semibold text-2xl">
              Rp{grandTotal.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Tombol Submit Checkout */}
      {!submitted && addressList.length > 0 && (
        <button
          onClick={handleSubmit}
          className="mt-6 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Checkout
        </button>
      )}
    </div>
  );
};

export default Checkout;
