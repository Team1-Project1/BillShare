"use strict";
exports.__esModule = true;
var fi_1 = require("react-icons/fi");
function CardFriendEnhanced(_a) {
    var name = _a.name, debt = _a.debt, received = _a.received;
    var netAmount = received - debt;
    var amountColor = netAmount >= 0 ? "text-green-600" : "text-red-600";
    return (React.createElement("div", { className: "bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between" },
        React.createElement("div", { className: "flex items-center" },
            React.createElement(fi_1.FiUser, { className: "text-[#5BC5A7] mr-2" }),
            React.createElement("div", null,
                React.createElement("h4", { className: "text-sm font-medium text-gray-900" }, name),
                React.createElement("div", { className: "text-xs text-gray-600" },
                    React.createElement("p", null,
                        "N\u1EE3: ",
                        debt.toLocaleString(),
                        " \u0111"),
                    React.createElement("p", null,
                        "Nh\u1EADn: ",
                        received.toLocaleString(),
                        " \u0111")))),
        React.createElement("span", { className: "text-sm font-semibold " + amountColor },
            netAmount >= 0 ? "+" : "",
            netAmount.toLocaleString(),
            " \u0111")));
}
exports["default"] = CardFriendEnhanced;
