"use strict";
exports.__esModule = true;
exports.metadata = void 0;
require("./globals.css");
var react_toastify_1 = require("react-toastify"); // Thêm import react-toastify
require("react-toastify/dist/ReactToastify.css"); // Thêm import CSS của react-toastify
exports.metadata = {
    title: "BillShare",
    description: "Trang web hỗ trợ chia hóa đơn"
};
function RootLayout(_a) {
    var children = _a.children;
    return (React.createElement("html", { lang: "vi", suppressHydrationWarning: true },
        React.createElement("body", null,
            children,
            React.createElement(react_toastify_1.ToastContainer, { position: "top-right", autoClose: 3000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true }))));
}
exports["default"] = RootLayout;
