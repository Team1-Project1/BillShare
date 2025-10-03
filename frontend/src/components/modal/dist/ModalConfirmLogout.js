"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
function ModalConfirmLogout(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onConfirm = _a.onConfirm;
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
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50" },
        React.createElement("div", { ref: modalRef, className: "bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-[400px] shadow-xl border border-gray-200", style: {
                transform: isOpen ? "scale(1)" : "scale(0.7)",
                opacity: isOpen ? 1 : 0,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out"
            } },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "X\u00E1c nh\u1EADn \u0111\u0103ng xu\u1EA5t"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" }, "\u2715")),
            React.createElement("p", { className: "text-gray-600 mb-6" }, "B\u1EA1n c\u00F3 ch\u1EAFc mu\u1ED1n \u0111\u0103ng xu\u1EA5t t\u00E0i kho\u1EA3n n\u00E0y ch\u1EE9?"),
            React.createElement("div", { className: "flex justify-end space-x-4" },
                React.createElement("button", { onClick: onClose, className: "h-15 px-4 pb-2 pt-2 bg-gray-500 text-white rounded-md text-base font-semibold hover:bg-gray-600 transition-colors duration-300" }, "Kh\u00F4ng"),
                React.createElement("button", { onClick: function () {
                        onConfirm();
                        onClose();
                    }, className: "h-15 px-4 pb-2 pt-2 bg-red-600 text-white rounded-md text-base font-semibold hover:bg-red-700 transition-colors duration-300" }, "C\u00F3")))));
}
exports["default"] = ModalConfirmLogout;
