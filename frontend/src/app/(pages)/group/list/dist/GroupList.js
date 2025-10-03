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
exports.metadata = void 0;
var react_1 = require("react");
var react_toastify_1 = require("react-toastify");
var CardGroup_1 = require("@/components/card/CardGroup");
var fetchWithAuth_1 = require("@/lib/fetchWithAuth");
exports.metadata = {
    title: "Danh sách nhóm",
    description: "Mô tả trang danh sách nhóm..."
};
function GroupList() {
    var _this = this;
    var _a = react_1.useState([]), groups = _a[0], setGroups = _a[1];
    var _b = react_1.useState(0), totalGroups = _b[0], setTotalGroups = _b[1];
    var _c = react_1.useState(true), loading = _c[0], setLoading = _c[1];
    react_1.useEffect(function () {
        var fetchGroups = function () { return __awaiter(_this, void 0, void 0, function () {
            var userId, response, data, activeGroups, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = localStorage.getItem("userId");
                        if (!userId) {
                            react_toastify_1.toast.error("Không tìm thấy userId, vui lòng đăng nhập lại!", {
                                position: "top-center",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true
                            });
                            setLoading(false);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/group/list-group/" + userId, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Accept": "*/*"
                                }
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
                            throw new Error("Không thể tải danh sách nhóm");
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        console.log("Group list API response:", data); // Debug API response
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
                            activeGroups = data.data.groups
                                .filter(function (group) {
                                return group.isActive &&
                                    group.groupId !== undefined &&
                                    group.groupId !== null;
                            })
                                .map(function (group) { return (__assign(__assign({}, group), { description: group.description || "Không có mô tả", defaultCurrency: group.defaultCurrency || "VND" })); });
                            setGroups(activeGroups);
                            setTotalGroups(data.data.totalGroups || 0);
                            react_toastify_1.toast.success("Tải danh sách nhóm thành công!", {
                                position: "top-center",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true
                            });
                        }
                        setLoading(false);
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.error("Fetch group list error:", err_1);
                        react_toastify_1.toast.error("Không thể tải danh sách nhóm!", {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true
                        });
                        setLoading(false);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchGroups();
    }, []);
    if (loading)
        return React.createElement("p", { className: "text-gray-600" }, "\u0110ang t\u1EA3i...");
    return (React.createElement("div", { className: "min-h-screen bg-gray-100 py-6 px-4", style: { maxWidth: "576px", margin: "0 auto" } },
        React.createElement("div", { className: "flex justify-between items-center mb-6" },
            React.createElement("h1", { className: "text-2xl font-bold text-[#5BC5A7]" }, "Danh s\u00E1ch nh\u00F3m"),
            React.createElement("p", { className: "text-sm text-gray-600" },
                "T\u1ED5ng s\u1ED1 nh\u00F3m: ",
                totalGroups)),
        React.createElement("div", { className: "space-y-4" }, groups.length === 0 ? (React.createElement("p", { className: "text-gray-600" }, "Ch\u01B0a c\u00F3 nh\u00F3m n\u00E0o.")) : (groups.map(function (group) { return (React.createElement(CardGroup_1["default"], { key: group.groupId, groupId: group.groupId, groupName: group.groupName, description: group.description, defaultCurrency: group.defaultCurrency, memberCount: 0 })); })))));
}
exports["default"] = GroupList;
