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
var CardMemberSelect_1 = require("../card/CardMemberSelect");
function ModalCreateGroup(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = react_1.useState(""), groupName = _b[0], setGroupName = _b[1];
    var _c = react_1.useState(""), groupDesc = _c[0], setGroupDesc = _c[1];
    var _d = react_1.useState("/placeholder-avatar.png"), avatar = _d[0], setAvatar = _d[1]; // Avatar mặc định
    var _e = react_1.useState([]), selectedMembers = _e[0], setSelectedMembers = _e[1];
    var modalRef = react_1.useRef(null);
    // Dữ liệu thành viên mẫu
    var members = [
        { id: 1, name: "An", email: "annghiav01@gmail.com", avatar: "/avatar1.png" },
        { id: 2, name: "Trung Pham", email: "trung@gmail.com", avatar: "/avatar2.png" },
    ];
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
    var handleUploadAvatar = function () {
        alert("Upload avatar to Cloudinary"); // Logic upload bạn làm sau
    };
    var handleCreate = function () {
        console.log({ groupName: groupName, groupDesc: groupDesc, avatar: avatar, selectedMembers: selectedMembers });
        onClose();
    };
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50" },
        React.createElement("div", { ref: modalRef, className: "bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[476px] shadow-xl border border-gray-200", style: {
                transform: isOpen ? "scale(1)" : "scale(0.7)",
                opacity: isOpen ? 1 : 0,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out"
            } },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "T\u1EA1o Nh\u00F3m"),
                React.createElement("button", { onClick: handleCreate, className: "w-24 h-10 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center" }, "T\u1EA1o")),
            React.createElement("h3", { className: "text-base font-medium text-gray-700 mb-2" }, "Th\u00F4ng tin nh\u00F3m"),
            React.createElement("div", { className: "mb-4 text-center" },
                React.createElement("img", { src: avatar, alt: "Avatar nh\u00F3m", className: "w-24 h-24 rounded-full mx-auto cursor-pointer", onClick: handleUploadAvatar }),
                React.createElement("p", { className: "text-sm text-gray-500 mt-2" }, "Nh\u1EA5n \u0111\u1EC3 t\u1EA3i \u1EA3nh l\u00EAn")),
            React.createElement("div", { className: "mb-4" },
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "T\u00EAn nh\u00F3m"),
                React.createElement("input", { type: "text", value: groupName, onChange: function (e) { return setGroupName(e.target.value); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]" })),
            React.createElement("div", { className: "mb-4" },
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Th\u00F4ng tin m\u00F4 t\u1EA3"),
                React.createElement("textarea", { value: groupDesc, onChange: function (e) { return setGroupDesc(e.target.value); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7] h-24" })),
            React.createElement("h3", { className: "text-base font-medium text-gray-700 mb-2" }, "Th\u00EAm th\u00E0nh vi\u00EAn"),
            React.createElement("div", { className: "space-y-3 max-h-48 overflow-y-auto" }, members.map(function (member) { return (React.createElement(CardMemberSelect_1["default"], { key: member.id, avatar: member.avatar, name: member.name, email: member.email, selected: selectedMembers.includes(member.id), onSelect: function () { return handleSelectMember(member.id); } })); })))));
}
exports["default"] = ModalCreateGroup;
