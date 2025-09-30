interface CardBillProps {
  name: string;
  date: string;
  amount: number;
}

export default function CardBill({ name, date, amount }: CardBillProps) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-md border border-gray-200 flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-900">{name}</h4>
        <p className="text-xs text-gray-600">{date}</p>
      </div>
      <span className="text-sm font-semibold text-[#5BC5A7]">
        {amount.toLocaleString()} đ
      </span>
    </div>
  );
}