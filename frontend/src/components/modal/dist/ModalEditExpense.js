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
var fi_1 = require("react-icons/fi");
var fetchWithAuth_1 = require("@/lib/fetchWithAuth");
var CardMemberSelect_1 = require("@/components/card/CardMemberSelect");
var categories_1 = require("@/config/categories");
function ModalEditExpense(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, onSuccess = _a.onSuccess, expenseDetail = _a.expenseDetail, groupId = _a.groupId, userId = _a.userId, members = _a.members, currency = _a.currency;
    var modalRef = react_1.useRef(null);
    var _b = react_1.useState({
        expenseName: "",
        totalAmount: 0,
        categoryId: 0,
        expenseDate: "",
        description: "",
        payerId: 0,
        splitMethod: "equal",
        participants: []
    }), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState(false), isLoading = _c[0], setIsLoading = _c[1];
    react_1.useEffect(function () {
        if (expenseDetail) {
            var prefilledParticipants = expenseDetail.participants.map(function (p) { return ({
                userId: p.userId,
                shareAmount: p.shareAmount,
                sharePercentage: expenseDetail.splitMethod === "percentage"
                    ? Math.round((p.shareAmount / expenseDetail.totalAmount) * 100 * 100) / 100
                    : undefined
            }); });
            setFormData({
                expenseName: expenseDetail.expenseName,
                totalAmount: expenseDetail.totalAmount,
                categoryId: expenseDetail.categoryId,
                expenseDate: new Date(expenseDetail.expenseDate)
                    .toISOString()
                    .slice(0, 16),
                description: expenseDetail.description || "",
                payerId: expenseDetail.payerUserId,
                splitMethod: expenseDetail.splitMethod,
                participants: prefilledParticipants
            });
        }
    }, [expenseDetail]);
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
    var updateFormData = function (updates) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), updates)); });
    };
    var isCustom = formData.splitMethod === "custom";
    var isPercentage = formData.splitMethod === "percentage";
    var recalculateShares = function () {
        if (formData.participants.length === 0)
            return;
        var newParticipants = __spreadArrays(formData.participants);
        if (formData.splitMethod === "equal") {
            var participantCount = formData.participants.length;
            var floorShare_1 = Math.floor(formData.totalAmount / participantCount);
            var remainder_1 = formData.totalAmount - floorShare_1 * participantCount;
            newParticipants = newParticipants.map(function (p, index) { return (__assign(__assign({}, p), { shareAmount: floorShare_1 + (index < remainder_1 ? 1 : 0), sharePercentage: undefined })); });
        }
        else if (formData.splitMethod === "percentage") {
            var totalPercentage = newParticipants.reduce(function (sum, p) { return sum + (p.sharePercentage || 0); }, 0);
            if (totalPercentage === 0) {
                newParticipants = newParticipants.map(function (p) { return (__assign(__assign({}, p), { shareAmount: 0, sharePercentage: 0 })); });
            }
            else {
                // Tính shareAmount cơ bản
                newParticipants = newParticipants.map(function (p) { return (__assign(__assign({}, p), { shareAmount: (p.sharePercentage / 100) * formData.totalAmount })); });
                // Làm tròn và phân phối phần dư
                var floorShares_1 = newParticipants.map(function (p) { return Math.floor(p.shareAmount); });
                var currentTotal = floorShares_1.reduce(function (sum, amount) { return sum + amount; }, 0);
                var remainder_2 = Math.round(formData.totalAmount) - currentTotal;
                newParticipants = newParticipants.map(function (p, index) { return (__assign(__assign({}, p), { shareAmount: floorShares_1[index] + (index < remainder_2 ? 1 : 0) })); });
            }
        }
        updateFormData({ participants: newParticipants });
    };
    react_1.useEffect(function () {
        recalculateShares();
    }, [formData.totalAmount, formData.participants.length, formData.splitMethod]);
    var handleInputChange = function (e) {
        var _a;
        var _b = e.target, name = _b.name, value = _b.value;
        var updates = (_a = {}, _a[name] = value, _a);
        if (name === "totalAmount") {
            updates.totalAmount = Number(value);
        }
        else if (name === "categoryId" || name === "payerId") {
            updates[name] = Number(value);
        }
        else if (name === "splitMethod") {
            updates.splitMethod = value;
            updates.participants = formData.participants.map(function (p) { return (__assign(__assign({}, p), { sharePercentage: updates.splitMethod === "percentage" ? 0 : undefined })); });
        }
        updateFormData(updates);
    };
    var handleSplitMethodChange = function (e) {
        var value = e.target.value;
        updateFormData({
            splitMethod: value,
            participants: formData.participants.map(function (p) { return (__assign(__assign({}, p), { sharePercentage: value === "percentage" ? 0 : undefined })); })
        });
    };
    var handleParticipantToggle = function (userId) {
        var newParticipants = __spreadArrays(formData.participants);
        if (newParticipants.find(function (p) { return p.userId === userId; })) {
            newParticipants = newParticipants.filter(function (p) { return p.userId !== userId; });
        }
        else {
            newParticipants.push({
                userId: userId,
                shareAmount: 0,
                sharePercentage: formData.splitMethod === "percentage" ? 0 : undefined
            });
        }
        updateFormData({ participants: newParticipants });
    };
    var handleParticipantChange = function (userId, value, field) {
        var newParticipants = formData.participants.map(function (p) {
            var _a;
            return p.userId === userId
                ? __assign(__assign(__assign({}, p), (_a = {}, _a[field === "amount" ? "shareAmount" : "sharePercentage"] = value, _a)), (field === "percentage" && {
                    shareAmount: (value / 100) * formData.totalAmount
                })) : p;
        });
        updateFormData({ participants: newParticipants });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var totalShare, totalAmount, totalPercentage, response, errorData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    // Kiểm tra dữ liệu
                    if (formData.participants.length === 0) {
                        react_toastify_1.toast.error("Vui lòng chọn ít nhất một thành viên tham gia!", {
                            position: "top-center",
                            autoClose: 2000
                        });
                        return [2 /*return*/];
                    }
                    if (!categories_1.categories.some(function (cat) { return cat.category_id === formData.categoryId; })) {
                        react_toastify_1.toast.error("Danh mục không hợp lệ!", {
                            position: "top-center",
                            autoClose: 2000
                        });
                        return [2 /*return*/];
                    }
                    if (!members.some(function (member) { return member.id === formData.payerId; })) {
                        react_toastify_1.toast.error("Người thanh toán không hợp lệ!", {
                            position: "top-center",
                            autoClose: 2000
                        });
                        return [2 /*return*/];
                    }
                    totalShare = formData.participants.reduce(function (sum, p) { return sum + p.shareAmount; }, 0);
                    totalAmount = formData.totalAmount;
                    if (formData.splitMethod === "custom") {
                        if (totalShare !== totalAmount) {
                            react_toastify_1.toast.error("T\u1ED5ng s\u1ED1 ti\u1EC1n chia (" + totalShare.toLocaleString() + " " + currency + ") kh\u00F4ng kh\u1EDBp v\u1EDBi t\u1ED5ng s\u1ED1 ti\u1EC1n (" + totalAmount.toLocaleString() + " " + currency + ")!", {
                                position: "top-center",
                                autoClose: 3000
                            });
                            return [2 /*return*/];
                        }
                    }
                    if (formData.splitMethod === "percentage") {
                        totalPercentage = formData.participants.reduce(function (sum, p) { return sum + (p.sharePercentage || 0); }, 0);
                        if (Math.abs(totalPercentage - 100) > 0.01) {
                            react_toastify_1.toast.error("Tổng phần trăm phải bằng 100%!", {
                                position: "top-center",
                                autoClose: 2000
                            });
                            return [2 /*return*/];
                        }
                        if (totalShare !== totalAmount) {
                            react_toastify_1.toast.error("T\u1ED5ng s\u1ED1 ti\u1EC1n chia (" + totalShare.toLocaleString() + " " + currency + ") kh\u00F4ng kh\u1EDBp v\u1EDBi t\u1ED5ng s\u1ED1 ti\u1EC1n (" + totalAmount.toLocaleString() + " " + currency + ")!", {
                                position: "top-center",
                                autoClose: 3000
                            });
                            return [2 /*return*/];
                        }
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/api/groups/" + groupId + "/expenses/" + (expenseDetail === null || expenseDetail === void 0 ? void 0 : expenseDetail.expenseId), {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "*/*",
                                userId: userId.toString()
                            },
                            body: JSON.stringify(__assign(__assign({}, formData), { totalAmount: Number(formData.totalAmount), categoryId: Number(formData.categoryId), payerId: Number(formData.payerId), participants: formData.participants.map(function (_a) {
                                    var userId = _a.userId, shareAmount = _a.shareAmount;
                                    return ({
                                        userId: userId,
                                        shareAmount: shareAmount
                                    });
                                }) }))
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || "Không thể cập nhật khoản chi");
                case 4:
                    react_toastify_1.toast.success("Cập nhật khoản chi thành công!", {
                        position: "top-center",
                        autoClose: 2000
                    });
                    onSuccess();
                    onClose();
                    return [3 /*break*/, 7];
                case 5:
                    err_1 = _a.sent();
                    console.error("Update error:", err_1);
                    react_toastify_1.toast.error(err_1.message || "Không thể cập nhật khoản chi!", {
                        position: "top-center",
                        autoClose: 2000
                    });
                    return [3 /*break*/, 7];
                case 6:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen || !expenseDetail)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50 rounded-lg" },
        React.createElement("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300", onClick: onClose }),
        React.createElement("div", { ref: modalRef, className: "bg-white/90 backdrop-blur-md rounded-lg p-6 w-full max-w-[500px] shadow-xl border border-gray-200 overflow-y-auto max-h-[80vh]", style: {
                transform: isOpen ? "scale(1)" : "scale(0.7)",
                opacity: isOpen ? 1 : 0,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out"
            } },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900 flex-1 text-center" }, "C\u1EADp nh\u1EADt kho\u1EA3n chi"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" },
                    React.createElement(fi_1.FiX, { size: 20 }))),
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-semibold text-[#5BC5A7]" }, "T\u00EAn kho\u1EA3n chi"),
                    React.createElement("input", { type: "text", name: "expenseName", value: formData.expenseName, onChange: handleInputChange, className: "w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]", required: true })),
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-semibold text-[#5BC5A7]" }, "T\u1ED5ng s\u1ED1 ti\u1EC1n"),
                    React.createElement("input", { type: "number", name: "totalAmount", value: formData.totalAmount, onChange: handleInputChange, className: "w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]", required: true })),
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Danh m\u1EE5c"),
                    React.createElement("select", { name: "categoryId", value: formData.categoryId, onChange: handleInputChange, className: "w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]", required: true }, categories_1.categories.map(function (cat) { return (React.createElement("option", { key: cat.category_id, value: cat.category_id },
                        cat.icon,
                        " ",
                        cat.category_name)); }))),
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Ng\u00E0y chi"),
                    React.createElement("input", { type: "datetime-local", name: "expenseDate", value: formData.expenseDate, onChange: handleInputChange, className: "w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]", required: true })),
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-semibold text-[#5BC5A7]" }, "M\u00F4 t\u1EA3"),
                    React.createElement("textarea", { name: "description", value: formData.description, onChange: handleInputChange, className: "w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]" })),
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Ng\u01B0\u1EDDi thanh to\u00E1n"),
                    React.createElement("select", { name: "payerId", value: formData.payerId, onChange: handleInputChange, className: "w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]", required: true }, members.map(function (member) { return (React.createElement("option", { key: member.id, value: member.id }, member.name)); }))),
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Ph\u01B0\u01A1ng th\u1EE9c chia"),
                    React.createElement("select", { name: "splitMethod", value: formData.splitMethod, onChange: handleSplitMethodChange, className: "w-full p-2 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]", required: true },
                        React.createElement("option", { value: "equal" }, "Chia \u0111\u1EC1u"),
                        React.createElement("option", { value: "custom" }, "T\u00F9y ch\u1EC9nh"),
                        React.createElement("option", { value: "percentage" }, "Chia theo %"))),
                React.createElement("div", null,
                    React.createElement("label", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Th\u00E0nh vi\u00EAn tham gia"),
                    React.createElement("div", { className: "space-y-2" }, members.map(function (member) {
                        var isSelected = formData.participants.some(function (p) { return p.userId === member.id; });
                        var participant = formData.participants.find(function (p) { return p.userId === member.id; });
                        return (React.createElement("div", { key: member.id, className: "flex flex-col space-y-1" },
                            React.createElement(CardMemberSelect_1["default"], { avatar: member.avatar, name: member.name, email: member.email, selected: isSelected, onSelect: function () { return handleParticipantToggle(member.id); } }),
                            isSelected && isCustom && (React.createElement("div", { className: "ml-14 flex items-center gap-2" },
                                React.createElement("label", { className: "text-sm text-gray-600" }, "S\u1ED1 ti\u1EC1n:"),
                                React.createElement("input", { type: "number", value: (participant === null || participant === void 0 ? void 0 : participant.shareAmount) || 0, onChange: function (e) {
                                        return handleParticipantChange(member.id, Number(e.target.value), "amount");
                                    }, className: "w-24 p-1 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]", placeholder: "S\u1ED1 ti\u1EC1n", required: true }))),
                            isSelected && isPercentage && (React.createElement("div", { className: "ml-14 flex items-center gap-2" },
                                React.createElement("label", { className: "text-sm text-gray-600" }, "Ph\u1EA7n tr\u0103m:"),
                                React.createElement("input", { type: "number", value: (participant === null || participant === void 0 ? void 0 : participant.sharePercentage) || 0, onChange: function (e) {
                                        return handleParticipantChange(member.id, Number(e.target.value), "percentage");
                                    }, className: "w-16 p-1 border border-gray-300 rounded-md focus:ring-[#5BC5A7] focus:border-[#5BC5A7]", placeholder: "%", required: true, min: "0", max: "100" }),
                                React.createElement("span", { className: "text-sm text-gray-700" },
                                    "(",
                                    (participant === null || participant === void 0 ? void 0 : participant.shareAmount.toLocaleString()) || 0,
                                    " ",
                                    currency,
                                    ")"))),
                            isSelected && !isCustom && !isPercentage && (React.createElement("div", { className: "ml-14 text-sm text-gray-700" },
                                (participant === null || participant === void 0 ? void 0 : participant.shareAmount.toLocaleString()) || 0,
                                " ",
                                currency))));
                    }))),
                React.createElement("button", { type: "submit", disabled: isLoading, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mt-4 " + (isLoading ? "opacity-50 cursor-not-allowed" : "") },
                    React.createElement(fi_1.FiEdit, { className: "mr-2" }),
                    " ",
                    isLoading ? "Đang cập nhật..." : "Cập nhật khoản chi")))));
}
exports["default"] = ModalEditExpense;
