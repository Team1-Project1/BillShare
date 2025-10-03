"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var head_1 = require("next/head");
var ModalConfirmLogout_1 = require("@/components/modal/ModalConfirmLogout");
function AccountPage() {
    var _a = react_1.useState(false), isModalOpen = _a[0], setIsModalOpen = _a[1];
    var router = navigation_1.useRouter();
    var handleLogout = function () {
        localStorage.clear();
        router.push("/login");
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(head_1["default"], null,
            React.createElement("title", null, "Trang t\u00E0i kho\u1EA3n"),
            React.createElement("meta", { name: "description", content: "M\u00F4 t\u1EA3 trang t\u00E0i kho\u1EA3n..." })),
        React.createElement("div", { className: "min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20" },
            React.createElement("div", { className: "w-full max-w-[576px] mx-auto" },
                React.createElement("button", { onClick: function () { return setIsModalOpen(true); }, className: "w-full max-w-[200px] h-12 bg-red-600 text-white rounded-md text-base font-semibold hover:bg-red-700 transition-colors duration-300 flex items-center justify-center mx-auto mt-4" }, "\u0110\u0103ng xu\u1EA5t"),
                React.createElement(ModalConfirmLogout_1["default"], { isOpen: isModalOpen, onClose: function () { return setIsModalOpen(false); }, onConfirm: handleLogout })))));
}
exports["default"] = AccountPage;
