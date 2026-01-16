import React from 'react'
import { FaUtensils } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#ff4d2d] w-full text-white py-4 sm:py-6 mt-auto pt-5">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <FaUtensils className="w-6 h-6" />
          <h3 className="text-lg sm:text-xl font-bold tracking-wide">Vingo</h3>
        </div>

        {/* Copyright */}
        <p className="text-xs sm:text-sm text-orange-100">
          &copy; {new Date().getFullYear()} Vingo Food Delivery. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
