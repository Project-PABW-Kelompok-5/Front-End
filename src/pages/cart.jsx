import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Bg from "../assets/homepage/background.svg";

const Cart = () => {


  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: `url(${Bg})` }}>
      {/* Layer for opacity */}
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-col justify-start p-25">
          <h1 className="text-2xl font-bold text-white mb-25">Cart</h1>
          <h1 className="text-2xl font-bold text-white mb-4">Seller A</h1>

          <div className="flex gap-25">
            <div className="flex flex-col gap-4 mb-4">
              <div className="w-[729px] h-[165px] flex flex-row justify-start items-center bg-[#1D1919] rounded-[5px] shadow-md">
                <input type="checkbox" className="w-4 h-4 ml-4" />
                <img src="saldo.svg" alt="panci" className="w-27 h-22 ml-7" />
                <div className="flex flex-col ml-4">
                <div className="text-[#FFFBFB] mb-7">Panci Bagus Super Keren</div>
                <div className="text-[#357C3C]">Rp490,000.00</div>
                </div>
              </div>
              
              <div className="w-[729px] h-[165px] flex flex-row justify-start items-center bg-[#1D1919] rounded-[5px] shadow-md">
                <input type="checkbox" className="w-4 h-4 ml-4" />
                <img src="saldo.svg" alt="panci" className="w-27 h-22 ml-7" />
                <div className="flex flex-col ml-4">
                <div className="text-[#FFFBFB] mb-7">Panci Bagus Super Keren</div>
                <div className="text-[#357C3C]">Rp490,000.00</div>
                </div>
              </div>

              <div className="w-[729px] h-[165px] flex flex-row justify-start items-center bg-[#1D1919] rounded-[5px] shadow-md">
                <input type="checkbox" className="w-4 h-4 ml-4" />
                <img src="saldo.svg" alt="panci" className="w-27 h-22 ml-7" />
                <div className="flex flex-col ml-4">
                <div className="text-[#FFFBFB] mb-7">Panci Bagus Super Keren</div>
                <div className="text-[#357C3C]">Rp490,000.00</div>
                </div>
              </div>
            </div>

            <div className="w-[445px] h-[429px] p-7 flex justify-start bg-[#1D1919] rounded-[5px] shadow-md">
              <h1 className="text-2xl font-bold text-white">Total Pembayaran</h1>
            </div>
          </div>
          
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Cart;