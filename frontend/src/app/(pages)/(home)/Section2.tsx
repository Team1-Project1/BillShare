import { FiDollarSign } from "react-icons/fi";

export const Section2 = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Thanh toán</h3>
      <p className="text-gray-600 font-[700] text-lg mb-6 text-center">Overall, you are owed 500.000 VND</p>
      <button className="w-full h-12 bg-[#5BC5A7] text-white rounded-md text-base font-semibold hover:bg-[#4AA88C] transition-colors duration-300 flex items-center justify-center">
        <FiDollarSign className="mr-2" /> Settle Up
      </button>
    </div>
  );
};