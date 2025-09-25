'use client';
"use strict";
exports.__esModule = true;
exports.FormLogin = void 0;
var react_1 = require("react");
var just_validate_1 = require("just-validate");
var navigation_1 = require("next/navigation");
var link_1 = require("next/link");
var fi_1 = require("react-icons/fi");
var react_toastify_1 = require("react-toastify");
exports.FormLogin = function () {
    var router = navigation_1.useRouter();
    var _a = react_1.useState(false), showPassword = _a[0], setShowPassword = _a[1];
    react_1.useEffect(function () {
        var validator = new just_validate_1["default"]("#loginForm");
        validator
            .addField('#email', [
            {
                rule: 'required',
                errorMessage: 'Vui lòng nhập email!'
            },
            {
                rule: 'email',
                errorMessage: 'Email không đúng định dạng!'
            },
        ])
            .addField('#password', [
            {
                rule: 'required',
                errorMessage: 'Vui lòng nhập mật khẩu!'
            },
            {
                validator: function (value) { return value.length >= 8; },
                errorMessage: 'Mật khẩu phải chứa ít nhất 8 ký tự!'
            },
            {
                validator: function (value) { return /[A-Z]/.test(value); },
                errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa!'
            },
            {
                validator: function (value) { return /[a-z]/.test(value); },
                errorMessage: 'Mật khẩu phải chứa ít nhất một chữ cái thường!'
            },
            {
                validator: function (value) { return /\d/.test(value); },
                errorMessage: 'Mật khẩu phải chứa ít nhất một chữ số!'
            },
        ])
            .onSuccess(function (event) {
            var form = event.target;
            var email = form.email.value;
            var password = form.password.value;
            var dataFinal = {
                email: email,
                password: password
            };
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataFinal)
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                if (data.code === "error") {
                    react_toastify_1.toast.error(data.message, {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true
                    });
                }
                if (data.code === "success") {
                    react_toastify_1.toast.success("Đăng nhập thành công!", {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true
                    });
                    // Lưu token vào localStorage
                    localStorage.setItem("accessToken", data.data.accesstToken);
                    localStorage.setItem("refreshToken", data.data.refreshtToken);
                    localStorage.setItem("userId", data.data.userId);
                    // Chuyển trang về home
                    router.push("/");
                }
            });
        });
    }, [router]); // Thêm router vào mảng phụ thuộc
    return (React.createElement("div", { className: "w-full max-w-[576px] mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-6 animate-in fade-in duration-500" },
        React.createElement("div", { className: "space-y-2 text-center pb-8" },
            React.createElement("div", { className: "mx-auto w-16 h-16 bg-[#5BC5A7] rounded-full flex items-center justify-center mb-4" },
                React.createElement(fi_1.FiUser, { className: "w-8 h-8 text-white" })),
            React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "Ch\u00E0o m\u1EEBng tr\u1EDF l\u1EA1i"),
            React.createElement("p", { className: "text-base text-gray-600" }, "\u0110\u0103ng nh\u1EADp v\u00E0o t\u00E0i kho\u1EA3n BillShare c\u1EE7a b\u1EA1n")),
        React.createElement("form", { id: "loginForm", className: "space-y-5" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement("label", { htmlFor: "email", className: "text-sm font-medium text-gray-700" }, "\u0110\u1ECBa ch\u1EC9 email"),
                React.createElement("input", { type: "email", name: "email", id: "email", placeholder: "example@email.com", className: "h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement("label", { htmlFor: "password", className: "text-sm font-medium text-gray-700" }, "M\u1EADt kh\u1EA9u"),
                React.createElement("div", { className: "relative" },
                    React.createElement("input", { type: showPassword ? 'text' : 'password', name: "password", id: "password", placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u c\u1EE7a b\u1EA1n", className: "h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" }),
                    React.createElement("button", { type: "button", onClick: function () { return setShowPassword(!showPassword); }, className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#4AA88C] transition-colors" }, showPassword ? React.createElement(fi_1.FiEyeOff, { size: 20 }) : React.createElement(fi_1.FiEye, { size: 20 })))),
            React.createElement("div", { className: "flex items-center justify-end" },
                React.createElement(link_1["default"], { href: "/forgot-password", className: "text-sm text-[#5BC5A7] hover:text-[#4AA88C] transition-colors" }, "Qu\u00EAn m\u1EADt kh\u1EA9u?")),
            React.createElement("button", { type: "submit", className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold cursor-pointer hover:bg-[#4AA88C] transition-colors duration-300" }, "\u0110\u0103ng nh\u1EADp")),
        React.createElement("div", { className: "flex flex-col space-y-4 pt-6" },
            React.createElement("div", { className: "relative w-full" },
                React.createElement("div", { className: "absolute inset-0 flex items-center" },
                    React.createElement("span", { className: "w-full border-t border-gray-200" })),
                React.createElement("div", { className: "relative flex justify-center text-xs uppercase" },
                    React.createElement("span", { className: "bg-white/90 px-2 text-gray-600" }, "Ho\u1EB7c"))),
            React.createElement("div", { className: "text-center space-y-3" },
                React.createElement("p", { className: "text-sm text-gray-600" }, "Ch\u01B0a c\u00F3 t\u00E0i kho\u1EA3n?"),
                React.createElement(link_1["default"], { href: "/register", className: "inline-flex items-center justify-center w-full h-12 text-base font-semibold text-[#5BC5A7] border border-[#5BC5A7] rounded-md hover:bg-[#5BC5A7]/10 hover:text-[#4AA88C] transition-colors duration-300" }, "T\u1EA1o t\u00E0i kho\u1EA3n m\u1EDBi")))));
};
