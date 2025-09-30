import CardFriend from "@/components/card/CardFriend";
import { FiUserPlus } from "react-icons/fi";

interface Section4Props {
  onOpenModal: () => void; // Prop để gọi hàm mở modal
}

export const Section4 = ({ onOpenModal }: Section4Props) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Thêm bạn bè</h3>
      <div className="space-y-4">
        <CardFriend name="Nguyễn Văn A" status="Online" />
        <CardFriend name="Trần Thị B" status="Offline" />
      </div>
      <button
        onClick={onOpenModal} // Gọi hàm từ props để mở modal
        className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center pt-2 mt-4"
      >
        <FiUserPlus className="mr-2" /> Thêm bạn
      </button>
    </div>
  );
};