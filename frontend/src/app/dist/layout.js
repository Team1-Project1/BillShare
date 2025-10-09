"use client";
"use strict";
exports.__esModule = true;
require("./globals.css");
var react_toastify_1 = require("react-toastify"); // Thêm import react-toastify
require("react-toastify/dist/ReactToastify.css"); // Thêm import CSS của react-toastify
var useAuthRefresh_1 = require("@/hooks/useAuthRefresh");
function RootLayout(_a) {
    var children = _a.children;
    useAuthRefresh_1.useAuthRefresh(); // luôn chạy background refresh
    return (React.createElement("html", { lang: "vi", suppressHydrationWarning: true },
        React.createElement("head", null,
            React.createElement("title", null, "BillShare")),
        React.createElement("body", null,
            children,
            React.createElement(react_toastify_1.ToastContainer, { position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true }))));
}
exports["default"] = RootLayout;
