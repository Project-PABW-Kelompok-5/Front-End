import React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0e0220] text-gray-400 py-10">
      <div className="max-w-8xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center sm:text-left mb-8 md:mb-10">
          <div className="mx-auto">
            <h3 className="text-xl font-bold text-white mb-3">
              Blessing Store
            </h3>
            <p className="text-sm leading-relaxed">
              Temukan berbagai produk berkualitas dengan harga terbaik.
            </p>
            <p className="text-sm leading-relaxed">
              Belanja mudah, aman, dan nyaman untuk kebutuhan Anda.
            </p>
          </div>

          <div className="mx-auto">
            <h3 className="text-lg font-bold text-white mb-3">Navigasi</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a
                  href="/profile"
                  className="hover:text-white transition-colors"
                >
                  Profil
                </a>
              </li>
              <li>
                <a
                  href="/managebarang"
                  className="hover:text-white transition-colors"
                >
                  Mulai Jualan
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-white transition-colors">
                  Keranjang
                </a>
              </li>
              <li>
                <a
                  href="/tentang-kami"
                  className="hover:text-white transition-colors"
                >
                  Tentang Kami
                </a>
              </li>
            </ul>
          </div>

          <div className="mx-auto">
            <h3 className="text-lg font-bold text-white mb-3">Hubungi Kami</h3>
            <ul className="space-y-1 text-sm mb-4">
              <li className="flex items-center justify-center sm:justify-start">
                <Mail size={16} className="mr-2 text-purple-400" />
                <a
                  href="mailto:11221035@student.itk.ac.id"
                  className="hover:text-white transition-colors"
                >
                  support@blessingstore.com
                </a>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Phone size={16} className="mr-2 text-purple-400" />
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <span>+62 858-2854-7451</span>
                </a>
              </li>
            </ul>
            <h3 className="text-lg font-bold text-white mb-3">Ikuti Kami</h3>
            <div className="flex justify-center sm:justify-start space-x-4">
              <a
                href="https://facebook.com/blessingstore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com/titoudinho"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com/blessingstore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>© 2025 Blessing Store. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
