import { useNavigate, useLocation } from "react-router-dom";
import LogoIcon from "../assets/homepage/logo putih.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let pageTitle = "";

  switch (location.pathname) {
    case "/cart":
      pageTitle = "Keranjang Belanja";
      break;
    case "/wishlist":
      pageTitle = "Wishlist";
      break;
    case "/checkout":
      pageTitle = "Checkout";
      break;
    case "/managebarang":
      pageTitle = "Manage Barang";
      break;
  }

  return (
    <div className="relative z-10">
      {/* Navbar Main */}
      <div className="w-full bg-gradient-to-r from-[#6d2299] to-[#2a0c3f] py-3 px-45 sticky top-0 shadow-md flex items-center gap-1">
        {/* Logo dan Teks Vertikal di samping */}
        <div className="w-auto flex-shrink-0 flex items-center mr-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-white hover:text-white cursor-pointer"
          >
            <img src={LogoIcon} alt="Logo" className="h-24 w-24" />
            {/* <div className="flex flex-col ml-2">
              <span className="text-xl font-semibold">Blesing</span>
              <span className="text-xl font-semibold flex">Store</span>
            </div> */}
          </button>
        </div>
        <div className="h-10 w-px bg-white mx-4" />

        {/* Judul halaman dinamis */}
        <p className="text-white text-xl">{pageTitle}</p>
      </div>
    </div>
  );
};

export default Header;
