export const formatCurrency = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export const normalizeText = (value: string) =>
  value.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

export const shippingFor = (subtotal: number) => (subtotal === 0 || subtotal >= 500000 ? 0 : 30000);
