// src/components/card/CardActivity.tsx
import { motion } from "framer-motion";
import { FiDollarSign, FiUser, FiUsers, FiActivity } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface Activity {
  transactionId: number;
  groupId: number;
  groupName: string;
  userId: number;
  userName: string;
  actionType: string;
  entityType: string;
  entityId: number;
  timestamp: string;
}

interface CardActivityProps {
  activity: Activity;
}

export default function CardActivity({ activity }: CardActivityProps) {
  const router = useRouter();

  const getActionText = () => {
    switch (activity.actionType.toLowerCase()) {
      case "create": return "đã tạo";
      case "update": return "đã cập nhật";
      case "delete": return "đã xóa";
      default: return activity.actionType;
    }
  };

  const getEntityText = () => {
    switch (activity.entityType.toLowerCase()) {
      case "expense": return "khoản chi";
      case "member": return "thành viên";
      case "group": return "nhóm";
      case "payment": return "khoản thanh toán";
      default: return activity.entityType;
    }
  };

  const getIcon = () => {
    switch (activity.entityType.toLowerCase()) {
      case "expense": return <FiDollarSign className="text-[#5BC5A7]" size={18} />;
      case "member": return <FiUser className="text-[#5BC5A7]" size={18} />;
      case "group": return <FiUsers className="text-[#5BC5A7]" size={18} />;
      case "payment": return <FiDollarSign className="text-green-600" size={18} />;
      default: return <FiActivity className="text-[#5BC5A7]" size={18} />;
    }
  };

  const formattedDate = new Date(activity.timestamp).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const isDeleted = activity.actionType.toLowerCase() === "delete";

  const handleClick = () => {
    if (activity.entityType.toLowerCase() === "expense") {
      router.push(
        `/activities/expense-detail?groupId=${activity.groupId}&expenseId=${activity.entityId}&actionType=${activity.actionType}`
      );
    } else if (activity.entityType.toLowerCase() === "payment") {
      router.push(
        `/activities/payment-detail?groupId=${activity.groupId}&paymentId=${activity.entityId}&actionType=${activity.actionType}`
      );
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
      className={`bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex items-center hover:shadow-md transition-all duration-200 cursor-pointer ${
        isDeleted ? "opacity-70" : ""
      } ${["payment", "group"].includes(activity.entityType.toLowerCase()) ? "hover:bg-gray-100" : ""}`}
    >
      <div className="bg-[#5BC5A7]/10 p-2 rounded-full mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">{activity.userName}</span>{" "}
            <span className={isDeleted ? "text-red-600" : ""}>
              {getActionText()}
            </span>{" "}
            <span className="font-medium">{getEntityText()}</span>
            {["expense", "payment"].includes(activity.entityType) && (
              <span className="text-gray-500"> #{activity.entityId}</span>
            )}
          </p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-700">
            Nhóm: {activity.groupName}
          </p>
        </div>
      </div>
    </motion.div>
  );
}