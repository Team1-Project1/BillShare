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
var navigation_1 = require("next/navigation");
var react_toastify_1 = require("react-toastify");
var fetchWithAuth_1 = require("@/lib/fetchWithAuth");
var head_1 = require("next/head");
function DeclinePage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var searchParams = navigation_1.useSearchParams();
    var groupId = searchParams.get("groupId");
    var userId = searchParams.get("userId");
    react_1.useEffect(function () {
        var declineInvite = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!groupId || !userId) {
                            react_toastify_1.toast.error("Thông tin không hợp lệ!", { position: "top-center" });
                            setTimeout(function () { return router.push("/"); }, 3000);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetchWithAuth_1.fetchWithAuth(process.env.NEXT_PUBLIC_API_URL + "/group-member/" + groupId + "/decline/" + userId, {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    Accept: "*/*"
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Không thể từ chối lời mời");
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        if (data.code === "success") {
                            react_toastify_1.toast.success(data.message, { position: "top-center" });
                        }
                        else {
                            react_toastify_1.toast.error(data.message, { position: "top-center" });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.error("Decline invite error:", err_1);
                        react_toastify_1.toast.error("Không thể từ chối lời mời!", { position: "top-center" });
                        return [3 /*break*/, 5];
                    case 5:
                        // Chuyển hướng sau 3 giây
                        setTimeout(function () { return router.push("/"); }, 3000);
                        return [2 /*return*/];
                }
            });
        }); };
        declineInvite();
    }, [groupId, userId, router]);
    return (React.createElement(React.Fragment, null,
        React.createElement(head_1["default"], null,
            React.createElement("title", null, "Xin l\u1ED7i v\u00EC \u0111\u00E3 l\u00E0m phi\u1EC1n"),
            React.createElement("meta", { name: "description", content: "Xin l\u1ED7i v\u00EC \u0111\u00E3 l\u00E0m phi\u1EC1n b\u1EA1n!" })),
        React.createElement("div", { className: "min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-center p-4 pb-20" },
            React.createElement("div", { className: "w-full max-w-[576px] mx-auto text-center" },
                React.createElement("h1", { className: "text-3xl font-bold text-[#5BC5A7] mb-4" }, "Xin l\u1ED7i v\u00EC \u0111\u00E3 l\u00E0m phi\u1EC1n b\u1EA1n!"),
                React.createElement("p", { className: "text-lg text-gray-700" }, "B\u1EA1n s\u1EBD \u0111\u01B0\u1EE3c chuy\u1EC3n h\u01B0\u1EDBng v\u1EC1 trang ch\u00EDnh trong v\u00E0i gi\u00E2y...")))));
}
exports["default"] = DeclinePage;
