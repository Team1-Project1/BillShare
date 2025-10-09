"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var react_toastify_1 = require("react-toastify");
var fetchWithAuth_1 = require("@/lib/fetchWithAuth");
var currencies_1 = require("@/config/currencies");
var categories_1 = require("@/config/categories");
var CardMemberSelect_1 = require("../card/CardMemberSelect");
var fi_1 = require("react-icons/fi");
var react_datepicker_1 = require("react-datepicker");
require("react-datepicker/dist/react-datepicker.css");
var locale_1 = require("date-fns/locale");
var date_fns_1 = require("date-fns");
function ModalAddExpense(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, onSuccess = _a.onSuccess, userId = _a.userId, groupId = _a.groupId, members = _a.members;
    var modalRef = react_1.useRef(null);
    var _b = react_1.useState(""), expenseName = _b[0], setExpenseName = _b[1];
    var _c = react_1.useState(0), totalAmount = _c[0], setTotalAmount = _c[1];
    var _d = react_1.useState("VND"), currency = _d[0], setCurrency = _d[1];
    var _e = react_1.useState(1), categoryId = _e[0], setCategoryId = _e[1];
    var _f = react_1.useState(new Date()), expenseDate = _f[0], setExpenseDate = _f[1];
    var _g = react_1.useState(""), description = _g[0], setDescription = _g[1];
    var _h = react_1.useState(""), payerId = _h[0], setPayerId = _h[1];
    var _j = react_1.useState([]), selectedParticipants = _j[0], setSelectedParticipants = _j[1];
    var _k = react_1.useState({ apiValue: "equal", displayName: "equal" }), splitMethod = _k[0], setSplitMethod = _k[1];
    var _l = react_1.useState({}), participantShares = _l[0], setParticipantShares = _l[1];
    var _m = react_1.useState(false), loading = _m[0], setLoading = _m[1];
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
    react_1.useEffect(function () {
        if (!isOpen) {
            // Reset toàn bộ form khi modal đóng
            setExpenseName("");
            setTotalAmount(0);
            setCurrency("VND");
            setCategoryId(1);
            setExpenseDate(new Date());
            setDescription("");
            setPayerId("");
            setSelectedParticipants([]);
            setSplitMethod({ apiValue: "equal", displayName: "equal" });
            setParticipantShares({});
            setLoading(false);
        }
    }, [isOpen]);
    react_1.useEffect(function () {
        setParticipantShares({});
    }, [selectedParticipants, splitMethod]);
    if (!isOpen)
        return null;
    var handleSelectParticipant = function (userId) {
        setSelectedParticipants(function (prev) {
            return prev.includes(userId)
                ? prev.filter(function (id) { return id !== userId; })
                : __spreadArrays(prev, [userId]);
        });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var participants, allMemberIds, share_1, share_2, totalPercent_1, totalCustom_1, res, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!expenseName.trim()) {
                        react_toastify_1.toast.error("Tên khoản chi không được để trống!", {
                            position: "top-center"
                        });
                        return [2 /*return*/];
                    }
                    if (!totalAmount || totalAmount <= 0) {
                        react_toastify_1.toast.error("Số tiền phải lớn hơn 0!", { position: "top-center" });
                        return [2 /*return*/];
                    }
                    if (!payerId) {
                        react_toastify_1.toast.error("Vui lòng chọn người chi trả!", { position: "top-center" });
                        return [2 /*return*/];
                    }
                    participants = [];
                    if (selectedParticipants.length === 1) {
                        participants = [{ userId: selectedParticipants[0], shareAmount: totalAmount }];
                    }
                    else if (selectedParticipants.length === 0) {
                        allMemberIds = members.map(function (m) { return m.id; });
                        share_1 = totalAmount / allMemberIds.length;
                        participants = allMemberIds.map(function (id) { return ({ userId: id, shareAmount: share_1 }); });
                    }
                    else if (selectedParticipants.length >= 2) {
                        if (splitMethod.displayName === "equal") {
                            share_2 = totalAmount / selectedParticipants.length;
                            participants = selectedParticipants.map(function (id) { return ({
                                userId: id,
                                shareAmount: share_2
                            }); });
                        }
                        else if (splitMethod.displayName === "percent") {
                            totalPercent_1 = 0;
                            participants = selectedParticipants.map(function (id) {
                                var percent = participantShares[id] || 0;
                                totalPercent_1 += percent;
                                return { userId: id, shareAmount: (percent / 100) * totalAmount };
                            });
                            if (totalPercent_1 !== 100) {
                                react_toastify_1.toast.error("Tổng phần trăm phải bằng 100%", { position: "top-center" });
                                return [2 /*return*/];
                            }
                        }
                        else if (splitMethod.displayName === "custom") {
                            totalCustom_1 = 0;
                            participants = selectedParticipants.map(function (id) {
                                var amount = participantShares[id] || 0;
                                totalCustom_1 += amount;
                                return { userId: id, shareAmount: amount };
                            });
                            if (totalCustom_1 !== totalAmount) {
                                react_toastify_1.toast.error("Tổng số tiền chia không khớp với tổng chi tiêu!", { position: "top-center" });
                                return [2 /*return*/];
                            }
                        }
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    setLoading(true);
                    return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/api/groups/" + groupId + "/expenses", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "*/*",
                                "userId": userId.toString()
                            },
                            body: JSON.stringify({
                                groupId: groupId,
                                expenseName: expenseName,
                                totalAmount: totalAmount,
                                currency: currency,
                                categoryId: categoryId,
                                expenseDate: expenseDate ? date_fns_1.set(expenseDate, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString() : null,
                                description: description,
                                payerId: payerId,
                                splitMethod: splitMethod.apiValue,
                                participants: participants
                            })
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (res.ok && data.code === "success") {
                        react_toastify_1.toast.success("Thêm khoản chi thành công!", { position: "top-center" });
                        if (onSuccess)
                            onSuccess();
                        onClose();
                    }
                    else {
                        react_toastify_1.toast.error(data.message || "Không thể thêm khoản chi!", {
                            position: "top-center"
                        });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error("Error adding expense:", err_1);
                    react_toastify_1.toast.error("Lỗi khi thêm khoản chi!", { position: "top-center" });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center" },
        React.createElement("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300", onClick: onClose }),
        React.createElement("div", { ref: modalRef, className: "relative bg-white w-full max-w-[500px] shadow-xl border border-gray-200 z-10 flex flex-col max-h-[90vh]" },
            React.createElement("div", { className: "p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-20" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "Th\u00EAm kho\u1EA3n chi"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" },
                    React.createElement(fi_1.FiX, { size: 20 }))),
            React.createElement("form", { onSubmit: handleSubmit, className: "flex-1 overflow-y-auto p-4 space-y-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "T\u00EAn kho\u1EA3n chi *"),
                    React.createElement("div", { className: "flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-1 focus-within:ring-[#5BC5A7] transition-all" },
                        React.createElement(fi_1.FiFileText, { className: "text-gray-500 mr-2" }),
                        React.createElement("input", { type: "text", value: expenseName, onChange: function (e) { return setExpenseName(e.target.value); }, placeholder: "Nh\u1EADp t\u00EAn kho\u1EA3n chi...", className: "w-full outline-none text-gray-800 bg-transparent" }))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "S\u1ED1 ti\u1EC1n *"),
                    React.createElement("div", { className: "flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-1 focus-within:ring-[#5BC5A7] transition-all" },
                        React.createElement(fi_1.FiDollarSign, { className: "text-gray-500 mr-2" }),
                        React.createElement("input", { type: "number", value: totalAmount, onChange: function (e) { return setTotalAmount(Number(e.target.value)); }, placeholder: "Nh\u1EADp s\u1ED1 ti\u1EC1n...", className: "w-full outline-none text-gray-800 bg-transparent\r\n                    [&::-webkit-inner-spin-button]:appearance-none \r\n                    [&::-webkit-outer-spin-button]:appearance-none \r\n                    [appearance:textfield]" }))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "\u0110\u01A1n v\u1ECB ti\u1EC1n t\u1EC7"),
                    React.createElement("select", { value: currency, onChange: function (e) { return setCurrency(e.target.value); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]" }, currencies_1.currencies.map(function (currency) { return (React.createElement("option", { key: currency.code, value: currency.code },
                        currency.code,
                        " - ",
                        currency.name)); }))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Danh m\u1EE5c"),
                    React.createElement("select", { value: categoryId, onChange: function (e) { return setCategoryId(Number(e.target.value)); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]" }, categories_1.categories.map(function (cat) { return (React.createElement("option", { key: cat.category_id, value: cat.category_id },
                        cat.icon,
                        " ",
                        cat.category_name)); }))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Ng\u00E0y chi ti\u00EAu"),
                    React.createElement("div", { className: "relative" },
                        React.createElement(react_datepicker_1["default"], { selected: expenseDate, onChange: function (date) { return setExpenseDate(date); }, dateFormat: "dd/MM/yyyy", locale: locale_1.vi, className: "w-full border border-gray-300 rounded-md p-2 pl-10 text-gray-800 focus:ring-1 focus:ring-[#5BC5A7]", placeholderText: "Ch\u1ECDn ng\u00E0y..." }),
                        React.createElement(fi_1.FiCalendar, { className: "absolute left-3 top-3 text-gray-500 pointer-events-none" }))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "M\u00F4 t\u1EA3"),
                    React.createElement("textarea", { value: description, onChange: function (e) { return setDescription(e.target.value); }, placeholder: "Nh\u1EADp m\u00F4 t\u1EA3 chi ti\u00EAu...", className: "w-full border border-gray-300 rounded-md p-2 text-gray-800 h-20 resize-none focus:ring-1 focus:ring-[#5BC5A7]" })),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Ng\u01B0\u1EDDi chi tr\u1EA3 *"),
                    React.createElement("div", { className: "flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-1 focus-within:ring-[#5BC5A7] transition-all" },
                        React.createElement(fi_1.FiUser, { className: "text-gray-500 mr-2" }),
                        React.createElement("select", { value: payerId, onChange: function (e) { return setPayerId(Number(e.target.value)); }, className: "w-full text-gray-800 outline-none bg-transparent" },
                            React.createElement("option", { value: "" }, "-- Ch\u1ECDn ng\u01B0\u1EDDi chi tr\u1EA3 --"),
                            members.map(function (member) { return (React.createElement("option", { key: member.id, value: member.id }, member.name)); })))),
                React.createElement("div", null,
                    React.createElement("h3", { className: "text-sm font-medium text-gray-700 mb-2 flex items-center" }, "Ng\u01B0\u1EDDi chia ti\u1EC1n"),
                    React.createElement("div", { className: "space-y-2 rounded-md border border-gray-200 p-2 bg-white/70" }, members.map(function (member) { return (React.createElement(CardMemberSelect_1["default"], { key: member.id, avatar: member.avatar, name: member.name, email: "", selected: selectedParticipants.includes(member.id), onSelect: function () { return handleSelectParticipant(member.id); } })); })),
                    selectedParticipants.length === 0 && (React.createElement("p", { className: "text-xs text-gray-500 italic mt-1" }, "*Ch\u01B0a ch\u1ECDn ai, h\u00F3a \u0111\u01A1n s\u1EBD m\u1EB7c \u0111\u1ECBnh chia \u0111\u1EC1u cho t\u1EA5t c\u1EA3 th\u00E0nh vi\u00EAn."))),
                selectedParticipants.length >= 2 && (React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "C\u00E1ch chia ti\u1EC1n"),
                    React.createElement("select", { value: splitMethod.displayName, onChange: function (e) { return setSplitMethod(e.target.value === "equal" ? { apiValue: "equal", displayName: "equal" }
                            : e.target.value === "percent"
                                ? { apiValue: "custom", displayName: "percent" }
                                : { apiValue: "custom", displayName: "custom" }); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]" },
                        React.createElement("option", { value: "equal" }, "Chia \u0111\u1EC1u"),
                        React.createElement("option", { value: "percent" }, "Chia theo ph\u1EA7n tr\u0103m"),
                        React.createElement("option", { value: "custom" }, "T\u00F9y ch\u1EC9nh")),
                    (splitMethod.displayName === "percent" || splitMethod.displayName === "custom") && (React.createElement("div", { className: "mt-3 space-y-3 border border-gray-200 rounded-md p-3 bg-gray-50" },
                        React.createElement("h4", { className: "text-sm font-medium text-gray-700 mb-2" },
                            "Nh\u1EADp ",
                            splitMethod.displayName === "percent" ? "phần trăm" : "số tiền",
                            " cho t\u1EEBng ng\u01B0\u1EDDi:"),
                        selectedParticipants.map(function (id) {
                            var _a;
                            var member = members.find(function (m) { return m.id === id; });
                            if (!member)
                                return null;
                            return (React.createElement("div", { key: id, className: "flex items-center justify-between border-b border-gray-100 pb-2" },
                                React.createElement("span", { className: "text-gray-800" }, member.name),
                                React.createElement("input", { type: "number", value: (_a = participantShares[id]) !== null && _a !== void 0 ? _a : "", onChange: function (e) {
                                        return setParticipantShares(function (prev) {
                                            var _a;
                                            return (__assign(__assign({}, prev), (_a = {}, _a[id] = Number(e.target.value), _a)));
                                        });
                                    }, placeholder: splitMethod.displayName === "percent" ? "% chia" : "Số tiền", className: "w-28 border border-gray-300 rounded-md p-1 text-right text-gray-700 outline-none" })));
                        })))))),
            React.createElement("div", { className: "p-4 border-t border-gray-200 bg-white sticky bottom-0 z-20" },
                React.createElement("button", { onClick: handleSubmit, disabled: loading, className: "w-full h-12 rounded-md text-white font-semibold transition-colors duration-300 " + (loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#5BC5A7] hover:bg-[#4AA88C]") }, loading ? "Đang thêm..." : "Thêm khoản chi")))));
}
exports["default"] = ModalAddExpense;
