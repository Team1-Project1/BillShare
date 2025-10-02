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
exports.fetchWithAuth = void 0;
function fetchWithAuth(url, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, Promise, function () {
        var accessToken, refreshToken, doFetch, response, refreshRes, data, newAccessToken, newRefreshToken;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accessToken = localStorage.getItem("accessToken");
                    refreshToken = localStorage.getItem("refreshToken");
                    doFetch = function (token) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, fetch(url, __assign(__assign({}, options), { headers: __assign(__assign({}, (options.headers || {})), { "Content-Type": "application/json", "Authorization": token ? "Bearer " + token : "" }) }))];
                        });
                    }); };
                    return [4 /*yield*/, doFetch(accessToken)];
                case 1:
                    response = _a.sent();
                    if (!(response.status === 401 || response.status === 403)) return [3 /*break*/, 8];
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
                    data = _a.sent();
                    newAccessToken = data.accessToken;
                    newRefreshToken = data.refreshToken;
                    if (!(newAccessToken && newRefreshToken)) return [3 /*break*/, 5];
                    localStorage.setItem("accessToken", newAccessToken);
                    localStorage.setItem("refreshToken", newRefreshToken);
                    return [4 /*yield*/, doFetch(newAccessToken)];
                case 4:
                    response = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    localStorage.clear();
                    window.location.href = "/login";
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    localStorage.clear();
                    window.location.href = "/login";
                    _a.label = 8;
                case 8: return [2 /*return*/, response];
            }
        });
    });
}
exports.fetchWithAuth = fetchWithAuth;
