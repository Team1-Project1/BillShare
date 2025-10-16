"use client";
"use strict";
exports.__esModule = true;
var fi_1 = require("react-icons/fi");
function CardFriendEnhanced(_a) {
    var name = _a.name, debt = _a.debt, isOwed = _a.isOwed, currency = _a.currency, isLoading = _a.isLoading;
    return (React.createElement("div", { className: "bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between" },
        React.createElement("div", { className: "flex items-center" },
            React.createElement(fi_1.FiUser, { className: "text-[#5BC5A7] mr-2" }),
            React.createElement("div", null,
                React.createElement("h4", { className: "text-sm font-medium text-gray-900" }, name),
                React.createElement("p", { className: "text-xs text-gray-600" }, isLoading ? "Đang tải..."
                    : debt === 0
                        ? "Không nợ"
                        : isOwed
                            ? "N\u1EE3 b\u1EA1n: " + debt.toLocaleString() + " " + currency
                            : "B\u1EA1n n\u1EE3: " + debt.toLocaleString() + " " + currency))),
        React.createElement("span", { className: "text-sm font-semibold " + (isLoading ? "text-gray-600" : !isOwed ? "text-red-600" : "text-green-600") }, isLoading ? "Đang tải..."
            : debt === 0
                ? debt.toLocaleString() + " " + currency
                : !isOwed
                    ? "-" + debt.toLocaleString() + " " + currency
                    : "+" + debt.toLocaleString() + " " + currency)));
}
exports["default"] = CardFriendEnhanced;
