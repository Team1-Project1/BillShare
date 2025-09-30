"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var fi_1 = require("react-icons/fi");
function ModalAddFriend(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = react_1.useState(false), searchOpen = _b[0], setSearchOpen = _b[1];
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var modalRef = react_1.useRef(null);
    react_1.useEffect(function () {
        var handleClickOutside = function (event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return function () { return document.removeEventListener("mousedown", handleClickOutside); };
    }, [isOpen, onClose]);
    var handleSearchToggle = function () {
        setSearchOpen(!searchOpen);
    };
    var handleInviteEmail = function () {
        alert("Gửi lời mời qua email"); // Logic mời email bạn làm sau
    };
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50" },
        React.createElement("div", { ref: modalRef, className: "bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[500px] shadow-xl border border-gray-200", style: {
                transform: isOpen ? "scale(1)" : "scale(0.7)",
                opacity: isOpen ? 1 : 0,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out"
            } },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "Th\u00EAm b\u1EA1n b\u00E8"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" }, "\u2715")),
            React.createElement("button", { onClick: handleSearchToggle, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4" },
                React.createElement(fi_1.FiUser, { className: "mr-2" }),
                " Th\u00EAm b\u1EB1ng t\u00EAn ng\u01B0\u1EDDi d\u00F9ng"),
            React.createElement("div", { className: "overflow-hidden transition-all duration-300 ease-in-out " + (searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0") },
                React.createElement("input", { type: "text", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, placeholder: "T\u00ECm ki\u1EBFm t\u00EAn ng\u01B0\u1EDDi d\u00F9ng...", className: "w-full border border-gray-300 rounded-md p-2 mb-4 focus:border-[#5BC5A7] flex items-center", style: { display: searchOpen ? "block" : "none" } })),
            React.createElement("button", { onClick: handleInviteEmail, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center" },
                React.createElement(fi_1.FiMail, { className: "mr-2" }),
                " M\u1EDDi qua email"))));
}
exports["default"] = ModalAddFriend;
