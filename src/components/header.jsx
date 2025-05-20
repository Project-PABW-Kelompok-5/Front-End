import { useNavigate, useLocation } from "react-router-dom";
import LogoIcon from "../assets/homepage/logo.svg";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation(); 

    // Tentukan teks berdasarkan pathname
    const pageTitle =
        location.pathname === "/cart" ? "Keranjang Belanja" : "Checkout";

    return (
        <div className="relative z-10">
            {/* Navbar Main */}
            <div className="w-full bg-[#100429] py-3 px-45 sticky top-0 shadow-md flex items-center gap-1">
                {/* Logo dan Teks Vertikal di samping */}
                <div className="w-auto flex-shrink-0 flex items-center mr-4">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center text-white hover:text-white cursor-pointer"
                    >
                        <img src={LogoIcon} alt="Logo" className="h-auto w-auto" />
                        <div className="flex flex-col ml-2">
                            <span className="text-xl font-semibold">Blesing</span>
                            <span className="text-xl font-semibold flex">Store</span>
                        </div>
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