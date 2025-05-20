import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

const Topup = () => {
  const [query, setQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const navigate = useNavigate();

  const handleSignInClick = () => navigate("/login");
  const handleWalletClick = () => navigate("/users/topup");

  return (
    <div className="min-h-screen bg-cover bg-center">
      <Navbar
        query={query}
        setQuery={setQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartCount={cart.length}
        setShowCart={setShowCart}
        showCart={showCart}
        handleSignInClick={handleSignInClick}
        handleWalletInClick={handleWalletClick}
      />

      <div className="w-full h-[1873px] bg-[#000] rounded-[5px] absolute top-[134px] left-0">
        <div className="w-full h-[1188px] text-[0px] absolute top-[118px] left-[40px] z-[70]">
          <span className="block h-[29px] font-['Inter'] text-[24px] font-bold leading-[29px] text-[#fff] relative text-left whitespace-nowrap z-[1] mt-0 mr-0 mb-0 ml-[8px]">
            Top Up Wallet
          </span>
          <div className="w-[60%] h-[170px] text-[0px] bg-[#000] rounded-[5px] border-solid border border-[#fff] relative z-[69] mt-[23px] mr-0 mb-0 ml-[8px]">
            <span className="block h-[29px] font-['Inter'] text-[24px] font-bold leading-[29px] text-[#fff] relative text-left whitespace-nowrap z-[78] mt-[22px] mr-0 mb-0 ml-[30px]">
              Saldo E-Wallet Anda
            </span>
            <div className="flex w-full h-[44px] justify-between items-center relative z-[76] mt-[44px] mr-0 mb-0 ml-[10px]">
              <div className="w-[40px] h-[40px] shrink-0 relative overflow-hidden z-[76]">
                <div className="w-[33.333px] h-[33.333px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-06/bgmseJvMJ2.png)] bg-[length:100%_100%] bg-no-repeat relative z-[77] mt-[3.333px] mr-0 mb-0 ml-[3.333px]" />
              </div>
              <span className="h-[29px] shrink-0 font-['Inter'] text-[36px] font-bold leading-[44px] text-[#fff] relative z-[75]">
                Rp.250.000,00
              </span>
            </div>
          </div>
          <div className="w-[778px] h-[895px] text-[0px] bg-[#000] rounded-[5px] border-solid border border-[#fff] relative z-[70] mt-[71px] mr-0 mb-0 ml-0">
            <span className="block h-[29px] font-['Inter'] text-[24px] font-bold leading-[29px] text-[#fff] relative text-left whitespace-nowrap z-[73] mt-[26px] mr-0 mb-0 ml-[34px]">
              Pilih Jumlah Top Up
            </span>
            <span className="block h-[19px] font-['Inter'] text-[16px] font-light leading-[19px] text-[#fff] relative text-left whitespace-nowrap z-[74] mt-[9px] mr-0 mb-0 ml-[34px]">
              Pilih jumlah atau masukkan jumlah kustom
            </span>
            <div className="flex w-[710px] h-[50px] justify-between items-center relative z-[92] mt-[48px] mr-0 mb-0 ml-[34px]">
              <div className="w-[200px] h-[50px] shrink-0 bg-[#d9d9d9] rounded-[5px] relative z-[80]">
                <span className="flex h-[24px] justify-start items-center font-['Inter'] text-[16px] font-medium leading-[19.364px] text-[#000] absolute top-[13px] left-[46px] text-left whitespace-nowrap z-[81]">
                  Rp 50.000,00
                </span>
              </div>
              <div className="w-[200px] h-[50px] shrink-0 bg-[#d9d9d9] rounded-[5px] relative z-[86]">
                <span className="flex h-[24px] justify-start items-center font-['Inter'] text-[16px] font-medium leading-[19.364px] text-[#000] absolute top-[13px] left-[41px] text-left whitespace-nowrap z-[87]">
                  Rp 100.000,00
                </span>
              </div>
              <div className="w-[200px] h-[50px] shrink-0 bg-[#d9d9d9] rounded-[5px] relative z-[92]">
                <span className="flex h-[24px] justify-start items-center font-['Inter'] text-[16px] font-medium leading-[19.364px] text-[#000] absolute top-[13px] left-[43px] text-left whitespace-nowrap z-[93]">
                  Rp 200.000,00
                </span>
              </div>
            </div>
            <div className="flex w-[710px] h-[50px] justify-between items-center relative z-[95] mt-[48px] mr-0 mb-0 ml-[34px]">
              <div className="w-[200px] h-[50px] shrink-0 bg-[#d9d9d9] rounded-[5px] relative z-[83]">
                <span className="flex h-[24px] justify-start items-center font-['Inter'] text-[16px] font-medium leading-[19.364px] text-[#000] absolute top-[13px] left-[39px] text-left whitespace-nowrap z-[84]">
                  Rp 300.000,00
                </span>
              </div>
              <div className="w-[200px] h-[50px] shrink-0 bg-[#d9d9d9] rounded-[5px] relative z-[89]">
                <span className="flex h-[24px] justify-start items-center font-['Inter'] text-[16px] font-medium leading-[19.364px] text-[#000] absolute top-[13px] left-[41px] text-left whitespace-nowrap z-[90]">
                  Rp 500.000,00
                </span>
              </div>
              <div className="w-[200px] h-[50px] shrink-0 bg-[#d9d9d9] rounded-[5px] relative z-[95]">
                <span className="flex h-[24px] justify-start items-center font-['Inter'] text-[16px] font-medium leading-[19.364px] text-[#000] absolute top-[13px] left-[43px] text-left whitespace-nowrap z-[96]">
                  Rp 1.000.000,00
                </span>
              </div>
            </div>
            <span className="block h-[19px] font-['Inter'] text-[16px] font-medium leading-[19px] text-[#fff] relative text-left whitespace-nowrap z-[72] mt-[48px] mr-0 mb-0 ml-[34px]">
              Jumlah Kustom
            </span>
            <div className="w-[707px] h-[41px] bg-[#d9d9d9] rounded-[5px] relative z-[98] mt-[29px] mr-0 mb-0 ml-[37px]">
              <span className="flex h-[19px] justify-start items-center font-['Inter'] text-[16px] font-light leading-[19px] text-[#000] absolute top-[11px] left-[23px] text-left whitespace-nowrap z-[98]">
                Masukkan Jumlah
              </span>
            </div>
            <div className="w-[705px] h-[51px] bg-[#d9d9d9] rounded-[5px] relative z-[99] mt-[36px] mr-0 mb-0 ml-[38px]">
              <div className="w-[210px] h-[38px] bg-[#fff] rounded-[5px] absolute top-[7px] left-[241px] z-[102]">
                <span className="flex h-[19px] justify-start items-center font-['Inter'] text-[16px] font-medium leading-[19px] text-[#000] absolute top-[9px] left-[51px] text-left whitespace-nowrap z-[103]">
                  Transfer Bank
                </span>
              </div>
              <span className="flex h-[19px] justify-start items-center font-['Inter'] text-[16px] font-medium leading-[19px] text-[#000] absolute top-[16px] left-[65px] text-left whitespace-nowrap z-[100]">
                Kartu Kredit
              </span>
              <span className="flex h-[19px] justify-start items-center font-['Inter'] text-[16px] font-medium leading-[19px] text-[#000] absolute top-[16px] left-[549px] text-left whitespace-nowrap z-[101]">
                E-Wallet
              </span>
            </div>
            <div className="w-[172px] h-[30px] relative z-[109] mt-[76px] mr-0 mb-0 ml-[46px]">
              <div className="w-[30px] h-[30px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-06/ORXOnqvirD.png)] bg-cover bg-no-repeat rounded-[50%] absolute top-0 left-0 z-[104]" />
              <span className="flex h-[24px] justify-start items-center font-['Inter'] text-[20px] font-medium leading-[24px] text-[#fff] absolute top-[3px] left-[47px] text-left whitespace-nowrap z-[71]">
                Bank Mandiri
              </span>
              <div className="w-[20px] h-[20px] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-06/jpAN5qwG5L.png)] bg-cover bg-no-repeat rounded-[50%] absolute top-[5px] left-[5px] z-[109]" />
            </div>
            <div className="flex w-[142px] h-[30px] justify-between items-center relative z-[106] mt-[21px] mr-0 mb-0 ml-[46px]">
              <div className="w-[30px] h-[30px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-06/tXycvWAz5x.png)] bg-cover bg-no-repeat rounded-[50%] relative z-[106]" />
              <span className="h-[24px] shrink-0 font-['Inter'] text-[20px] font-medium leading-[24px] text-[#fff] relative text-left whitespace-nowrap z-[105]">
                Bank BCA
              </span>
            </div>
            <div className="flex w-[147px] h-[30px] justify-between items-center relative z-[108] mt-[21px] mr-0 mb-0 ml-[46px]">
              <div className="w-[30px] h-[30px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-06/EzvpjPAjri.png)] bg-cover bg-no-repeat rounded-[50%] relative z-[108]" />
              <span className="h-[24px] shrink-0 font-['Inter'] text-[20px] font-medium leading-[24px] text-[#fff] relative text-left whitespace-nowrap z-[107]">
                Bank Jago
              </span>
            </div>
            <div className="flex w-[570px] h-[60px] justify-center items-center bg-[#d9d9d9] rounded-[5px] relative z-[111] mt-[81px] mr-0 mb-0 ml-[102px]">
              <span className="h-[24px] shrink-0 font-['Inter'] text-[20px] font-semibold leading-[24px] text-[#000] relative text-left whitespace-nowrap z-[111]">
                Top Up Sekarang
              </span>
            </div>
          </div>
        </div>
        <div className="w-[440px] h-[618px] bg-[#000] rounded-[5px] border-solid border border-[#fff] absolute top-[163px] left-[961px] z-[112]">
          <div className="flex w-[289px] h-[62px] justify-between items-center relative z-[115] mt-[21px] mr-0 mb-0 ml-[24px]">
            <div className="w-[62px] h-[62px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-06/4PO2NLtAFo.png)] bg-[length:100%_100%] bg-no-repeat relative overflow-hidden z-[115]" />
            <span className="h-[29px] shrink-0 font-['Inter'] text-[24px] font-semibold leading-[29px] text-[#fff] relative text-left whitespace-nowrap z-[114]">
              Riwayat Transaksi
            </span>
          </div>
          <span className="block h-[19px] font-['Inter'] text-[16px] font-semibold leading-[19px] text-[#fff] relative text-left whitespace-nowrap z-[116] mt-[44px] mr-0 mb-0 ml-[24px]">
            Top Up
          </span>
          <div className="flex w-[401px] h-[19px] justify-between items-center relative z-[118] mt-[7px] mr-0 mb-0 ml-[24px]">
            <span className="h-[19px] shrink-0 font-['Inter'] text-[16px] font-semibold leading-[19px] text-[#fff] relative text-left whitespace-nowrap z-[117]">
              30-04-2025
            </span>
            <span className="h-[19px] shrink-0 font-['Inter'] text-[16px] font-semibold leading-[19px] text-[#00ff19] relative text-left whitespace-nowrap z-[118]">
              + Rp 100.000,00
            </span>
          </div>
          <div className="w-[400px] h-px bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-06/dZ32qXVj0y.png)] bg-cover bg-no-repeat relative z-[119] mt-[12px] mr-0 mb-0 ml-[24px]" />
          <span className="block h-[19px] font-['Inter'] text-[16px] font-semibold leading-[19px] text-[#fff] relative text-left whitespace-nowrap z-[120] mt-[23px] mr-0 mb-0 ml-[23px]">
            Pembelian
          </span>
          <div className="flex w-[402px] h-[19px] justify-between items-center relative z-[122] mt-[7px] mr-0 mb-0 ml-[23px]">
            <span className="h-[19px] shrink-0 font-['Inter'] text-[16px] font-semibold leading-[19px] text-[#fff] relative text-left whitespace-nowrap z-[121]">
              1-05-2025
            </span>
            <span className="h-[19px] shrink-0 font-['Inter'] text-[16px] font-semibold leading-[19px] text-[#ff0000] relative text-left whitespace-nowrap z-[122]">
              - Rp 100.000,00
            </span>
          </div>
          <div className="w-[400px] h-px bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-06/toz7cTFw4z.png)] bg-cover bg-no-repeat relative z-[123] mt-[12px] mr-0 mb-0 ml-[23px]" />
          <div className="flex w-[208px] h-[24px] justify-between items-center relative z-[124] mt-[310px] mr-0 mb-0 ml-[126px]">
            <span className="h-[19px] shrink-0 font-['Inter'] text-[16px] font-semibold leading-[19px] text-[#fff] relative text-left whitespace-nowrap z-[124]">
              Lihat Semua Transaksi
            </span>
            <div className="w-[24px] h-[24px] shrink-0 bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-05-06/NyqJqtDDkg.png)] bg-[length:100%_100%] bg-no-repeat relative overflow-hidden z-[113]" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Topup;
