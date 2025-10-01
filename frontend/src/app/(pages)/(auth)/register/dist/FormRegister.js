'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.FormRegister = void 0;
var react_1 = require("react");
var just_validate_1 = require("just-validate");
var navigation_1 = require("next/navigation");
var link_1 = require("next/link");
var fi_1 = require("react-icons/fi");
var react_toastify_1 = require("react-toastify");
exports.FormRegister = function () {
    var router = navigation_1.useRouter(); // chuyển hướng trang mà không cần reload
    var _a = react_1.useState(false), showPassword = _a[0], setShowPassword = _a[1];
    var _b = react_1.useState(false), showConfirmPassword = _b[0], setShowConfirmPassword = _b[1];
    react_1.useEffect(function () {
        var validator = new just_validate_1["default"]("#registerForm");
        validator
            .addField('#fullName', [
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
            var fullName = form.fullName.value;
            var phone = form.phone.value;
            var email = form.email.value;
            var password = form.password.value;
            var dataFinal = {
                fullName: fullName,
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
                .then(function (res) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (res.status === 409) {
                        // Email trùng
                        react_toastify_1.toast.error("Email đã tồn tại trong hệ thống!", {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true
                        });
                        return [2 /*return*/, null]; // Dừng ở đây
                    }
                    // Với các status khác thì parse JSON
                    return [2 /*return*/, res.json()];
                });
            }); })
                .then(function (data) {
                if (!data)
                    return; // Nếu data là null (do lỗi 409), dừng ở đây
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
        // Cleanup: Hủy instance của JustValidate khi component unmount
        return function () {
            validator.destroy();
        };
    }, [router]); // Thêm router vào mảng phụ thuộc
    return (React.createElement("div", { className: "w-full max-w-[576px] mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-6 animate-in fade-in duration-500" },
        React.createElement("div", { className: "space-y-2 text-center pb-8" },
            React.createElement("div", { className: "mx-auto w-16 h-16 bg-[#5BC5A7] rounded-full flex items-center justify-center mb-4" },
                React.createElement(fi_1.FiUser, { className: "w-8 h-8 text-white" })),
            React.createElement("h2", { className: "text-2xl font-bold text-gray-900" }, "T\u1EA1o t\u00E0i kho\u1EA3n m\u1EDBi"),
            React.createElement("p", { className: "text-base text-gray-600" }, "Tham gia BillShare \u0111\u1EC3 qu\u1EA3n l\u00FD chi ti\u00EAu d\u1EC5 d\u00E0ng")),
        React.createElement("form", { id: "registerForm", className: "space-y-5" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement("label", { htmlFor: "fullName", className: "text-sm font-medium text-gray-700" }, "T\u00EAn ng\u01B0\u1EDDi d\u00F9ng"),
                React.createElement("input", { type: "text", name: "fullName", id: "fullName", placeholder: "Nh\u1EADp t\u00EAn ng\u01B0\u1EDDi d\u00F9ng", className: "h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" })),
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
