import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#0e0220] text-white py-10 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-600 pb-6">
          <h2 className="text-xl font-bold mb-4 md:mb-0">Blessing Store</h2>
          <div className="flex space-x-4">
            <a href="#"><i className="fab fa-facebook text-xl"></i></a>
            <a href="#"><i className="fab fa-instagram text-xl"></i></a>
            <a href="#"><i className="fab fa-twitter text-xl"></i></a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between mt-6">
          <div className="mb-6 md:mb-0">
            <h3 className="text-gray-400 font-semibold mb-2">Company Info</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Carrier</a></li>
              <li><a href="#">We are hiring</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-400 font-semibold mb-2">Subscribe</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Your Email"
                className="px-3 py-2 rounded-l-md border border-gray-300 text-white"
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Blessing Store All Right Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;