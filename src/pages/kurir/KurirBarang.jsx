import KurirSidebar from "../../components/KurirSidebar.jsx";

const KurirBarang = () => {
  // Dummy data barang yang bisa dilihat kurir
  const barangKurir = [
    {
      id: 1,
      nama: "Teh Botol",
      status: "menunggu kurir",
      penjual: "Toko A",
      pembeli: "Andi",
    },
    {
      id: 2,
      nama: "Kopi Sachet",
      status: "sedang dikirim",
      penjual: "Toko B",
      pembeli: "Budi",
    },
    {
      id: 3,
      nama: "Gula Merah",
      status: "dikirim balik",
      penjual: "Toko C",
      pembeli: "Citra",
    },
  ];

  const handleUpdateStatus = (id, statusBaru) => {
    // logika update status bisa ditempatkan di sini
    console.log(`Barang ID ${id} diubah ke status: ${statusBaru}`);
  };

  const renderAksi = (barang) => {
    const { id, status } = barang;

    switch (status) {
      case "menunggu kurir":
        return (
          <div className="space-x-2">
            <button
              onClick={() => handleUpdateStatus(id, "sedang dikirim")}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Kirim
            </button>
            <button
              onClick={() => handleUpdateStatus(id, "dikirim balik")}
              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
            >
              Kirim Balik
            </button>
          </div>
        );
      case "sedang dikirim":
        return (
          <button
            onClick={() => handleUpdateStatus(id, "sampai di tujuan")}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Sampai Tujuan
          </button>
        );
      case "dikirim balik":
        return (
          <button
            onClick={() => handleUpdateStatus(id, "menunggu penjual")}
            className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
          >
            Kembali ke Penjual
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <KurirSidebar activePage="Manage Product" />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Daftar Barang Kurir</h1>

        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3">Nama Barang</th>
                <th className="px-6 py-3">Penjual</th>
                <th className="px-6 py-3">Pembeli</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {barangKurir.map((barang) => (
                <tr key={barang.id} className="border-t">
                  <td className="px-6 py-3">{barang.nama}</td>
                  <td className="px-6 py-3">{barang.penjual}</td>
                  <td className="px-6 py-3">{barang.pembeli}</td>
                  <td className="px-6 py-3 capitalize">{barang.status}</td>
                  <td className="px-6 py-3">{renderAksi(barang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KurirBarang;
