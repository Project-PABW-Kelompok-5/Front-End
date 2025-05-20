import React, { useState } from "react";
import Header from "../../components/header";
import Footer from "../../components/footer";

const WalletTopUp = () => {
  const [saldo, setSaldo] = useState(250000);
  const [jumlahTopUp, setJumlahTopUp] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("Transfer Bank");
  const [bankTerpilih, setBankTerpilih] = useState("Bank Mandiri");
  const [riwayatTransaksi, setRiwayatTransaksi] = useState([
    { tipe: "Top Up", tanggal: "30-04-2025", jumlah: 100000, positif: true },
    { tipe: "Pembelian", tanggal: "1-05-2025", jumlah: 100000, positif: false },
  ]);

  const nominalPreset = [50000, 100000, 200000, 300000, 500000, 1000000];

  const handleTopUp = () => {
    const nominal = Number(jumlahTopUp);
    if (nominal > 0) {
      setSaldo(saldo + nominal);
      setRiwayatTransaksi([
        ...riwayatTransaksi,
        {
          tipe: "Top Up",
          tanggal: new Date().toLocaleDateString("id-ID"),
          jumlah: nominal,
          positif: true,
        },
      ]);
      setJumlahTopUp("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header /> {/* <-- Ganti Navbar dengan Header */}

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-10 flex gap-10">
        {/* Bagian Top Up Wallet */}
        <div className="flex-1 bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Top Up Wallet</h2>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Saldo E-Wallet Anda</h3>
            <div className="bg-gray-800 p-4 rounded text-2xl font-bold">
              Rp {saldo.toLocaleString("id-ID")},00
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Pilih Jumlah Top Up</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {nominalPreset.map((nominal) => (
                <button
                  key={nominal}
                  onClick={() => setJumlahTopUp(nominal.toString())}
                  className={`px-4 py-2 rounded border ${
                    jumlahTopUp === nominal.toString()
                      ? "bg-blue-600"
                      : "bg-gray-800"
                  }`}
                >
                  Rp {nominal.toLocaleString("id-ID")}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Masukkan Jumlah"
              value={jumlahTopUp}
              onChange={(e) => setJumlahTopUp(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Metode Pembayaran</h3>
            <div className="flex gap-4 mb-4">
              {["Kartu Kredit", "Transfer Bank", "E-Wallet"].map((metode) => (
                <button
                  key={metode}
                  onClick={() => setMetodePembayaran(metode)}
                  className={`px-4 py-2 rounded border ${
                    metodePembayaran === metode ? "bg-blue-600" : "bg-gray-800"
                  }`}
                >
                  {metode}
                </button>
              ))}
            </div>

            {metodePembayaran === "Transfer Bank" && (
              <div>
                <h4 className="mb-2">Pilih Bank</h4>
                {["Bank Mandiri", "Bank BCA", "Bank Jago"].map((bank) => (
                  <label key={bank} className="block mb-1 cursor-pointer">
                    <input
                      type="radio"
                      name="bank"
                      value={bank}
                      checked={bankTerpilih === bank}
                      onChange={() => setBankTerpilih(bank)}
                      className="mr-2"
                    />
                    {bank}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleTopUp}
            className="w-full bg-blue-600 py-3 rounded text-white font-bold hover:bg-blue-700"
          >
            Top Up Sekarang
          </button>
        </div>

        {/* Bagian Riwayat Transaksi */}
        <div className="w-80 bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Riwayat Transaksi</h2>
          {riwayatTransaksi.map((tx, idx) => (
            <div
              key={idx}
              className="flex justify-between mb-3 border-b border-gray-700 pb-2"
            >
              <div>
                <div>{tx.tipe}</div>
                <div className="text-sm text-gray-400">{tx.tanggal}</div>
              </div>
              <div className={tx.positif ? "text-green-500" : "text-red-500"}>
                {tx.positif ? "+" : "-"} Rp {tx.jumlah.toLocaleString("id-ID")}
              </div>
            </div>
          ))}
          <button className="text-blue-500 underline mt-2">
            Lihat Semua Transaksi
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WalletTopUp;
