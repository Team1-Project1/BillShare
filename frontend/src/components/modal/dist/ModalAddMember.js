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
function ModalAddMember(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = react_1.useState(false), searchOpen = _b[0], setSearchOpen = _b[1];
    var _c = react_1.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var modalRef = react_1.useRef(null);
    // Dữ liệu thành viên mẫu (tái sử dụng CardMemberSelect)
    var members = [
        { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", avatar: "/avatar1.png" },
        { id: 2, name: "Trần Thị B", email: "b@gmail.com", avatar: "/avatar2.png" },
        { id: 3, name: "Lê Văn C", email: "c@gmail.com", avatar: "/avatar3.png" },
    ];
    var _d = react_1.useState([]), selectedMembers = _d[0], setSelectedMembers = _d[1];
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
    var handleSelectMember = function (id) {
        setSelectedMembers(function (prev) {
            return prev.includes(id) ? prev.filter(function (m) { return m !== id; }) : __spreadArrays(prev, [id]);
        });
    };
    var handleAddMembers = function () {
        console.log("Thêm thành viên:", selectedMembers.map(function (id) { var _a; return (_a = members.find(function (m) { return m.id === id; })) === null || _a === void 0 ? void 0 : _a.name; }));
        onClose();
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
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "Th\u00EAm th\u00E0nh vi\u00EAn"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" }, "\u2715")),
            React.createElement("button", { onClick: handleSearchToggle, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4" },
                React.createElement(fi_1.FiUser, { className: "mr-2" }),
                " Th\u00EAm b\u1EB1ng t\u00EAn ng\u01B0\u1EDDi d\u00F9ng"),
            React.createElement("div", { className: "overflow-hidden transition-all duration-300 ease-in-out " + (searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0") },
                React.createElement("input", { type: "text", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, placeholder: "T\u00ECm ki\u1EBFm t\u00EAn ng\u01B0\u1EDDi d\u00F9ng...", className: "w-full border border-gray-300 rounded-md p-2 mb-4 focus:border-[#5BC5A7] flex items-center", style: { display: searchOpen ? "block" : "none" } })),
            React.createElement("button", { onClick: handleInviteEmail, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4" },
                React.createElement(fi_1.FiMail, { className: "mr-2" }),
                " M\u1EDDi qua email"),
            React.createElement("div", { className: "mb-4 flex items-center" },
                React.createElement(fi_1.FiUsers, { className: "text-[#5BC5A7] mr-2" }),
                React.createElement("p", { className: "text-[16px] text-gray-700" }, "Th\u00EAm b\u1EA1n b\u00E8 v\u00E0o nh\u00F3m")),
            React.createElement("div", { className: "space-y-3 max-h-48 overflow-y-auto" }, members.map(function (member) { return (React.createElement(CardMemberSelect_1["default"], { key: member.id, avatar: member.avatar, name: member.name, email: member.email, selected: selectedMembers.includes(member.id), onSelect: function () { return handleSelectMember(member.id); } })); })),
            React.createElement("button", { onClick: handleAddMembers, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mt-4" }, "Th\u00EAm th\u00E0nh vi\u00EAn"))));
}
exports["default"] = ModalAddMember;
