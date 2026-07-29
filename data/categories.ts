import type { CategoryId } from "@/types";

export const categories: Array<{ id: "all" | CategoryId; label: string }> = [
  { id: "all", label: "Tất cả" },
  { id: "gom", label: "Gốm thủ công" },
  { id: "may-dan", label: "Mây đan" },
  { id: "go", label: "Đồ gỗ" },
  { id: "trang-tri", label: "Trang trí" },
];
