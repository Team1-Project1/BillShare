import CardGroup from "@/components/card/CardGroup";
import { FiUsers } from "react-icons/fi";

interface Section3Props {
  onOpenModal: () => void; // Thêm prop để gọi hàm mở modal
}

export const Section3 = ({ onOpenModal }: Section3Props) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nhóm</h3>
      <div className="space-y-4">
        <CardGroup name="Du lịch Đà Lạt" memberCount={5} />
        <CardGroup name="Ăn uống" memberCount={3} />
      </div>
      <button
        onClick={onOpenModal} // Gọi hàm từ props để mở modal
        className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center pt-2 mt-4"
      >
        <FiUsers className="mr-2" /> Tạo nhóm
      </button>
    </div>
  );
};