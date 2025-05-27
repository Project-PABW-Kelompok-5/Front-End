import React, { useState } from "react";
import DropdownAlamatKaltim from "./DropdownAlamatKaltim"; 

const AddressSelectModal = ({
  addressList,
  selectedAddressIndex,
  setSelectedAddressIndex,
  handleEditAddress,
  onClose,
  onAddNew,
  onConfirm,
}) => {
  const [isEditing, setIsEditing] = useState(false);
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
    setForm((prev) => ({ ...prev, provinsi:"Kalimantan Timur", kota, kecamatan, kodePos }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Kirim form ke addressList melalui prop callback atau simpan lokal
    console.log("Alamat baru disimpan:", form);
    setIsEditing(false);
    onAddNew(form); // pastikan prop ini menerima data baru
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="bg-white p-6 rounded-lg shadow-lg w-[560px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? "Tambah Alamat" : "Pilih Alamat"}
        </h3>

        {isEditing ? (
          <div className="space-y-3">
            <div className="flex gap-4 mb-4">
              <input
                name="name"
                placeholder="Nama Lengkap"
                required
                value={form.name}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="phone"
                placeholder="Nomor Telepon"
                required
                value={form.phone}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <DropdownAlamatKaltim onChange={handleAlamatChange} />
            <textarea
              name="addressDetail"
              placeholder="Nama Jalan, Gedung, No. Rumah"
              required
              value={form.addressDetail}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded"
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        ) : (
          <>
            {addressList.length === 0 ? (
              <p className="mb-4">Belum ada alamat.</p>
            ) : (
              <ul className="mb-4 max-h-52 overflow-y-auto">
                {addressList.map((addr, index) => (
                  <li
                    key={addr.id || index}
                    onClick={() => setSelectedAddressIndex(index)}
                    className={`p-3 border rounded mb-2 cursor-pointer hover:bg-blue-50 ${
                      selectedAddressIndex === index ? "border-blue-500" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">
                          {addr.name} - {addr.phone}
                        </p>
                        <p>{addr.addressDetail}</p>
                        <p className="text-sm text-gray-600">{addr.kecamatan}, {addr.kota}, {addr.provinsi}, {addr.kodePos}</p>
                      </div>
                      <button
                        className="text-green-600 hover:text-green-800 font-semibold text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(index);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsEditing(true)} // Tombol "Tambah Alamat Baru"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tambah Alamat Baru
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose} // Tombol "Batalkan"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Batalkan
                </button>
                <button
                  // 👇 PERBAIKAN DI SINI:
                  onClick={() => onConfirm(selectedAddressIndex)}
                  // Pastikan Anda memanggil onConfirm dengan selectedAddressIndex yang merupakan prop
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  // Tambahkan disabled jika tidak ada alamat yang dipilih
                  disabled={selectedAddressIndex === null && addressList.length > 0}
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddressSelectModal;
