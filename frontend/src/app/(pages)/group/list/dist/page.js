"use strict";
exports.__esModule = true;
exports.metadata = void 0;
var GroupList_1 = require("./GroupList");
var BottomNav_1 = require("@/components/Footer/BottomNav");
var Section1_1 = require("../../(home)/Section1");
exports.metadata = {
    title: "Danh sách nhóm",
    description: "Mô tả trang danh sách nhóm..."
};
function GroupListPage() {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "min-h-screen bg-[radial-gradient(circle_at_right_center,rgba(91,197,167,0.8),rgba(0,0,0,0)_70%)] flex flex-col items-center justify-start p-4 pb-20" },
            React.createElement("div", { className: "w-full max-w-[576px] mx-auto" },
                React.createElement(Section1_1.Section1, null),
                React.createElement("div", { className: "bg-[#F8F8F8]" },
                    React.createElement(GroupList_1["default"], null))),
            React.createElement(BottomNav_1.BottomNav, null))));
}
exports["default"] = GroupListPage;
