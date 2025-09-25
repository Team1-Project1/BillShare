'use client';
"use strict";
exports.__esModule = true;
exports.FormRegister = void 0;
var react_1 = require("react");
var just_validate_1 = require("just-validate");
var navigation_1 = require("next/navigation");
var link_1 = require("next/link");
var fi_1 = require("react-icons/fi");
var react_toastify_1 = require("react-toastify");
exports.FormRegister = function () {
    var router = navigation_1.useRouter();
    var _a = react_1.useState(false), showPassword = _a[0], setShowPassword = _a[1];
    var _b = react_1.useState(false), showConfirmPassword = _b[0], setShowConfirmPassword = _b[1];
    react_1.useEffect(function () {
        var validator = new just_validate_1["default"]("#registerForm");
        validator
            .addField('#fullNname', [
            {
                rule: 'required',
                errorMessage: 'Vui lòng nhập tên người dùng!'
            },
            {
                rule: 'maxLength',
                value: 200,
                errorMessage: 'Tên người dùng không được vượt quá 200 ký tự!'
            },
        ])
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
            {
                validator: function (value) { return /[@$!%*?&]/.test(value); },
                errorMessage: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt!'
            },
        ])
            .addField('#confirmPassword', [
            {
                rule: 'required',
                errorMessage: 'Vui lòng nhập lại mật khẩu!'
            },
            {
                validator: function (value, fields) { return value === fields['#password'].elem.value; },
                errorMessage: 'Mật khẩu nhập lại không khớp!'
            },
        ])
            .onSuccess(function (event) {
            var form = event.target;
            var fullNname = form.fullNname.value;
            var phone = form.phone.value;
            var email = form.email.value;
            var password = form.password.value;
            var dataFinal = {
                fullNname: fullNname,
                phone: phone,
                email: email,
                password: password
            };
            fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/register", {
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
                    react_toastify_1.toast.success("Đăng ký thành công, vui lòng đăng nhập!", {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true
                    });
                    router.push("/login");
                }
            });
        });
    }, [router]); // Thêm router vào mảng phụ thuộc
    return (React.createElement("div", { className: "w-full max-w-[576px] mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-6 animate-in fade-in duration-500" },
        React.createElement("div", { className: "space-y-2 text-center pb-8" },
            React.createElement("div", { className: "mx-auto w-16 h-16 bg-[#5BC5A7] rounded-full flex items-center justify-center mb-4" },
                React.createElement(fi_1.FiUser, { className: "w-8 h-8 text-white" })),
            React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "T\u1EA1o t\u00E0i kho\u1EA3n m\u1EDBi"),
            React.createElement("p", { className: "text-base text-gray-600" }, "Tham gia BillShare \u0111\u1EC3 qu\u1EA3n l\u00FD chi ti\u00EAu d\u1EC5 d\u00E0ng")),
        React.createElement("form", { id: "registerForm", className: "space-y-5" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement("label", { htmlFor: "fullNname", className: "text-sm font-medium text-gray-700" }, "T\u00EAn ng\u01B0\u1EDDi d\u00F9ng"),
                React.createElement("input", { type: "text", name: "fullNname", id: "fullNname", placeholder: "Nh\u1EADp t\u00EAn ng\u01B0\u1EDDi d\u00F9ng", className: "h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement("label", { htmlFor: "phone", className: "text-sm font-medium text-gray-700" }, "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i"),
                React.createElement("input", { type: "text", name: "phone", id: "phone", placeholder: "Nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i", className: "h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement("label", { htmlFor: "email", className: "text-sm font-medium text-gray-700" }, "\u0110\u1ECBa ch\u1EC9 email"),
                React.createElement("input", { type: "email", name: "email", id: "email", placeholder: "example@email.com", className: "h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement("label", { htmlFor: "password", className: "text-sm font-medium text-gray-700" }, "M\u1EADt kh\u1EA9u"),
                React.createElement("div", { className: "relative" },
                    React.createElement("input", { type: showPassword ? 'text' : 'password', name: "password", id: "password", placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u c\u1EE7a b\u1EA1n", className: "h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" }),
                    React.createElement("button", { type: "button", onClick: function () { return setShowPassword(!showPassword); }, className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#4AA88C] transition-colors" }, showPassword ? React.createElement(fi_1.FiEyeOff, { size: 20 }) : React.createElement(fi_1.FiEye, { size: 20 })))),
            React.createElement("div", { className: "space-y-2" },
                React.createElement("label", { htmlFor: "confirmPassword", className: "text-sm font-medium text-gray-700" }, "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u"),
                React.createElement("div", { className: "relative" },
                    React.createElement("input", { type: showConfirmPassword ? 'text' : 'password', name: "confirmPassword", id: "confirmPassword", placeholder: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u", className: "h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" }),
                    React.createElement("button", { type: "button", onClick: function () { return setShowConfirmPassword(!showConfirmPassword); }, className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#4AA88C] transition-colors" }, showConfirmPassword ? React.createElement(fi_1.FiEyeOff, { size: 20 }) : React.createElement(fi_1.FiEye, { size: 20 })))),
            React.createElement("button", { type: "submit", className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300" }, "\u0110\u0103ng k\u00FD")),
        React.createElement("div", { className: "flex flex-col space-y-4 pt-6" },
            React.createElement("div", { className: "relative w-full" },
                React.createElement("div", { className: "absolute inset-0 flex items-center" },
                    React.createElement("span", { className: "w-full border-t border-gray-200" })),
                React.createElement("div", { className: "relative flex justify-center text-xs uppercase" },
                    React.createElement("span", { className: "bg-white/90 px-2 text-gray-600" }, "Ho\u1EB7c"))),
            React.createElement("div", { className: "text-center space-y-3" },
                React.createElement("p", { className: "text-sm text-gray-600" }, "\u0110\u00E3 c\u00F3 t\u00E0i kho\u1EA3n?"),
                React.createElement(link_1["default"], { href: "/login", className: "inline-flex items-center justify-center w-full h-12 text-base font-semibold text-[#5BC5A7] border border-[#5BC5A7] rounded-md hover:bg-[#5BC5A7]/10 hover:text-[#4AA88C] transition-colors duration-300" }, "\u0110\u0103ng nh\u1EADp")))));
};
