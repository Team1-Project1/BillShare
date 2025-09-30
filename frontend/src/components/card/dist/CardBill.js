"use strict";
exports.__esModule = true;
function CardBill(_a) {
    var name = _a.name, date = _a.date, amount = _a.amount;
    return (React.createElement("div", { className: "bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between" },
        React.createElement("div", null,
            React.createElement("h4", { className: "text-sm font-medium text-gray-900" }, name),
            React.createElement("p", { className: "text-xs text-gray-600" }, date)),
        React.createElement("span", { className: "text-sm font-semibold text-[#5BC5A7]" },
            amount.toLocaleString(),
            " \u0111")));
}
exports["default"] = CardBill;
