"use client";
"use strict";
exports.__esModule = true;
function ModalExpenseDetail(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, expenseId = _a.expenseId, groupId = _a.groupId;
    if (!isOpen)
        return null;
    return (React.createElement("div", null,
        React.createElement("button", { onClick: onClose, className: "mt-6 w-full py-2 rounded-md bg-[#5BC5A7] text-white font-semibold hover:bg-[#4AA88C] transition-colors duration-300" }, "\u0110\u00F3ng"),
        "Details"));
}
exports["default"] = ModalExpenseDetail;
