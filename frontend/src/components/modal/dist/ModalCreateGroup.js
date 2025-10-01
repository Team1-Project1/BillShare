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
var CardMemberSelect_1 = require("../card/CardMemberSelect");
var fetchWithAuth_1 = require("@/lib/fetchWithAuth");
function ModalCreateGroup(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = react_1.useState(""), groupName = _b[0], setGroupName = _b[1];
    var _c = react_1.useState(""), groupDesc = _c[0], setGroupDesc = _c[1];
    var _d = react_1.useState("/placeholder-avatar.png"), avatar = _d[0], setAvatar = _d[1]; // Avatar mặc định
    var _e = react_1.useState([]), selectedMembers = _e[0], setSelectedMembers = _e[1];
    var modalRef = react_1.useRef(null);
    // Dữ liệu thành viên mẫu
    var members = [
        { id: 1, name: "An", email: "annghiav01@gmail.com", avatar: "/avatar1.png" },
        { id: 2, name: "Trung Pham", email: "trung@gmail.com", avatar: "/avatar2.png" },
    ];
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
    var handleSelectMember = function (id) {
        setSelectedMembers(function (prev) {
            return prev.includes(id) ? prev.filter(function (m) { return m !== id; }) : __spreadArrays(prev, [id]);
        });
    };
    var handleUploadAvatar = function () {
        alert("Upload avatar to Cloudinary"); // Logic upload bạn làm sau
    };
    var handleCreate = function () { return __awaiter(_this, void 0, void 0, function () {
        var userId, response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    userId = localStorage.getItem("userId");
                    if (!userId) {
                        react_toastify_1.toast.error("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!", {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true
                        });
                        return [2 /*return*/];
                    }
                    if (!groupName.trim()) {
                        react_toastify_1.toast.error("Vui lòng nhập tên nhóm!", {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/group/create/" + userId, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "*/*"
                            },
                            body: JSON.stringify({
                                groupName: groupName,
                                description: groupDesc || "Không có mô tả",
                                defaultCurrency: "VND"
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 401 || response.status === 403) {
                            react_toastify_1.toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
                                position: "top-center",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true
                            });
                            return [2 /*return*/];
                        }
                        throw new Error("Không thể tạo nhóm");
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (data.code === "error") {
                        react_toastify_1.toast.error(data.message, {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true
                        });
                        return [2 /*return*/];
                    }
                    if (data.code === "success") {
                        react_toastify_1.toast.success("Tạo nhóm thành công!", {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true
                        });
                        console.log("Thành viên được chọn:", selectedMembers.map(function (id) { var _a; return (_a = members.find(function (m) { return m.id === id; })) === null || _a === void 0 ? void 0 : _a.name; }));
                        onClose();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    react_toastify_1.toast.error("Không thể tạo nhóm!", {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50" },
        React.createElement("div", { ref: modalRef, className: "bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[476px] shadow-xl border border-gray-200", style: {
                transform: isOpen ? "scale(1)" : "scale(0.7)",
                opacity: isOpen ? 1 : 0,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out"
            } },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "T\u1EA1o Nh\u00F3m"),
                React.createElement("button", { onClick: handleCreate, className: "w-24 h-10 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center" }, "T\u1EA1o")),
            React.createElement("h3", { className: "text-base font-medium text-gray-700 mb-2" }, "Th\u00F4ng tin nh\u00F3m"),
            React.createElement("div", { className: "mb-4 text-center" },
                React.createElement("img", { src: avatar, alt: "Avatar nh\u00F3m", className: "w-24 h-24 rounded-full mx-auto cursor-pointer", onClick: handleUploadAvatar }),
                React.createElement("p", { className: "text-sm text-gray-500 mt-2" }, "Nh\u1EA5n \u0111\u1EC3 t\u1EA3i \u1EA3nh l\u00EAn")),
            React.createElement("div", { className: "mb-4" },
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "T\u00EAn nh\u00F3m"),
                React.createElement("input", { type: "text", value: groupName, onChange: function (e) { return setGroupName(e.target.value); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]" })),
            React.createElement("div", { className: "mb-4" },
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Th\u00F4ng tin m\u00F4 t\u1EA3"),
                React.createElement("textarea", { value: groupDesc, onChange: function (e) { return setGroupDesc(e.target.value); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7] h-24" })),
            React.createElement("h3", { className: "text-base font-medium text-gray-700 mb-2" }, "Th\u00EAm th\u00E0nh vi\u00EAn"),
            React.createElement("div", { className: "space-y-3 max-h-48 overflow-y-auto" }, members.map(function (member) { return (React.createElement(CardMemberSelect_1["default"], { key: member.id, avatar: member.avatar, name: member.name, email: member.email, selected: selectedMembers.includes(member.id), onSelect: function () { return handleSelectMember(member.id); } })); })))));
}
exports["default"] = ModalCreateGroup;
