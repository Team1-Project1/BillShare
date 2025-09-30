"use strict";
exports.__esModule = true;
exports.Section3 = void 0;
var CardGroup_1 = require("@/components/card/CardGroup");
var fi_1 = require("react-icons/fi");
exports.Section3 = function (_a) {
    var onOpenModal = _a.onOpenModal;
    return (React.createElement("div", { className: "bg-white/90 backdrop-blur-sm p-4 shadow-md" },
        React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, "Nh\u00F3m"),
        React.createElement("div", { className: "space-y-4" },
            React.createElement(CardGroup_1["default"], { name: "Du l\u1ECBch \u0110\u00E0 L\u1EA1t", memberCount: 5 }),
            React.createElement(CardGroup_1["default"], { name: "\u0102n u\u1ED1ng", memberCount: 3 })),
        React.createElement("button", { onClick: onOpenModal, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center pt-2 mt-4" },
            React.createElement(fi_1.FiUsers, { className: "mr-2" }),
            " T\u1EA1o nh\u00F3m")));
};
