"use strict";
exports.__esModule = true;
exports.Section4 = void 0;
var CardFriend_1 = require("@/components/card/CardFriend");
var fi_1 = require("react-icons/fi");
exports.Section4 = function (_a) {
    var onOpenModal = _a.onOpenModal;
    return (React.createElement("div", { className: "bg-white/90 backdrop-blur-sm p-4 shadow-md" },
        React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, "Th\u00EAm b\u1EA1n b\u00E8"),
        React.createElement("div", { className: "space-y-4" },
            React.createElement(CardFriend_1["default"], { name: "Nguy\u1EC5n V\u0103n A", status: "Online" }),
            React.createElement(CardFriend_1["default"], { name: "Tr\u1EA7n Th\u1ECB B", status: "Offline" })),
        React.createElement("button", { onClick: onOpenModal, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center pt-2 mt-4" },
            React.createElement(fi_1.FiUserPlus, { className: "mr-2" }),
            " Th\u00EAm b\u1EA1n")));
};
