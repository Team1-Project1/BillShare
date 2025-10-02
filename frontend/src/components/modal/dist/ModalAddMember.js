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
function ModalAddMember(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, groupId = _a.groupId, createdBy = _a.createdBy, onInviteSuccess = _a.onInviteSuccess;
    var _b = react_1.useState(false), searchOpen = _b[0], setSearchOpen = _b[1];
    var _c = react_1.useState(false), inviteOpen = _c[0], setInviteOpen = _c[1];
    var _d = react_1.useState(""), searchQuery = _d[0], setSearchQuery = _d[1];
    var _e = react_1.useState(""), email = _e[0], setEmail = _e[1];
    var _f = react_1.useState(false), isLoading = _f[0], setIsLoading = _f[1];
    var _g = react_1.useState([]), selectedMembers = _g[0], setSelectedMembers = _g[1];
    var modalRef = react_1.useRef(null);
    // Dữ liệu thành viên mẫu (tái sử dụng CardMemberSelect)
    var members = [
        { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", avatar: "/avatar1.png" },
        { id: 2, name: "Trần Thị B", email: "b@gmail.com", avatar: "/avatar2.png" },
        { id: 3, name: "Lê Văn C", email: "c@gmail.com", avatar: "/avatar3.png" },
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
    var handleSearchToggle = function () {
        setSearchOpen(!searchOpen);
        if (inviteOpen)
            setInviteOpen(false); // Đóng invite nếu đang mở
    };
    var handleInviteToggle = function () {
        setInviteOpen(!inviteOpen);
        if (searchOpen)
            setSearchOpen(false); // Đóng search nếu đang mở
    };
    var handleSendInvite = function () { return __awaiter(_this, void 0, void 0, function () {
        var currentUserId, response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentUserId = parseInt(localStorage.getItem("userId") || "0", 10);
                    if (currentUserId !== createdBy) {
                        react_toastify_1.toast.error("Chỉ người tạo nhóm mới có quyền mời!", {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true
                        });
                        return [2 /*return*/];
                    }
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        react_toastify_1.toast.error("Vui lòng nhập email hợp lệ!", {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true
                        });
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/email/confirm-participation?groupId=" + groupId + "&userId=" + createdBy, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "*/*"
                            },
                            body: JSON.stringify({ emailTo: email })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 401) {
                            react_toastify_1.toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!", {
                                position: "top-center",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true
                            });
                            return [2 /*return*/];
                        }
                        throw new Error("Không thể gửi lời mời");
                    }
                    return [4 /*yield*/, response.text()];
                case 3:
                    data = _a.sent();
                    react_toastify_1.toast.success(data, {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true
                    });
                    setEmail(""); // Reset input
                    setInviteOpen(false); // Đóng thanh email
                    onInviteSuccess(); // Reload danh sách thành viên
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    console.error("Invite error:", err_1);
                    react_toastify_1.toast.error("Không thể gửi lời mời!", {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleSelectMember = function (id) {
        setSelectedMembers(function (prev) {
            return prev.includes(id) ? prev.filter(function (m) { return m !== id; }) : __spreadArrays(prev, [id]);
        });
    };
    var handleAddMembers = function () {
        console.log("Thêm thành viên:", selectedMembers.map(function (id) { var _a; return (_a = members.find(function (m) { return m.id === id; })) === null || _a === void 0 ? void 0 : _a.name; }));
        onClose();
    };
    if (!isOpen)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50" },
        React.createElement("div", { ref: modalRef, className: "bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[500px] shadow-xl border border-gray-200", style: {
                transform: isOpen ? "scale(1)" : "scale(0.7)",
                opacity: isOpen ? 1 : 0,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out"
            } },
            React.createElement("div", { className: "flex justify-between items-center mb-4" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "Th\u00EAm th\u00E0nh vi\u00EAn"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" }, "\u2715")),
            React.createElement("button", { onClick: handleSearchToggle, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4" },
                React.createElement(fi_1.FiUser, { className: "mr-2" }),
                " Th\u00EAm b\u1EB1ng t\u00EAn ng\u01B0\u1EDDi d\u00F9ng"),
            React.createElement("div", { className: "overflow-hidden transition-all duration-300 ease-in-out " + (searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0") },
                React.createElement("input", { type: "text", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, placeholder: "T\u00ECm ki\u1EBFm t\u00EAn ng\u01B0\u1EDDi d\u00F9ng...", className: "w-full border border-gray-300 rounded-md p-2 mb-4 focus:border-[#5BC5A7]", style: { display: searchOpen ? "block" : "none" }, disabled: isLoading })),
            React.createElement("button", { onClick: handleInviteToggle, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mb-4" },
                React.createElement(fi_1.FiMail, { className: "mr-2" }),
                " M\u1EDDi qua email"),
            React.createElement("div", { className: "overflow-hidden transition-all duration-300 ease-in-out " + (inviteOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0") },
                React.createElement("div", { className: "flex items-center mb-4" },
                    React.createElement("input", { type: "email", value: email, onChange: function (e) { return setEmail(e.target.value); }, placeholder: "Nh\u1EADp email...", className: "flex-1 border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]", style: { display: inviteOpen ? "block" : "none" }, disabled: isLoading }),
                    React.createElement("button", { onClick: handleSendInvite, disabled: isLoading, className: "ml-2 bg-[#5BC5A7] text-white rounded-md p-2 hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center " + (isLoading ? "opacity-50 cursor-not-allowed" : "") },
                        React.createElement(fi_1.FiSend, { className: "text-xl" })))),
            React.createElement("div", { className: "mb-4 flex items-center" },
                React.createElement(fi_1.FiUsers, { className: "text-[#5BC5A7] mr-2" }),
                React.createElement("p", { className: "text-[16px] text-gray-700" }, "Th\u00EAm b\u1EA1n b\u00E8 v\u00E0o nh\u00F3m")),
            React.createElement("div", { className: "space-y-3 max-h-48 overflow-y-auto" }, members.map(function (member) { return (React.createElement(CardMemberSelect_1["default"], { key: member.id, avatar: member.avatar, name: member.name, email: member.email, selected: selectedMembers.includes(member.id), onSelect: function () { return handleSelectMember(member.id); } })); })),
            React.createElement("button", { onClick: handleAddMembers, className: "w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center mt-4" }, "Th\u00EAm th\u00E0nh vi\u00EAn"))));
}
exports["default"] = ModalAddMember;
