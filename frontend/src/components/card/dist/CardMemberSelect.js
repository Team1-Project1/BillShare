"use client";
"use strict";
exports.__esModule = true;
var fi_1 = require("react-icons/fi");
function CardMemberSelect(_a) {
    var avatar = _a.avatar, name = _a.name, email = _a.email, selected = _a.selected, onSelect = _a.onSelect;
    var handleCheckboxChange = function (e) {
        e.stopPropagation(); // Ngăn sự kiện lan truyền lên div cha
        onSelect();
    };
    var handleDivClick = function (e) {
        // Chỉ gọi onSelect nếu không nhấp vào checkbox
        if (!(e.target instanceof HTMLInputElement)) {
            onSelect();
        }
    };
    return (React.createElement("div", { className: "bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between cursor-pointer", onClick: handleDivClick },
        React.createElement("div", { className: "flex items-center" },
            avatar ? (React.createElement("img", { src: avatar, alt: "Avatar", className: "w-10 h-10 rounded-full mr-3" })) : (React.createElement(fi_1.FiUser, { className: "text-[#5BC5A7] mr-3 text-3xl" })),
            React.createElement("div", null,
                React.createElement("h4", { className: "text-sm font-medium text-gray-900" }, name),
                React.createElement("p", { className: "text-xs text-gray-600" }, email))),
        React.createElement("input", { type: "checkbox", checked: selected, onChange: handleCheckboxChange, className: "w-5 h-5 text-[#5BC5A7] border-gray-300 rounded focus:ring-[#5BC5A7]" })));
}
exports["default"] = CardMemberSelect;
