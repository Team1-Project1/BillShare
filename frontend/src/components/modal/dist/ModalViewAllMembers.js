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
var react_toastify_1 = require("react-toastify");
var fi_1 = require("react-icons/fi");
var CardMemberSelect_1 = require("../card/CardMemberSelect");
var fetchWithAuth_1 = require("@/lib/fetchWithAuth");
function ModalViewAllMembers(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, groupId = _a.groupId, members = _a.members, createdBy = _a.createdBy;
    var modalRef = react_1.useRef(null);
    var _b = react_1.useState([]), selectedMembers = _b[0], setSelectedMembers = _b[1];
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
    var userId = Number(localStorage.getItem("userId"));
    if (!userId) {
        react_toastify_1.toast.error("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true
        });
        return;
    }
    var handleSelectMember = function (id) {
        if (id === userId) {
            react_toastify_1.toast.warn("Bạn không thể chọn chính mình để xóa!", { position: "top-center" });
            return;
        }
        setSelectedMembers(function (prev) {
            return prev.includes(id) ? prev.filter(function (m) { return m !== id; }) : __spreadArrays(prev, [id]);
        });
    };
    var handleDeleteMembers = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/group/" + groupId + "/" + selectedMembers + "/delete-by/" + userId, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "*/*"
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 2];
                    react_toastify_1.toast.success("Xóa thành viên thành công!", { position: "top-center" });
                    setSelectedMembers([]); // Reset danh sách chọn
                    onClose(); // Đóng modal
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    react_toastify_1.toast.error(errorData.message || "Không thể xóa thành viên!", { position: "top-center" });
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    react_toastify_1.toast.error("Lỗi khi xóa thành viên!", { position: "top-center" });
                    return [3 /*break*/, 6];
                case 6:
                    setSelectedMembers([]);
                    return [2 /*return*/];
            }
        });
    }); };
    var canShowDelete = userId === createdBy; // Chỉ người tạo nhóm mới có quyền xóa thành viên
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50" },
        React.createElement("div", { ref: modalRef, className: "bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[500px] shadow-xl border border-gray-200", style: {
                transform: isOpen ? "scale(1)" : "scale(0.7)",
                opacity: isOpen ? 1 : 0,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out"
            } },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900 flex-1 text-center" }, "T\u1EA5t c\u1EA3 th\u00E0nh vi\u00EAn"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" }, "\u2715")),
            React.createElement("div", { className: "mb-4 flex items-center" },
                React.createElement(fi_1.FiUsers, { className: "text-[#5BC5A7] mr-2" }),
                React.createElement("p", { className: "text-[16px] text-gray-700" }, "Danh s\u00E1ch th\u00E0nh vi\u00EAn")),
            React.createElement("div", { className: "space-y-3 max-h-48 overflow-y-auto" }, members.map(function (member) { return (React.createElement(CardMemberSelect_1["default"], { key: member.id, avatar: member.avatar, name: member.name, email: member.email, selected: selectedMembers.includes(member.id), onSelect: function () { return handleSelectMember(member.id); } })); })),
            canShowDelete && (React.createElement("button", { onClick: handleDeleteMembers, disabled: selectedMembers.length === 0, className: "w-full h-12 bg-red-500 text-white rounded-md text-base font-semibold hover:bg-red-600 transition-colors duration-300 flex items-center justify-center mt-4 " + (selectedMembers.length === 0 ? "opacity-50 cursor-not-allowed" : "") },
                React.createElement(fi_1.FiTrash2, { className: "mr-2" }),
                " X\u00F3a")))));
}
exports["default"] = ModalViewAllMembers;
