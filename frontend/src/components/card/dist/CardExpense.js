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
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var react_toastify_1 = require("react-toastify");
var fi_1 = require("react-icons/fi");
var fetchWithAuth_1 = require("@/lib/fetchWithAuth");
var ModalEditExpense_1 = require("@/components/modal/ModalEditExpense");
var categories_1 = require("@/config/categories");
function CardExpense(_a) {
    var _this = this;
    var expenseId = _a.expenseId, groupId = _a.groupId, name = _a.name, date = _a.date, amount = _a.amount, currency = _a.currency, userId = _a.userId, _b = _a.isSelected, isSelected = _b === void 0 ? false : _b, onSelect = _a.onSelect, _c = _a.showDeleteOptions, showDeleteOptions = _c === void 0 ? false : _c, onDeleteSuccess = _a.onDeleteSuccess, onEditSuccess = _a.onEditSuccess, onClose = _a.onClose, _d = _a.members, members = _d === void 0 ? [] : _d;
    var _e = react_1.useState(false), isOpen = _e[0], setIsOpen = _e[1];
    var _f = react_1.useState(null), expenseDetail = _f[0], setExpenseDetail = _f[1];
    var _g = react_1.useState(false), isLoading = _g[0], setIsLoading = _g[1];
    var _h = react_1.useState(false), canDelete = _h[0], setCanDelete = _h[1];
    var _j = react_1.useState(false), isEditModalOpen = _j[0], setIsEditModalOpen = _j[1];
    var _k = react_1.useState(false), hasFetched = _k[0], setHasFetched = _k[1];
    var fetchExpenseDetail = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/api/groups/" + groupId + "/expenses/" + expenseId, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "*/*"
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 401) {
                            react_toastify_1.toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
                                position: "top-center",
                                autoClose: 2000
                            });
                            return [2 /*return*/];
                        }
                        throw new Error("Không thể tải chi tiết khoản chi");
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.code === "success") {
                        setExpenseDetail(data.data);
                        setCanDelete(data.data.createdByUserId === userId);
                        setHasFetched(true);
                    }
                    else {
                        react_toastify_1.toast.error(data.message, { position: "top-center", autoClose: 2000 });
                        setCanDelete(false);
                        setHasFetched(true);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error("Fetch error:", err_1);
                    react_toastify_1.toast.error("Không thể tải chi tiết khoản chi!", {
                        position: "top-center",
                        autoClose: 2000
                    });
                    setCanDelete(false);
                    setHasFetched(true);
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        if (!hasFetched && (showDeleteOptions || isOpen)) {
            fetchExpenseDetail();
        }
    }, [expenseId, groupId, userId, showDeleteOptions, isOpen, hasFetched]);
    var handleToggle = function () {
        setIsOpen(!isOpen);
    };
    var handleCheckboxChange = function (e) {
        e.stopPropagation();
        if (onSelect && canDelete) {
            onSelect();
        }
        else if (!canDelete) {
            react_toastify_1.toast.warn("Bạn không có quyền chọn khoản chi này để xóa!", {
                position: "top-center",
                autoClose: 2000
            });
        }
    };
    var handleDivClick = function (e) {
        if (showDeleteOptions) {
            if (!(e.target instanceof HTMLInputElement) &&
                !(e.target instanceof HTMLButtonElement) &&
                onSelect &&
                canDelete) {
                onSelect();
            }
            else if (!canDelete) {
                react_toastify_1.toast.warn("Bạn không có quyền chọn khoản chi này để xóa!", {
                    position: "top-center",
                    autoClose: 2000
                });
            }
        }
        else {
            handleToggle();
        }
    };
    var handleDeleteClick = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.stopPropagation();
                    if (!canDelete) {
                        react_toastify_1.toast.error("Bạn không có quyền xóa khoản chi này!", {
                            position: "top-center",
                            autoClose: 2000
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/api/groups/" + groupId + "/expenses/" + expenseId, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "*/*",
                                userId: userId.toString()
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || "Kh\u00F4ng th\u1EC3 x\u00F3a kho\u1EA3n chi \"" + name + "\"");
                case 4:
                    react_toastify_1.toast.success("\u0110\u00E3 x\u00F3a kho\u1EA3n chi: " + name, {
                        position: "top-center",
                        autoClose: 2000
                    });
                    if (onDeleteSuccess)
                        onDeleteSuccess();
                    if (onClose)
                        onClose();
                    return [3 /*break*/, 6];
                case 5:
                    err_2 = _a.sent();
                    console.error("Delete error:", err_2);
                    react_toastify_1.toast.error("Kh\u00F4ng th\u1EC3 x\u00F3a kho\u1EA3n chi \"" + name + "\"", {
                        position: "top-center",
                        autoClose: 2000
                    });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Lấy biểu tượng từ categories dựa trên categoryId
    var category = categories_1.categories.find(function (cat) { return cat.category_id === (expenseDetail === null || expenseDetail === void 0 ? void 0 : expenseDetail.categoryId); });
    var categoryIcon = category ? category.icon : "📝";
    return (React.createElement("div", { className: "mb-2" },
        React.createElement("div", { onClick: handleDivClick, className: "cursor-pointer bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors " + (isSelected ? "bg-[#5BC5A7]/10 border-[#5BC5A7]" : "") },
            React.createElement("div", { className: "flex items-center space-x-3" },
                showDeleteOptions && (React.createElement("input", { type: "checkbox", checked: isSelected, onChange: handleCheckboxChange, className: "h-5 w-5 text-[#5BC5A7] rounded focus:ring-[#5BC5A7]", disabled: !canDelete })),
                React.createElement("div", { className: "bg-[#5BC5A7]/10 p-2 rounded-full" },
                    React.createElement("span", { className: "text-[#5BC5A7]", style: { fontSize: "18px" } }, categoryIcon)),
                React.createElement("div", null,
                    React.createElement("h4", { className: "text-sm font-medium text-gray-900" }, name),
                    React.createElement("p", { className: "text-xs text-gray-600" }, new Date(date).toLocaleDateString("vi-VN")))),
            React.createElement("div", { className: "flex items-center space-x-2" },
                React.createElement("span", { className: "text-sm font-semibold text-[#5BC5A7]" },
                    amount.toLocaleString(),
                    " ",
                    currency),
                showDeleteOptions && canDelete && (React.createElement("button", { onClick: handleDeleteClick, className: "p-1.5 rounded-md hover:bg-red-100 transition-colors", title: "X\u00F3a kho\u1EA3n chi" },
                    React.createElement(fi_1.FiTrash2, { className: "text-red-500", size: 16 }))))),
        React.createElement(framer_motion_1.AnimatePresence, null, isOpen && (React.createElement(framer_motion_1.motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.3, ease: "easeInOut" }, className: "bg-gray-50 rounded-b-lg p-4 border border-t-0 border-gray-200" }, isLoading ? (React.createElement("p", { className: "text-gray-600 italic animate-pulse" }, "\u0110ang t\u1EA3i chi ti\u1EBFt...")) : expenseDetail ? (React.createElement("div", { className: "space-y-3 relative" },
            canDelete && (React.createElement("button", { onClick: function () { return setIsEditModalOpen(true); }, className: "absolute top-0 right-0 p-2 bg-[#5BC5A7] text-white rounded-md hover:bg-[#4AA88C] flex items-center" }, "S\u1EEDa kho\u1EA3n chi")),
            React.createElement("div", null,
                React.createElement("h5", { className: "text-sm font-semibold text-[#5BC5A7]" }, "T\u00EAn kho\u1EA3n chi"),
                React.createElement("p", { className: "text-sm text-gray-700" }, expenseDetail.expenseName)),
            React.createElement("div", null,
                React.createElement("h5", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Nh\u00F3m"),
                React.createElement("p", { className: "text-sm text-gray-700" }, expenseDetail.groupName)),
            React.createElement("div", null,
                React.createElement("h5", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Danh m\u1EE5c"),
                React.createElement("p", { className: "text-sm text-gray-700" }, expenseDetail.categoryName)),
            React.createElement("div", null,
                React.createElement("h5", { className: "text-sm font-semibold text-[#5BC5A7]" }, "M\u00F4 t\u1EA3"),
                React.createElement("p", { className: "text-sm text-gray-700" }, expenseDetail.description || "Không có mô tả")),
            React.createElement("div", null,
                React.createElement("h5", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Ng\u01B0\u1EDDi thanh to\u00E1n"),
                React.createElement("p", { className: "text-sm text-gray-700" }, expenseDetail.payerUserName)),
            React.createElement("div", null,
                React.createElement("h5", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Ph\u01B0\u01A1ng th\u1EE9c chia"),
                React.createElement("p", { className: "text-sm text-gray-700" }, expenseDetail.splitMethod === "equal"
                    ? "Chia đều"
                    : expenseDetail.splitMethod === "percentage"
                        ? "Chia theo %"
                        : "Tùy chỉnh")),
            React.createElement("div", null,
                React.createElement("h5", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Th\u00E0nh vi\u00EAn tham gia"),
                React.createElement("ul", { className: "list-disc pl-5 text-sm text-gray-700" }, expenseDetail.participants.map(function (participant) { return (React.createElement("li", { key: participant.participantId },
                    participant.userName,
                    ":",
                    " ",
                    participant.shareAmount.toLocaleString(),
                    " ",
                    currency)); }))),
            React.createElement("div", null,
                React.createElement("h5", { className: "text-sm font-semibold text-[#5BC5A7]" }, "Ng\u00E0y chi"),
                React.createElement("p", { className: "text-sm text-gray-700" }, new Date(expenseDetail.expenseDate).toLocaleDateString("vi-VN"))),
            React.createElement("div", null,
                React.createElement("h5", { className: "text-sm font-semibold text-[#5BC5A7]" }, "T\u1ED5ng s\u1ED1 th\u00E0nh vi\u00EAn"),
                React.createElement("p", { className: "text-sm text-gray-700" }, expenseDetail.totalParticipants)))) : (React.createElement("p", { className: "text-gray-600 italic" }, "Kh\u00F4ng th\u1EC3 t\u1EA3i chi ti\u1EBFt kho\u1EA3n chi."))))),
        isEditModalOpen && expenseDetail && (React.createElement(ModalEditExpense_1["default"], { isOpen: isEditModalOpen, onClose: function () { return setIsEditModalOpen(false); }, onSuccess: function () {
                setHasFetched(false); // Đặt lại để làm mới dữ liệu sau khi chỉnh sửa
                fetchExpenseDetail();
                if (onEditSuccess)
                    onEditSuccess();
            }, expenseDetail: expenseDetail, groupId: groupId, userId: userId, members: members, currency: currency }))));
}
exports["default"] = CardExpense;
