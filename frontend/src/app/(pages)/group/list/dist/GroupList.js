"use strict";
exports.__esModule = true;
exports.metadata = void 0;
var CardGroup_1 = require("@/components/card/CardGroup");
exports.metadata = {
    title: "Danh sách nhóm",
    description: "Mô tả trang danh sách nhóm..."
};
function GroupList() {
    var sampleGroups = [
        { name: "Nhóm A", memberCount: 5 },
        { name: "Nhóm B", memberCount: 8 },
        { name: "Nhóm C", memberCount: 3 },
    ];
    return (React.createElement("div", { className: "min-h-screen bg-gray-100 py-6 px-4", style: { maxWidth: "576px", margin: "0 auto" } },
        React.createElement("h1", { className: "text-2xl font-bold text-[#5BC5A7] mb-6" }, "Danh s\u00E1ch nh\u00F3m"),
        React.createElement("div", { className: "space-y-4" }, sampleGroups.map(function (group, index) { return (React.createElement(CardGroup_1["default"], { key: index, name: group.name, memberCount: group.memberCount })); }))));
}
exports["default"] = GroupList;
