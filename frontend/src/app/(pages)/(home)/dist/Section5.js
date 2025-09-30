"use strict";
exports.__esModule = true;
exports.Section5 = void 0;
var fi_1 = require("react-icons/fi");
exports.Section5 = function () {
    var activities = [
        { id: 1, text: "Bạn đã thanh toán $50 cho nhóm 'Du lịch Đà Lạt'" },
        { id: 2, text: "Nguyễn Văn A đã thêm bạn vào nhóm 'Ăn uống'" },
    ];
    return (React.createElement("div", { className: "bg-white/90 backdrop-blur-sm p-4 shadow-md" },
        React.createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-2" }, "Ho\u1EA1t \u0111\u1ED9ng g\u1EA7n \u0111\u00E2y"),
        React.createElement("ul", { className: "space-y-2" }, activities.map(function (activity) { return (React.createElement("li", { key: activity.id, className: "text-gray-600 text-sm flex items-center" },
            React.createElement(fi_1.FiActivity, { className: "mr-2 text-[#5BC5A7]" }),
            " ",
            activity.text)); }))));
};
