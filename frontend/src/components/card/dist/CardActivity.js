"use strict";
exports.__esModule = true;
var framer_motion_1 = require("framer-motion");
var fi_1 = require("react-icons/fi");
function CardActivity(_a) {
    var activity = _a.activity;
    // Chuyển đổi actionType và entityType thành văn bản dễ hiểu
    var getActionText = function () {
        switch (activity.actionType.toLowerCase()) {
            case "create":
                return "đã tạo";
            case "update":
                return "đã cập nhật";
            case "delete":
                return "đã xóa";
            default:
                return activity.actionType;
        }
    };
    var getEntityText = function () {
        switch (activity.entityType.toLowerCase()) {
            case "expense":
                return "khoản chi";
            case "member":
                return "thành viên";
            default:
                return activity.entityType;
        }
    };
    // Format timestamp
    var formattedDate = new Date(activity.timestamp).toLocaleString("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
    return (React.createElement(framer_motion_1.motion.div, { className: "bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex items-center", initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, transition: { duration: 0.3 } },
        React.createElement(fi_1.FiActivity, { className: "text-[#5BC5A7] mr-3", size: 20 }),
        React.createElement("div", { className: "flex-1" },
            React.createElement("p", { className: "text-sm text-gray-800" },
                React.createElement("span", { className: "font-semibold" }, activity.userName || "Người dùng"),
                " ",
                getActionText(),
                " ",
                getEntityText(),
                " (ID: ",
                activity.entityId,
                ")"),
            React.createElement("p", { className: "text-xs text-gray-500" }, formattedDate))));
}
exports["default"] = CardActivity;
