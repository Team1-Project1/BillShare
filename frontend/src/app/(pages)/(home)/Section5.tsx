import { FiActivity } from "react-icons/fi";

export const Section5 = () => {
  const activities = [
    { id: 1, text: "Bạn đã thanh toán $50 cho nhóm 'Du lịch Đà Lạt'" },
    { id: 2, text: "Nguyễn Văn A đã thêm bạn vào nhóm 'Ăn uống'" },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Hoạt động gần đây</h3>
      <ul className="space-y-2">
        {activities.map((activity) => (
          <li key={activity.id} className="text-gray-600 text-sm flex items-center">
            <FiActivity className="mr-2 text-[#5BC5A7]" /> {activity.text}
          </li>
        ))}
      </ul>
    </div>
  );
};