"use client";
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
exports.SearchBar = void 0;
var react_1 = require("react");
var fi_1 = require("react-icons/fi");
var framer_motion_1 = require("framer-motion");
var react_datepicker_1 = require("react-datepicker");
require("react-datepicker/dist/react-datepicker.css");
var react_toastify_1 = require("react-toastify");
var navigation_1 = require("next/navigation");
var categories_1 = require("@/config/categories");
exports.SearchBar = function (_a) {
    var groupId = _a.groupId, members = _a.members, _b = _a.isSearchOpen, isSearchOpen = _b === void 0 ? false : _b;
    var _c = react_1.useState(isSearchOpen), isOpen = _c[0], setIsOpen = _c[1]; // Sử dụng prop isSearchOpen làm giá trị ban đầu
    var _d = react_1.useState(null), categoryId = _d[0], setCategoryId = _d[1];
    var _e = react_1.useState(""), expenseName = _e[0], setExpenseName = _e[1];
    var _f = react_1.useState(null), startDate = _f[0], setStartDate = _f[1];
    var _g = react_1.useState(null), endDate = _g[0], setEndDate = _g[1];
    var router = navigation_1.useRouter();
    // Kiểm tra userId có trong nhóm
    var userId = Number(localStorage.getItem("userId"));
    react_1.useEffect(function () {
        if (!userId || !members.some(function (member) { return member.id === userId; })) {
            react_toastify_1.toast.error("Bạn không phải là thành viên của nhóm này!", {
                position: "top-center",
                autoClose: 2000
            });
            setIsOpen(false);
        }
    }, [userId, members]);
    var handleSearch = function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryParams;
        return __generator(this, function (_a) {
            if (!userId || !members.some(function (member) { return member.id === userId; })) {
                react_toastify_1.toast.error("Bạn không có quyền tìm kiếm trong nhóm này!", {
                    position: "top-center",
                    autoClose: 2000
                });
                return [2 /*return*/];
            }
            queryParams = new URLSearchParams();
            if (categoryId)
                queryParams.append("categoryId", categoryId.toString());
            if (expenseName)
                queryParams.append("expenseName", expenseName);
            if (startDate)
                queryParams.append("expenseDateFrom", startDate.toISOString().split("T")[0]);
            if (endDate)
                queryParams.append("expenseDateTo", endDate.toISOString().split("T")[0]);
            // Chuyển hướng đến trang kết quả tìm kiếm
            router.push("/group/detail/" + groupId + "/search?" + queryParams.toString());
            return [2 /*return*/];
        });
    }); };
    return (React.createElement("div", { className: "w-full bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md" },
        React.createElement("button", { onClick: function () { return setIsOpen(!isOpen); }, className: "w-10 h-10 bg-[#5BC5A7] text-white rounded-full flex items-center justify-center hover:bg-[#4AA88C] transition-colors duration-300" },
            React.createElement(fi_1.FiSearch, { size: 20 })),
        React.createElement(framer_motion_1.AnimatePresence, null, isOpen && (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, className: "mt-2 space-y-3" },
            React.createElement("div", null,
                React.createElement("label", { className: "text-sm font-medium text-gray-700" }, "Danh m\u1EE5c"),
                React.createElement("select", { value: categoryId || "", onChange: function (e) {
                        return setCategoryId(e.target.value ? Number(e.target.value) : null);
                    }, className: "w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" },
                    React.createElement("option", { value: "" }, "T\u1EA5t c\u1EA3 danh m\u1EE5c"),
                    categories_1.categories.map(function (category) { return (React.createElement("option", { key: category.category_id, value: category.category_id },
                        category.icon,
                        " ",
                        category.category_name)); }))),
            React.createElement("div", null,
                React.createElement("label", { className: "text-sm font-medium text-gray-700" }, "T\u00EAn kho\u1EA3n chi"),
                React.createElement("input", { type: "text", value: expenseName, onChange: function (e) { return setExpenseName(e.target.value); }, placeholder: "Nh\u1EADp t\u00EAn kho\u1EA3n chi...", className: "w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" })),
            React.createElement("div", { className: "flex space-x-3" },
                React.createElement("div", { className: "flex-1" },
                    React.createElement("label", { className: "text-sm font-medium text-gray-700" }, "T\u1EEB ng\u00E0y"),
                    React.createElement(react_datepicker_1["default"], { selected: startDate, onChange: function (date) { return setStartDate(date); }, dateFormat: "dd/MM/yyyy", placeholderText: "Ch\u1ECDn ng\u00E0y b\u1EAFt \u0111\u1EA7u", className: "w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" })),
                React.createElement("div", { className: "flex-1" },
                    React.createElement("label", { className: "text-sm font-medium text-gray-700" }, "\u0110\u1EBFn ng\u00E0y"),
                    React.createElement(react_datepicker_1["default"], { selected: endDate, onChange: function (date) { return setEndDate(date); }, dateFormat: "dd/MM/yyyy", placeholderText: "Ch\u1ECDn ng\u00E0y k\u1EBFt th\u00FAc", className: "w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-[#5BC5A7] transition-all duration-300" }))),
            React.createElement("button", { onClick: handleSearch, className: "w-full h-10 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center" }, "T\u00ECm ki\u1EBFm"))))));
};
