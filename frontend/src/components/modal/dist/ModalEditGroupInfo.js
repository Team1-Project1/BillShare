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
exports.__esModule = true;
var react_1 = require("react");
var react_toastify_1 = require("react-toastify");
var currencies_1 = require("@/config/currencies");
var react_filepond_1 = require("react-filepond");
require("filepond/dist/filepond.min.css");
var filepond_plugin_file_validate_type_1 = require("filepond-plugin-file-validate-type");
var filepond_plugin_image_preview_1 = require("filepond-plugin-image-preview");
require("filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css");
var fi_1 = require("react-icons/fi");
// Đăng ký plugins
react_filepond_1.registerPlugin(filepond_plugin_file_validate_type_1["default"], filepond_plugin_image_preview_1["default"]);
function ModalEditGroupInfo(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, group = _a.group, onUpdateSuccess = _a.onUpdateSuccess;
    var _b = react_1.useState(group.name), groupName = _b[0], setGroupName = _b[1];
    var _c = react_1.useState(group.description), description = _c[0], setDescription = _c[1];
    var _d = react_1.useState(group.defaultCurrency), defaultCurrency = _d[0], setDefaultCurrency = _d[1];
    var _e = react_1.useState(group.avatar ? [{ source: group.avatar, options: { type: "server" } }] : []), avatars = _e[0], setAvatars = _e[1];
    var modalRef = react_1.useRef(null);
    react_1.useEffect(function () {
        setGroupName(group.name);
        setDescription(group.description);
        setDefaultCurrency(group.defaultCurrency);
        setAvatars(group.avatar ? [{ source: group.avatar, options: { type: "server" } }] : []);
    }, [group]);
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
    var handleEdit = function () { return __awaiter(_this, void 0, void 0, function () {
        var userId, groupData, groupJson, formData, accessToken, response, refreshToken, refreshRes, data_1, newAccessToken, newRefreshToken, errorData, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    userId = localStorage.getItem("userId");
                    if (!userId) {
                        react_toastify_1.toast.error("Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại!", {
                            position: "top-center",
                            autoClose: 3000
                        });
                        return [2 /*return*/];
                    }
                    if (!groupName.trim()) {
                        react_toastify_1.toast.error("Vui lòng nhập tên nhóm!", {
                            position: "top-center",
                            autoClose: 3000
                        });
                        return [2 /*return*/];
                    }
                    groupData = {
                        groupName: groupName,
                        description: description,
                        defaultCurrency: defaultCurrency
                    };
                    groupJson = JSON.stringify(groupData);
                    formData = new FormData();
                    formData.append("group", groupJson);
                    if (avatars.length > 0 && avatars[0].file) {
                        formData.append("file", avatars[0].file);
                    }
                    accessToken = localStorage.getItem("accessToken");
                    return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/group/edit/" + group.groupId, {
                            method: "PUT",
                            body: formData,
                            headers: {
                                Authorization: accessToken ? "Bearer " + accessToken : "",
                                Accept: "*/*"
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!(response.status === 401 || response.status === 403)) return [3 /*break*/, 8];
                    refreshToken = localStorage.getItem("refreshToken");
                    return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/auth/refresh-token", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "refresh-token": refreshToken !== null && refreshToken !== void 0 ? refreshToken : ""
                            }
                        })];
                case 2:
                    refreshRes = _a.sent();
                    if (!refreshRes.ok) return [3 /*break*/, 7];
                    return [4 /*yield*/, refreshRes.json()];
                case 3:
                    data_1 = _a.sent();
                    newAccessToken = data_1.accessToken;
                    newRefreshToken = data_1.refreshToken;
                    if (!(newAccessToken && newRefreshToken)) return [3 /*break*/, 5];
                    localStorage.setItem("accessToken", newAccessToken);
                    localStorage.setItem("refreshToken", newRefreshToken);
                    accessToken = newAccessToken;
                    return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/group/edit/" + group.groupId, {
                            method: "PUT",
                            body: formData,
                            headers: {
                                Authorization: "Bearer " + accessToken,
                                Accept: "*/*"
                            }
                        })];
                case 4:
                    response = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    localStorage.clear();
                    window.location.href = "/login";
                    return [2 /*return*/];
                case 6: return [3 /*break*/, 8];
                case 7:
                    localStorage.clear();
                    window.location.href = "/login";
                    return [2 /*return*/];
                case 8:
                    if (!!response.ok) return [3 /*break*/, 10];
                    return [4 /*yield*/, response.json()];
                case 9:
                    errorData = _a.sent();
                    if (response.status === 409) {
                        react_toastify_1.toast.error(errorData.message || "Xung đột dữ liệu khi cập nhật nhóm!", {
                            position: "top-center",
                            autoClose: 3000
                        });
                        return [2 /*return*/];
                    }
                    throw new Error("Không thể cập nhật thông tin nhóm");
                case 10: return [4 /*yield*/, response.json()];
                case 11:
                    data = _a.sent();
                    if (data.code === "error") {
                        react_toastify_1.toast.error(data.message, {
                            position: "top-center",
                            autoClose: 3000
                        });
                        return [2 /*return*/];
                    }
                    if (data.code === "success") {
                        react_toastify_1.toast.success("Cập nhật thông tin nhóm thành công!", {
                            position: "top-center",
                            autoClose: 3000
                        });
                        onUpdateSuccess();
                        onClose();
                    }
                    return [3 /*break*/, 13];
                case 12:
                    err_1 = _a.sent();
                    console.error("Lỗi:", err_1);
                    react_toastify_1.toast.error("Không thể cập nhật thông tin nhóm!", {
                        position: "top-center",
                        autoClose: 3000
                    });
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
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
                React.createElement("h2", { className: "text-2xl font-bold text-[#5BC5A7]" }, "Ch\u1EC9nh s\u1EEDa th\u00F4ng tin nh\u00F3m"),
                React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700 focus:outline-none" },
                    React.createElement(fi_1.FiX, { size: 24 }))),
            React.createElement("div", { className: "mb-4 text-center" },
                React.createElement("label", { htmlFor: "avatar", className: "block font-[500] text-[14px] text-black mb-[5px]" }, "Avatar"),
                React.createElement(react_filepond_1.FilePond, __assign({ name: "avatar", allowMultiple: false, allowRemove: true, labelIdle: "+", acceptedFileTypes: ["image/*"], files: avatars, onupdatefiles: setAvatars, imagePreviewMaxHeight: 200 }, { imagePreviewMaxWidth: 200 }, { className: "w-full" })),
                avatars.length > 0 && avatars[0].file instanceof File ? (React.createElement("img", { src: URL.createObjectURL(avatars[0].file), alt: "Preview avatar", className: "w-24 h-24 rounded-full mx-auto mt-2" })) : avatars.length > 0 && avatars[0].source ? (React.createElement("img", { src: avatars[0].source, alt: "Current avatar", className: "w-24 h-24 rounded-full mx-auto mt-2" })) : null),
            React.createElement("div", { className: "mb-4" },
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "T\u00EAn nh\u00F3m *"),
                React.createElement("input", { type: "text", value: groupName, onChange: function (e) { return setGroupName(e.target.value); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]" })),
            React.createElement("div", { className: "mb-4" },
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "M\u00F4 t\u1EA3"),
                React.createElement("textarea", { value: description, onChange: function (e) { return setDescription(e.target.value); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7] h-24" })),
            React.createElement("div", { className: "mb-4" },
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Ti\u1EC1n t\u1EC7"),
                React.createElement("select", { value: defaultCurrency, onChange: function (e) { return setDefaultCurrency(e.target.value); }, className: "w-full border border-gray-300 rounded-md p-2 focus:border-[#5BC5A7]" }, currencies_1.currencies.map(function (currency) { return (React.createElement("option", { key: currency.code, value: currency.code },
                    currency.code,
                    " - ",
                    currency.name)); }))),
            React.createElement("button", { onClick: handleEdit, className: "w-full h-10 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center" }, "X\u00E1c nh\u1EADn"))));
}
exports["default"] = ModalEditGroupInfo;
