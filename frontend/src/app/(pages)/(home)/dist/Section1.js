"use client";
"use strict";
exports.__esModule = true;
exports.Section1 = void 0;
var react_1 = require("react");
var fi_1 = require("react-icons/fi");
var framer_motion_1 = require("framer-motion");
exports.Section1 = function () {
    var _a = react_1.useState(false), isSearchOpen = _a[0], setIsSearchOpen = _a[1];
    return (React.createElement("div", { className: "w-full bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md" },
        React.createElement("button", { onClick: function () { return setIsSearchOpen(!isSearchOpen); }, className: "w-10 h-10 bg-[#5BC5A7] text-white rounded-full flex items-center justify-center hover:bg-[#4AA88C] transition-colors duration-300" },
            React.createElement(fi_1.FiSearch, { size: 20 })),
        React.createElement(framer_motion_1.AnimatePresence, null, isSearchOpen && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, className: "mt-2" },
            React.createElement("input", { type: "text", placeholder: "T\u00ECm ki\u1EBFm...", className: "w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" }))))));
};
