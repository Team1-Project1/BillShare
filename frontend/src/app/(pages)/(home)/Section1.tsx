"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export const Section1 = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md">
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="w-10 h-10 bg-[#5BC5A7] text-white rounded-full flex items-center justify-center hover:bg-[#4AA88C] transition-colors duration-300"
      >
        <FiSearch size={20} />
      </button>
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};