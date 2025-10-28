import { motion } from "framer-motion";
import { FiActivity } from "react-icons/fi";

interface Activity {
  transactionId: number;
  groupId: number;
  userId: number;
  actionType: string;
  entityType: string;
  entityId: number;
  timestamp: string;
  userName?: string; // Tên người dùng, lấy từ members nếu có
}

interface CardActivityProps {
  activity: Activity;
}

export default function CardActivity({ activity }: CardActivityProps) {
  // Chuyển đổi actionType và entityType thành văn bản dễ hiểu
  const getActionText = () => {
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

  const getEntityText = () => {
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
  const formattedDate = new Date(activity.timestamp).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <motion.div
      className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex items-center"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <FiActivity className="text-[#5BC5A7] mr-3" size={20} />
      <div className="flex-1">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{activity.userName || "Người dùng"}</span>{" "}
          {getActionText()} {getEntityText()} (ID: {activity.entityId})
        </p>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
    </motion.div>
  );
}