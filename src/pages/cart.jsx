import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Bg from "../assets/homepage/background.svg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc, arrayRemove, deleteDoc } from "firebase/firestore";
import { firestore } from "../firebase";

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
      p.id === id && p.jumlah < p.stok
        ? { ...p, jumlah: p.jumlah + 1 }
        : p
    )
  );

  const itemRef = doc(firestore, "carts", userId, "items", id);
  await updateDoc(itemRef, {
    qty: (products.find((p) => p.id === id)?.jumlah || 1) + 1
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
    }}
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



  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: `url(${Bg})` }}>
      {/* Layer for opacity */}
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-col justify-start px-20 py-10">
          <h1 className="text-2xl font-bold text-white mb-1">Cart</h1>
          {products.length > 0 && (
            <div className="text-white mb-8">
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

              {checkedItems.length > 0 && checkedItems.length < products.length && (
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
            <div className="text-white text-lg font-semibold">Keranjang Anda kosong.</div>
          ) : (
          <div className="flex gap-25">
            <div className="flex flex-col gap-4 mb-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="w-[700px] h-[165px] flex justify-between items-center bg-[#1D1919] rounded-[5px] shadow-md"
                  >
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 ml-7"   
                        checked={checkedItems.includes(product.id)}
                        onChange={() => handleCheckboxChange(product.id)}
                      />
                      <img
                        src={`https://placehold.co/30x30?text=${encodeURIComponent(product.nama_barang || 'Product')}`}
                        alt={product.nama_barang}
                        className="w-27 h-22 ml-4"
                      />
                      <div className="flex flex-col ml-4 gap-2">
                        <div className="text-[#FFFBFB] ">{product.nama_barang}</div>
                        <div className="text-[#357C3C]">  
                          {product.harga
                            ? `Rp${Number(product.harga).toLocaleString("id-ID")}`
                            : ""}
                        </div>
                        <div className="flex items-center justify-around w-22 gap-2 border-purple-700 border-1 rounded-2xl p-1">
                          <button
                            onClick={() => kurangJumlah(product.id_barang)}
                            className="text-white w-6 h-6 rounded cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-white">{product.jumlah}</span>
                          <button
                            onClick={() => tambahJumlah(product.id_barang)}
                            className="text-white w-6 h-6 rounded cursor-pointer"
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
            <div className="w-[400px] h-[180px] p-7 flex flex-col bg-[#1D1919] rounded-[5px] shadow-md gap-2 justify-around">
              <div className="flex">
                {checkedItems.length === 0 ? (
                  <h1 className="text-xl text-white">
                    Tidak ada item yang dipilih.
                  </h1>
                ) : (
                  <div className="flex text-xl text-white">
                    <h1 className="font-normal">
                      Subtotal ({checkedItems.length} item):
                    </h1>
                    <div className="font-bold ml-2">
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