export interface Category {
  category_id: number;
  category_name: string;
  icon: string;
}

export const categories: Category[] = [
  { category_id: 1, category_name: "Nhà hàng", icon: "🍽️" },
  { category_id: 2, category_name: "Quán café", icon: "☕" },
  { category_id: 3, category_name: "Bar & Pub", icon: "🍺" },
  { category_id: 4, category_name: "Giao đồ ăn", icon: "🛵" },
  { category_id: 5, category_name: "Siêu thị", icon: "🛒" },
  { category_id: 6, category_name: "Tiền thuê nhà", icon: "🏠" },
  { category_id: 7, category_name: "Điện", icon: "💡" },
  { category_id: 8, category_name: "Nước", icon: "💧" },
  { category_id: 9, category_name: "Internet", icon: "📶" },
  { category_id: 10, category_name: "Xăng xe", icon: "⛽" },
  { category_id: 11, category_name: "Taxi/Grab", icon: "🚕" },
  { category_id: 12, category_name: "Xe buýt", icon: "🚌" },
  { category_id: 13, category_name: "Quần áo", icon: "👕" },
  { category_id: 14, category_name: "Điện tử", icon: "💻" },
  { category_id: 15, category_name: "Y tế", icon: "⚕️" },
  { category_id: 16, category_name: "Phòng gym", icon: "🏋️" },
  { category_id: 17, category_name: "Du lịch", icon: "🗺️" },
  { category_id: 18, category_name: "Quà tặng", icon: "🎁" },
  { category_id: 19, category_name: "Khác", icon: "📝" },
];
