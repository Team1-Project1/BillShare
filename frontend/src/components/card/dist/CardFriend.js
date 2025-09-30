"use strict";
exports.__esModule = true;
var fi_1 = require("react-icons/fi");
function CardFriend(_a) {
    var name = _a.name, status = _a.status;
    return (React.createElement("div", { className: "bg-white rounded-lg p-3 shadow-md border border-gray-200" },
        React.createElement("div", { className: "flex items-center" },
            React.createElement(fi_1.FiUser, { className: "text-[#5BC5A7] mr-2" }),
            React.createElement("div", null,
                React.createElement("h4", { className: "text-sm font-medium text-gray-900" }, name),
                React.createElement("p", { className: "text-xs text-gray-600" }, status)))));
}
exports["default"] = CardFriend;
