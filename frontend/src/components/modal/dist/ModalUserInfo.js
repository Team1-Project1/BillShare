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
var fi_1 = require("react-icons/fi");
var react_toastify_1 = require("react-toastify");
var react_filepond_1 = require("react-filepond");
require("filepond/dist/filepond.min.css");
var filepond_plugin_file_validate_type_1 = require("filepond-plugin-file-validate-type");
var filepond_plugin_image_preview_1 = require("filepond-plugin-image-preview");
require("filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css");
react_filepond_1.registerPlugin(filepond_plugin_file_validate_type_1["default"], filepond_plugin_image_preview_1["default"]);
function UserInfo(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, user = _a.user, onSuccess = _a.onSuccess, userId = _a.userId;
    var _b = react_1.useState(false), isEditing = _b[0], setIsEditing = _b[1];
    var _c = react_1.useState((user === null || user === void 0 ? void 0 : user.fullName) || ""), fullName = _c[0], setFullName = _c[1];
    var _d = react_1.useState((user === null || user === void 0 ? void 0 : user.email) || ""), email = _d[0], setEmail = _d[1];
    var _e = react_1.useState((user === null || user === void 0 ? void 0 : user.phone) || ""), phone = _e[0], setPhone = _e[1];
    var _f = react_1.useState((user === null || user === void 0 ? void 0 : user.avatarUrl) ? [{ source: user.avatarUrl, options: { type: "server" } }] : []), avatars = _f[0], setAvatars = _f[1];
    var _g = react_1.useState(false), isEmailChanged = _g[0], setIsEmailChanged = _g[1];
    var _h = react_1.useState(false), isLoading = _h[0], setIsLoading = _h[1];
    var modalRef = react_1.useRef(null);
    react_1.useEffect(function () {
        console.log("Avatar URL:", user === null || user === void 0 ? void 0 : user.avatarUrl); // Debug URL
        setFullName((user === null || user === void 0 ? void 0 : user.fullName) || "");
        setEmail((user === null || user === void 0 ? void 0 : user.email) || "");
        setPhone((user === null || user === void 0 ? void 0 : user.phone) || "");
        setAvatars((user === null || user === void 0 ? void 0 : user.avatarUrl) ? [{ source: user.avatarUrl, options: { type: "server" } }] : []);
        setIsEditing(false);
        setIsEmailChanged(false);
    }, [user, isOpen]);
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
    var handleSetEditing = function () { return __awaiter(_this, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isEditing) return [3 /*break*/, 2];
                    return [4 /*yield*/, handleSaveChanges()];
                case 1:
                    success = _a.sent();
                    if (success)
                        setIsEditing(false);
                    return [3 /*break*/, 3];
                case 2:
                    setIsEditing(true);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveChanges = function () { return __awaiter(_this, void 0, void 0, function () {
        var userData, userJson, formData, accessToken, response, refreshToken, refreshRes, data_1, newAccessToken, newRefreshToken, errorData, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, 13, 14]);
                    setIsLoading(true);
                    if (!fullName.trim()) {
                        react_toastify_1.toast.error("Vui lòng nhập tên người dùng!", {
                            position: "top-center",
                            autoClose: 3000
                        });
                        return [2 /*return*/, false];
                    }
                    if (!email.trim()) {
                        react_toastify_1.toast.error("Vui lòng nhập email!", {
                            position: "top-center",
                            autoClose: 3000
                        });
                        return [2 /*return*/, false];
                    }
                    if (!phone.trim()) {
                        react_toastify_1.toast.error("Vui lòng nhập số điện thoại!", {
                            position: "top-center",
                            autoClose: 3000
                        });
                        return [2 /*return*/, false];
                    }
                    if (email !== user.email) {
                        setIsEmailChanged(true);
                    }
                    userData = {
                        fullName: fullName,
                        email: email,
                        phone: phone
                    };
                    userJson = JSON.stringify(userData);
                    formData = new FormData();
                    formData.append("user", userJson);
                    if (avatars.length > 0 && avatars[0].file instanceof File) {
                        formData.append("file", avatars[0].file);
                    }
                    accessToken = localStorage.getItem("accessToken");
                    return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/users/edit/" + userId, {
                            method: "PATCH",
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
                    return [4 /*yield*/, fetch(process.env.NEXT_PUBLIC_API_URL + "/users/edit/" + userId, {
                            method: "PATCH",
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
                    return [2 /*return*/, false];
                case 6: return [3 /*break*/, 8];
                case 7:
                    localStorage.clear();
                    window.location.href = "/login";
                    return [2 /*return*/, false];
                case 8:
                    if (!!response.ok) return [3 /*break*/, 10];
                    return [4 /*yield*/, response.json()];
                case 9:
                    errorData = _a.sent();
                    if (response.status === 409) {
                        react_toastify_1.toast.error(errorData.message || "Xung đột dữ liệu khi cập nhật người dùng!", {
                            position: "top-center",
                            autoClose: 3000
                        });
                        return [2 /*return*/, false];
                    }
                    throw new Error("Không thể cập nhật thông tin người dùng");
                case 10: return [4 /*yield*/, response.json()];
                case 11:
                    data = _a.sent();
                    if (data.code === "error") {
                        react_toastify_1.toast.error(data.message || "Không thể cập nhật thông tin người dùng!", {
                            position: "top-center",
                            autoClose: 3000
                        });
                        return [2 /*return*/, false];
                    }
                    if (data.code === "success") {
                        if (isEmailChanged) {
                            react_toastify_1.toast.success("Cập nhật thông tin người dùng thành công! Vui lòng đăng nhập lại.", {
                                position: "top-center",
                                autoClose: 3000
                            });
                            localStorage.clear();
                            window.location.href = "/login";
                            onClose();
                            return [2 /*return*/, true];
                        }
                        else {
                            react_toastify_1.toast.success("Cập nhật thông tin người dùng thành công!", {
                                position: "top-center",
                                autoClose: 3000
                            });
                            if (data.data.avatarUrl) {
                                setAvatars([{ source: data.data.avatarUrl, options: { type: "server" } }]);
                            }
                            onClose();
                            onSuccess();
                            return [2 /*return*/, true];
                        }
                    }
                    return [3 /*break*/, 14];
                case 12:
                    err_1 = _a.sent();
                    console.error("Lỗi:", err_1);
                    react_toastify_1.toast.error("Không thể cập nhật thông tin người dùng!", {
                        position: "top-center",
                        autoClose: 3000
                    });
                    return [2 /*return*/, false];
                case 13:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    }); };
    if (!user || !isOpen) {
        return null;
    }
    return (React.createElement("div", { className: "fixed inset-0 flex items-center justify-center z-50" },
        React.createElement("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300", onClick: onClose }),
        React.createElement("div", { ref: modalRef, className: "bg-white/90 backdrop-blur-md rounded-lg p-4 w-full max-w-[500px] shadow-xl border border-gray-200", style: {
                transform: isOpen ? "scale(1)" : "scale(0.7)",
                opacity: isOpen ? 1 : 0,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out"
            } },
            React.createElement("div", { className: "mb-4 text-center" },
                React.createElement("label", { htmlFor: "avatar", className: "block font-[500] text-[14px] text-black mb-[5px]" }, "\u1EA2nh \u0111\u1EA1i di\u1EC7n"),
                React.createElement(react_filepond_1.FilePond, __assign({ name: "avatar", allowMultiple: false, allowRemove: true, labelIdle: "+", acceptedFileTypes: ["image/*"], files: avatars, onupdatefiles: function (fileItems) {
                        setAvatars(fileItems);
                    }, imagePreviewMaxHeight: 200 }, { imagePreviewMaxWidth: 200 }, { className: "w-full" })),
                avatars.length > 0 && avatars[0].file instanceof File ? (React.createElement("img", { src: URL.createObjectURL(avatars[0].file), alt: "Preview avatar", className: "w-24 h-24 rounded-full mx-auto mt-2" })) : avatars.length > 0 && avatars[0].source ? (React.createElement("img", { src: avatars[0].source, alt: "Current avatar", className: "w-24 h-24 rounded-full mx-auto mt-2" })) : (React.createElement("p", { className: "mt-2 text-gray-500" }, "Ch\u01B0a c\u00F3 \u1EA3nh"))),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "H\u1ECD v\u00E0 t\u00EAn"),
                    React.createElement("div", { className: "flex items-center border border-gray-300 rounded-md p-2" },
                        React.createElement(fi_1.FiUser, { className: "text-[#5BC5A7] mr-2" }),
                        React.createElement("input", { type: "text", value: fullName, disabled: !isEditing, onChange: function (e) { return setFullName(e.target.value); }, className: "flex-1 bg-transparent outline-none " + (isEditing ? "text-gray-900" : "text-gray-600") }))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Email"),
                    React.createElement("div", { className: "flex items-center border border-gray-300 rounded-md p-2" },
                        React.createElement(fi_1.FiMail, { className: "text-[#5BC5A7] mr-2" }),
                        React.createElement("input", { type: "email", value: email, disabled: !isEditing, onChange: function (e) { return setEmail(e.target.value); }, className: "flex-1 bg-transparent outline-none " + (isEditing ? "text-gray-900" : "text-gray-600") }))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i"),
                    React.createElement("div", { className: "flex items-center border border-gray-300 rounded-md p-2" },
                        React.createElement(fi_1.FiPhone, { className: "text-[#5BC5A7] mr-2" }),
                        React.createElement("input", { type: "tel", value: phone, disabled: !isEditing, onChange: function (e) { return setPhone(e.target.value); }, className: "flex-1 bg-transparent outline-none " + (isEditing ? "text-gray-900" : "text-gray-600") })))),
            React.createElement("div", { className: "flex justify-center mt-8" },
                React.createElement("button", { onClick: handleSetEditing, disabled: isLoading, className: "flex items-center justify-center gap-2 w-[200px] h-12 rounded-md text-base font-semibold transition-all duration-300 " + (isLoading
                        ? "bg-gray-400 cursor-not-allowed text-gray-800"
                        : isEditing
                            ? "bg-[#5BC5A7] text-white hover:bg-[#4AA88C]"
                            : "bg-gray-300 text-gray-800 hover:bg-gray-400") }, isLoading ? (React.createElement("span", null, "\u0110ang x\u1EED l\u00FD...")) : isEditing ? (React.createElement(React.Fragment, null,
                    React.createElement(fi_1.FiSave, { size: 18 }),
                    React.createElement("span", null, "L\u01B0u thay \u0111\u1ED5i"))) : (React.createElement(React.Fragment, null,
                    React.createElement(fi_1.FiEdit3, { size: 18 }),
                    React.createElement("span", null, "Ch\u1EC9nh s\u1EEDa"))))))));
}
exports["default"] = UserInfo;
