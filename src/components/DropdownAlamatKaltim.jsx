import React, { useState } from "react";
import kalimantanTimurData from "../../src/kalimantan_timur.json";

const DropdownAlamatKaltim = ({ onChange }) => {
  const [selectedKota, setSelectedKota] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [selectedKodePos, setSelectedKodePos] = useState("");
  const [kodePosList, setKodePosList] = useState([]);

  const kotaList = kalimantanTimurData.kota;

  const handleKotaChange = (e) => {
    const kota = e.target.value;
    setSelectedKota(kota);
    setSelectedKecamatan("");
    setSelectedKodePos("");
    setKodePosList([]);

    onChange?.({
      provinsi: kalimantanTimurData.provinsi,
      kota,
      kecamatan: "",
      kodePos: "",
    });
  };

  const handleKecamatanChange = (e) => {
    const kecamatan = e.target.value;
    setSelectedKecamatan(kecamatan);

    const kotaObj = kotaList.find((k) => k.nama === selectedKota);
    const kecObj = kotaObj?.kecamatan.find((k) => k.nama === kecamatan);
    const kodePos = kecObj?.kode_pos || [];

    setKodePosList(kodePos);
    setSelectedKodePos(kodePos[0] || "");

    onChange?.({
      provinsi: kalimantanTimurData.provinsi,
      kota: selectedKota,
      kecamatan,
      kodePos: kodePos[0] || "",
    });
  };

  const handleKodePosChange = (e) => {
    const kode = e.target.value;
    setSelectedKodePos(kode);
    onChange?.({
      provinsi: kalimantanTimurData.provinsi,
      kota: selectedKota,
      kecamatan: selectedKecamatan,
      kodePos: kode,
    });
  };

  return (
    <div className="space-y-4">
      {/* Provinsi */}
      <div>
        <label className="block mb-1 font-semibold">Provinsi</label>
        <select
          value={kalimantanTimurData.provinsi}
          className="w-full border rounded px-3 py-2"
        >
          <option value={kalimantanTimurData.provinsi}>
            {kalimantanTimurData.provinsi}
          </option>
        </select>
      </div>

      {/* Kota */}
      <div>
        <label className="block mb-1 font-semibold">Kota</label>
        <select
          value={selectedKota}
          onChange={handleKotaChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Pilih Kota --</option>
          {kotaList.map((kota) => (
            <option key={kota.nama} value={kota.nama}>
              {kota.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Kecamatan */}
      <div>
        <label className="block mb-1 font-semibold">Kecamatan</label>
        <select
          value={selectedKecamatan}
          onChange={handleKecamatanChange}
          disabled={!selectedKota}
          className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
        >
          <option value="">-- Pilih Kecamatan --</option>
          {selectedKota &&
            kotaList
              .find((k) => k.nama === selectedKota)
              ?.kecamatan.map((kec) => (
                <option key={kec.nama} value={kec.nama}>
                  {kec.nama}
                </option>
              ))}
        </select>
      </div>

      {/* Kode Pos */}
      <div>
        <label className="block mb-1 font-semibold">Kode Pos</label>
        <select
          value={selectedKodePos}
          onChange={handleKodePosChange}
          disabled={kodePosList.length === 0}
          className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
        >
          <option value="">-- Pilih Kode Pos --</option>
          {kodePosList.map((kode) => (
            <option key={kode} value={kode}>
              {kode}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DropdownAlamatKaltim;
