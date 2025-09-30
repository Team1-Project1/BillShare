"use strict";
exports.__esModule = true;
exports.metadata = void 0;
var FormRegister_1 = require("./FormRegister");
exports.metadata = {
    title: "Đăng ký",
    description: "Mô tả trang đăng ký của BillShare..."
};
function BillShareRegisterPage() {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4" },
            React.createElement("div", { className: "w-full max-w-[576px] mx-auto" },
                React.createElement(FormRegister_1.FormRegister, null)))));
}
exports["default"] = BillShareRegisterPage;
