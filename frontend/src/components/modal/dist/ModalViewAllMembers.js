"use client";
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var fi_1 = require("react-icons/fi");
var CardMemberSelect_1 = require("../card/CardMemberSelect");
function ModalViewAllMembers(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, members = _a.members;
    var modalRef = react_1.useRef(null);
    var _b = react_1.useState([]), selectedMembers = _b[0], setSelectedMembers = _b[1];
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
    var handleSelectMember = function (id) {
        setSelectedMembers(function (prev) {
            return prev.includes(id) ? prev.filter(function (m) { return m !== id; }) : __spreadArrays(prev, [id]);
        });
    };
    var handleDeleteMembers = function () {
        console.log("Xóa thành viên:", selectedMembers.map(function (id) { var _a; return (_a = members.find(function (m) { return m.id === id; })) === null || _a === void 0 ? void 0 : _a.name; }));
        setSelectedMembers([]); // Reset danh sách chọn sau khi xóa
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
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900 flex-1 text-center" }, "T\u1EA5t c\u1EA3 th\u00E0nh vi\u00EAn"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" }, "\u2715")),
            React.createElement("div", { className: "mb-4 flex items-center" },
                React.createElement(fi_1.FiUsers, { className: "text-[#5BC5A7] mr-2" }),
                React.createElement("p", { className: "text-[16px] text-gray-700" }, "Danh s\u00E1ch th\u00E0nh vi\u00EAn")),
            React.createElement("div", { className: "space-y-3 max-h-48 overflow-y-auto" }, members.map(function (member) { return (React.createElement(CardMemberSelect_1["default"], { key: member.id, avatar: member.avatar, name: member.name, email: member.email, selected: selectedMembers.includes(member.id), onSelect: function () { return handleSelectMember(member.id); } })); })),
            React.createElement("button", { onClick: handleDeleteMembers, className: "w-full h-12 bg-red-500 text-white rounded-md text-base font-semibold hover:bg-red-600 transition-colors duration-300 flex items-center justify-center mt-4" },
                React.createElement(fi_1.FiTrash2, { className: "mr-2" }),
                " X\u00F3a"))));
}
exports["default"] = ModalViewAllMembers;
