import { motion } from "framer-motion";
import { FiDollarSign, FiUser, FiUsers, FiActivity } from "react-icons/fi";

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
      default: return activity.entityType;
    }
  };

  const getIcon = () => {
    switch (activity.entityType.toLowerCase()) {
      case "expense": return <FiDollarSign className="text-[#5BC5A7]" size={18} />;
      case "member": return <FiUser className="text-[#5BC5A7]" size={18} />;
      case "group": return <FiUsers className="text-[#5BC5A7]" size={18} />;
      default: return <FiActivity className="text-[#5BC5A7]" size={18} />;
    }
  };

  const formattedDate = new Date(activity.timestamp).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex items-center hover:shadow-md transition-all duration-200"
    >
      <div className="bg-[#5BC5A7]/10 p-2 rounded-full mr-3">
        {getIcon()}
      </div>
      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">{activity.userName}</span>{" "}
            {getActionText()}{" "}
            <span className="font-medium">{getEntityText()}</span>
            {activity.entityType === "expense" && (
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