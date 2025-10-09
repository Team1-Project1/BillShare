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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var fi_1 = require("react-icons/fi");
var CardExpense_1 = require("../card/CardExpense");
var fetchWithAuth_1 = require("@/lib/fetchWithAuth");
var react_toastify_1 = require("react-toastify");
function ModalViewAllExpenses(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, expenses = _a.expenses, groupId = _a.groupId, userId = _a.userId, onDeleteSuccess = _a.onDeleteSuccess;
    var modalRef = react_1.useRef(null);
    var _b = react_1.useState([]), selectedExpenses = _b[0], setSelectedExpenses = _b[1];
    // Xử lý chọn/hủy chọn khoản chi
    var handleSelectExpense = function (expenseId) {
        setSelectedExpenses(function (prev) {
            return prev.includes(expenseId)
                ? prev.filter(function (id) { return id !== expenseId; })
                : __spreadArrays(prev, [expenseId]);
        });
    };
    // Xử lý xóa nhiều khoản chi
    var handleDeleteExpenses = function () { return __awaiter(_this, void 0, void 0, function () {
        var canDeletePromises, canDeleteResults, deletePromises, err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (selectedExpenses.length === 0) {
                        react_toastify_1.toast.warn("Vui lòng chọn ít nhất một khoản chi để xóa!", {
                            position: "top-center",
                            autoClose: 2000
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    canDeletePromises = selectedExpenses.map(function (expenseId) { return __awaiter(_this, void 0, void 0, function () {
                        var detailResponse, detailData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/api/groups/" + groupId + "/expenses/" + expenseId, {
                                        method: "GET",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Accept: "*/*"
                                        }
                                    })];
                                case 1:
                                    detailResponse = _a.sent();
                                    if (!detailResponse.ok) {
                                        throw new Error("Kh\u00F4ng th\u1EC3 l\u1EA5y chi ti\u1EBFt kho\u1EA3n chi ID " + expenseId);
                                    }
                                    return [4 /*yield*/, detailResponse.json()];
                                case 2:
                                    detailData = _a.sent();
                                    if (detailData.code !== "success") {
                                        throw new Error(detailData.message);
                                    }
                                    return [2 /*return*/, detailData.data.createdByUserId === userId];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(canDeletePromises)];
                case 2:
                    canDeleteResults = _a.sent();
                    if (!canDeleteResults.every(function (canDelete) { return canDelete; })) {
                        react_toastify_1.toast.error("Bạn không có quyền xóa một số khoản chi đã chọn!", {
                            position: "top-center",
                            autoClose: 2000
                        });
                        return [2 /*return*/];
                    }
                    deletePromises = selectedExpenses.map(function (expenseId) { return __awaiter(_this, void 0, void 0, function () {
                        var response, errorData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/api/groups/" + groupId + "/expenses/" + expenseId, {
                                        method: "DELETE",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Accept: "*/*",
                                            userId: userId.toString()
                                        }
                                    })];
                                case 1:
                                    response = _a.sent();
                                    if (!!response.ok) return [3 /*break*/, 3];
                                    return [4 /*yield*/, response.json()];
                                case 2:
                                    errorData = _a.sent();
                                    throw new Error(errorData.message || "Kh\u00F4ng th\u1EC3 x\u00F3a kho\u1EA3n chi ID " + expenseId);
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(deletePromises)];
                case 3:
                    _a.sent();
                    react_toastify_1.toast.success("\u0110\u00E3 x\u00F3a " + selectedExpenses.length + " kho\u1EA3n chi th\u00E0nh c\u00F4ng!", {
                        position: "top-center",
                        autoClose: 2000
                    });
                    setSelectedExpenses([]);
                    onDeleteSuccess();
                    onClose();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("Delete error:", err_1);
                    react_toastify_1.toast.error("Có lỗi xảy ra khi xóa các khoản chi!", {
                        position: "top-center",
                        autoClose: 2000
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Đóng modal khi click ra ngoài
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
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50" },
        React.createElement("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300", onClick: onClose }),
        React.createElement("div", { ref: modalRef, className: "bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[500px] shadow-xl border border-gray-200", style: {
                transform: isOpen ? "scale(1)" : "scale(0.7)",
                opacity: isOpen ? 1 : 0,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out"
            } },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900 flex-1 text-center" }, "T\u1EA5t c\u1EA3 kho\u1EA3n chi"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" }, "\u2715")),
            React.createElement("div", { className: "mb-4 flex items-center" },
                React.createElement(fi_1.FiClipboard, { className: "text-[#5BC5A7] mr-2" }),
                React.createElement("p", { className: "text-[16px] text-gray-700" },
                    "Danh s\u00E1ch t\u1EA5t c\u1EA3 kho\u1EA3n chi trong nh\u00F3m (",
                    selectedExpenses.length,
                    " \u0111\u00E3 ch\u1ECDn)")),
            expenses.length > 0 ? (React.createElement("div", { className: "space-y-3 max-h-72 overflow-y-auto" }, expenses.map(function (expense) { return (React.createElement(CardExpense_1["default"], { key: expense.expenseId, expenseId: expense.expenseId, groupId: groupId, name: expense.name, date: expense.date, amount: expense.amount, userId: userId, isSelected: selectedExpenses.includes(expense.expenseId), onSelect: function () { return handleSelectExpense(expense.expenseId); }, showDeleteOptions: true, onDeleteSuccess: onDeleteSuccess, onClose: onClose })); }))) : (React.createElement("p", { className: "text-gray-600 italic text-center" }, "Nh\u00F3m n\u00E0y ch\u01B0a c\u00F3 kho\u1EA3n chi n\u00E0o.")),
            React.createElement("button", { onClick: handleDeleteExpenses, disabled: selectedExpenses.length === 0, className: "w-full h-12 bg-red-500 text-white rounded-md text-base font-semibold hover:bg-red-600 transition-colors duration-300 flex items-center justify-center mt-4 " + (selectedExpenses.length === 0 ? "opacity-50 cursor-not-allowed" : "") },
                React.createElement(fi_1.FiTrash2, { className: "mr-2" }),
                " X\u00F3a ",
                selectedExpenses.length,
                " kho\u1EA3n chi"))));
}
exports["default"] = ModalViewAllExpenses;
