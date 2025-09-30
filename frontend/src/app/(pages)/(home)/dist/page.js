"use client"; // Bắt buộc vì dùng useState
"use strict";
exports.__esModule = true;
var head_1 = require("next/head");
var react_1 = require("react");
var Section1_1 = require("./Section1");
var Section2_1 = require("./Section2");
var Section3_1 = require("./Section3");
var Section4_1 = require("./Section4");
var Section5_1 = require("./Section5");
var BottomNav_1 = require("@/components/Footer/BottomNav");
var ModalCreateGroup_1 = require("@/components/modal/ModalCreateGroup"); // Adjust path
var ModalAddFriend_1 = require("@/components/modal/ModalAddFriend"); // Adjust path
function Home() {
    var _a = react_1.useState(false), isGroupModalOpen = _a[0], setIsGroupModalOpen = _a[1];
    var _b = react_1.useState(false), isFriendModalOpen = _b[0], setIsFriendModalOpen = _b[1];
    var handleOpenGroupModal = function () {
        setIsGroupModalOpen(true);
    };
    var handleOpenFriendModal = function () {
        setIsFriendModalOpen(true);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(head_1["default"], null,
            React.createElement("title", null, "Trang ch\u1EE7"),
            React.createElement("meta", { name: "description", content: "M\u00F4 t\u1EA3 trang ch\u1EE7..." })),
        React.createElement("div", { className: "min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20", style: {
                filter: isGroupModalOpen || isFriendModalOpen ? "blur(5px) brightness(0.8)" : "none",
                transition: "filter 0.3s"
            } },
            React.createElement("div", { className: "w-full max-w-[576px] mx-auto" },
                React.createElement(Section1_1.Section1, null),
                React.createElement("div", { className: "bg-[#F8F8F8]" },
                    React.createElement("div", { className: "py-6" },
                        React.createElement(Section2_1.Section2, null),
                        React.createElement("hr", { className: "my-6 border-gray-400" }),
                        React.createElement(Section3_1.Section3, { onOpenModal: handleOpenGroupModal }),
                        React.createElement("hr", { className: "my-6 border-gray-400" }),
                        React.createElement(Section4_1.Section4, { onOpenModal: handleOpenFriendModal }),
                        React.createElement("hr", { className: "my-6 border-gray-400" }),
                        React.createElement(Section5_1.Section5, null)))),
            React.createElement(BottomNav_1.BottomNav, null)),
        React.createElement(ModalCreateGroup_1["default"], { isOpen: isGroupModalOpen, onClose: function () { return setIsGroupModalOpen(false); } }),
        React.createElement(ModalAddFriend_1["default"], { isOpen: isFriendModalOpen, onClose: function () { return setIsFriendModalOpen(false); } })));
}
exports["default"] = Home;
