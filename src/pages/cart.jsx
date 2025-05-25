import Navbar from "../components/navbar";
import Header from "../components/header";
import Footer from "../components/footer";
import Bg from "../assets/homepage/background.svg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../firebase";
import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Camera,
  Tablet,
  Cable,
  Coffee,
  Package,
} from "lucide-react";

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartData = async () => {
      if (!userId) return;

      try {
        // Ambil data cart user
        const cartRef = collection(firestore, "carts", userId, "items");
        const cartSnapshot = await getDocs(cartRef);

        // Ambil semua produk dari koleksi barang
        const barangSnapshot = await getDocs(collection(firestore, "barang"));
        const allBarang = {};
        barangSnapshot.forEach((doc) => {
          allBarang[doc.id] = { id: doc.id, ...doc.data() };
        });

        // Gabungkan data cart + produk
        const cartProducts = cartSnapshot.docs.map((doc) => {
          const productId = doc.id;
          const productData = allBarang[productId];

          return {
            ...productData,
            jumlah: doc.data().qty || 1,
          };
        });

        setProducts(cartProducts);
      } catch (error) {
        console.error("Gagal memuat data keranjang:", error);
      }
    };

    fetchCartData();
  }, [userId]);

  const handleCheckboxChange = (productId) => {
    setCheckedItems((prevChecked) =>
      prevChecked.includes(productId)
        ? prevChecked.filter((id) => id !== productId)
        : [...prevChecked, productId]
    );
  };

  const handleSelectAll = () => {
    const allIds = products.map((product) => product.id);
    setCheckedItems(allIds);
  };

  const handleDeselectAll = () => {
    setCheckedItems([]);
  };

  const tambahJumlah = async (id) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id && p.jumlah < p.stok ? { ...p, jumlah: p.jumlah + 1 } : p
      )
    );

    const itemRef = doc(firestore, "carts", userId, "items", id);
    await updateDoc(itemRef, {
      qty: (products.find((p) => p.id === id)?.jumlah || 1) + 1,
    });
  };

  const kurangJumlah = async (id) => {
    const updatedProducts = products.map((p) => {
      if (p.id === id && p.jumlah > 1) {
        return { ...p, jumlah: p.jumlah - 1 };
      }
      return p;
    });

    setProducts(updatedProducts);

    const currentQty = products.find((p) => p.id === id)?.jumlah || 1;
    if (currentQty > 1) {
      const itemRef = doc(firestore, "carts", userId, "items", id);
      try {
        await updateDoc(itemRef, {
          qty: currentQty - 1,
        });
      } catch (err) {
        console.error("Gagal mengurangi jumlah:", err);
      }
    }
  };

  const hapusItem = async (productId) => {
    if (!userId) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    try {
      // Hapus dokumen dari koleksi carts/{userId}/items
      const itemRef = doc(firestore, "carts", userId, "items", productId);
      await deleteDoc(itemRef);

      // Opsional: juga hapus id user dari array id_cart_user di barang
      const barangRef = doc(firestore, "barang", productId);
      await updateDoc(barangRef, {
        id_cart_user: arrayRemove(userId),
      });

      // Hapus dari state lokal
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setCheckedItems((prev) => prev.filter((cid) => cid !== productId));
    } catch (err) {
      console.error("Gagal menghapus item:", err);
      alert("Terjadi kesalahan saat menghapus item.");
    }
  };

  useEffect(() => {
    const totalHarga = products.reduce((acc, product) => {
      return checkedItems.includes(product.id)
        ? acc + (product.harga || 0) * product.jumlah
        : acc;
    }, 0);
    setTotal(totalHarga);
  }, [checkedItems, products]);

  const handleCheckout = () => {
    if (checkedItems.length === 0) {
      alert("Pilih setidaknya 1 item sebelum melanjutkan pembayaran.");
      return;
    }

    // ambil produk yang dicentang
    const selected = products.filter((p) => checkedItems.includes(p.id));

    /* ─── CEK STOK ─────────────────────────────────────────── */
    const outOfStock = selected.filter((item) => {
      // item.jumlah = qty di keranjang
      // item.stok   = stok tersedia di database
      return item.jumlah > (item.stok || 0);
    });

    if (outOfStock.length > 0) {
      // buat daftar nama produk yang stok‑nya kurang
      const names = outOfStock.map((i) => i.nama_barang).join(", ");
      alert(`Stok tidak mencukupi untuk produk: ${names}`);
      return; // hentikan proses checkout
    }
    /* ─────────────────────────────────────────────────────── */

    // jika semua stok cukup → lanjut ke halaman checkout
    navigate("/checkout", { state: { items: selected } });
  };

  const iconMap = {
    smartphone: Smartphone,
    laptop: Laptop,
    headphones: Headphones,
    watch: Watch,
    camera: Camera,
    tablet: Tablet,
    cable: Cable,
    coffee: Coffee,
  };

  const getProductIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Package;
    return <IconComponent className="h-8 w-8 text-[#753799]" />;
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative bg-gray-100"
      //  style={{ backgroundImage: `url(${Bg})` }}
    >
      {/* Layer for opacity */}
      {/* <div className="absolute inset-0 bg-black opacity-70"></div> */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-col justify-start max-w-7xl mx-auto py-10">
          {products.length > 0 && (
            <div className="text-black mb-8">
              <h1 className="text-2xl font-bold text-black mb-1">
                Keranjang Saya
              </h1>
              {checkedItems.length === 0 && (
                <>
                  Tidak ada item yang dipilih.{" "}
                  <span
                    className="text-blue-400 hover:underline cursor-pointer ml-2"
                    onClick={handleSelectAll}
                  >
                    Pilih semua item
                  </span>
                </>
              )}

              {checkedItems.length > 0 &&
                checkedItems.length < products.length && (
                  <span
                    className="text-blue-400 hover:underline cursor-pointer"
                    onClick={handleSelectAll}
                  >
                    Pilih semua item
                  </span>
                )}

              {checkedItems.length === products.length && (
                <span
                  className="text-blue-400 hover:underline cursor-pointer"
                  onClick={handleDeselectAll}
                >
                  Batalkan pilihan semua item
                </span>
              )}
            </div>
          )}

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
              {/* Icon atau gambar keranjang kosong */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13L17 13M7 13h10M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>

              {/* Teks utama */}
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Keranjang Belanja Anda kosong
              </h2>

              {/* Teks tambahan */}
              <p className="text-gray-500 mb-4">
                Yuk, jelajahi produk menarik dan tambahkan ke keranjangmu!
              </p>

              {/* Tombol kembali ke homepage atau produk */}
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition cursor-pointer"
              >
                Belanja Sekarang
              </button>
            </div>
          ) : (
            <div className="flex gap-25 justify-between">
              <div className="flex flex-col gap-4 mb-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="w-[700px] h-[165px] flex justify-between items-center bg-white rounded-[5px] border border-gray-200 shadow-md"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 ml-7"
                        checked={checkedItems.includes(product.id)}
                        onChange={() => handleCheckboxChange(product.id)}
                      />
                      <div className="w-25 h-25 bg-purple-50 rounded-lg flex items-center justify-center ml-4 flex-shrink-0">
                        {getProductIcon(product.icon)}
                      </div>
                      <div className="flex flex-col ml-4 gap-2">
                        <div className="text-black ">{product.nama_barang}</div>
                        <div className="text-[#753799] font-semibold">
                          {product.harga
                            ? `Rp${Number(product.harga).toLocaleString(
                                "id-ID"
                              )}`
                            : ""}
                        </div>
                        <div className="flex items-center justify-around w-22 gap-2 border-purple-700 border-1 rounded-2xl p-1">
                          <button
                            onClick={() => kurangJumlah(product.id_barang)}
                            className="text-black w-6 h-6 rounded cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-black">{product.jumlah}</span>
                          <button
                            onClick={() => tambahJumlah(product.id_barang)}
                            className="text-black w-6 h-6 rounded cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => hapusItem(product.id_barang)}
                      className="text-red-500 text-sm hover:underline mr-7 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
              <div className="w-[400px] h-[180px] p-7 flex flex-col bg-white rounded-[5px] border border-gray-200 shadow-md gap-2 justify-around">
                <div className="flex">
                  {checkedItems.length === 0 ? (
                    <h1 className="text-xl text-black">
                      Tidak ada item yang dipilih.
                    </h1>
                  ) : (
                    <div className="flex text-xl text-black">
                      <h1 className="font-normal">
                        Subtotal ({checkedItems.length} item):
                      </h1>
                      <div className="font-bold ml-2 text-[#753799]">
                        {`Rp${Number(total).toLocaleString("id-ID")}`}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCheckout}
                  className="bg-[#7338A0] rounded-3xl hover:bg-purple-500 text-white font-bold py-3 px-4 transition cursor-pointer"
                >
                  Lanjut ke Pembayaran
                </button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Cart;
