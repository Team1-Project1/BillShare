"use strict";
exports.__esModule = true;
exports.BottomNav = void 0;
var link_1 = require("next/link");
var fi_1 = require("react-icons/fi");
exports.BottomNav = function () {
    return (React.createElement("div", { className: "fixed bottom-0 w-full max-w-[576px] mx-auto bg-white/90 backdrop-blur-sm border-t border-gray-200 p-2 shadow-md mt-6" },
        React.createElement("div", { className: "flex justify-around items-center" },
            React.createElement(link_1["default"], { href: "/", className: "flex flex-col items-center text-gray-600 hover:text-[#5BC5A7] transition-colors duration-300" },
                React.createElement(fi_1.FiHome, { size: 20 }),
                React.createElement("span", { className: "text-xs" }, "Home")),
            React.createElement(link_1["default"], { href: "/group/list", className: "flex flex-col items-center text-gray-600 hover:text-[#5BC5A7] transition-colors duration-300" },
                React.createElement(fi_1.FiUsers, { size: 20 }),
                React.createElement("span", { className: "text-xs" }, "Groups")),
            React.createElement(link_1["default"], { href: "/friends", className: "flex flex-col items-center text-gray-600 hover:text-[#5BC5A7] transition-colors duration-300" },
                React.createElement(fi_1.FiUser, { size: 20 }),
                React.createElement("span", { className: "text-xs" }, "Friends")),
            React.createElement(link_1["default"], { href: "/account", className: "flex flex-col items-center text-gray-600 hover:text-[#5BC5A7] transition-colors duration-300" },
                React.createElement(fi_1.FiSettings, { size: 20 }),
                React.createElement("span", { className: "text-xs" }, "Account")))));
};
