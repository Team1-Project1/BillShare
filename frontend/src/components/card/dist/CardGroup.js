"use client";
"use strict";
exports.__esModule = true;
var fi_1 = require("react-icons/fi");
var link_1 = require("next/link");
function CardGroup(_a) {
    var groupId = _a.groupId, groupName = _a.groupName, description = _a.description, defaultCurrency = _a.defaultCurrency, _b = _a.memberCount, memberCount = _b === void 0 ? 0 : _b;
    return (React.createElement(link_1["default"], { href: "/group/detail/" + groupId, className: "block" },
        React.createElement("div", { className: "bg-white rounded-lg p-3 shadow-md border border-gray-200" },
            React.createElement("div", { className: "flex items-center" },
                React.createElement(fi_1.FiUsers, { className: "text-[#5BC5A7] mr-2" }),
                React.createElement("div", null,
                    React.createElement("h4", { className: "text-sm font-medium text-gray-900" }, groupName),
                    React.createElement("p", { className: "text-xs text-gray-600" }, description),
                    React.createElement("p", { className: "text-xs text-gray-500" },
                        "Ti\u1EC1n t\u1EC7: ",
                        defaultCurrency),
                    React.createElement("p", { className: "text-xs text-gray-600" },
                        memberCount,
                        " th\u00E0nh vi\u00EAn"))))));
}
exports["default"] = CardGroup;
