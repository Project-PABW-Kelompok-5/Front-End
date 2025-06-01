import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoIcon from "../assets/homepage/logo.svg";

const navbaro = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const profile = () => {
    navigate("/profile");
  };
  const wishlist = () => {
    navigate("/wishlist");
  };

  return (
    <div className="bg-gradient-to-r from-[#753799] to-[#4a1d6a] text-white shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-2">
              <img src={LogoIcon} alt="Logo" className="h-auto w-auto" />
              <div className="flex flex-col ml-2">
                <span className="text-xl font-semibold">Blesing</span>
                <span className="text-xl font-semibold flex">Store</span>
              </div>
            </a>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={wishlist}
              className="relative cursor-pointer md:block"
            >
              <Heart className="h-6 w-6" />
            </button>
            <button className="ml-0 md:ml-6 relative cursor-pointer md:block">
              <ShoppingBag className="h-6 w-6" />
            </button>
            <button
              onClick={profile}
              className="ml-6 hidden cursor-pointer md:block"
            >
              <User className="h-6 w-6" />
            </button>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default navbaro;
