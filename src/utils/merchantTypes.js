import { UtensilsCrossed, ShoppingBasket, Pill, Flower2, Zap } from "lucide-react";

export const MERCHANT_TYPES = [
  { value: "", label: "Barchasi", icon: null },
  { value: "food", label: "Restoran", icon: UtensilsCrossed },
  { value: "grocery", label: "Do'kon", icon: ShoppingBasket },
  { value: "pharmacy", label: "Dorixona", icon: Pill },
  { value: "flowers", label: "Gullar", icon: Flower2 },
  { value: "express", label: "Ekspress", icon: Zap },
];

export function merchantTypeLabel(value) {
  return MERCHANT_TYPES.find((t) => t.value === value)?.label || value;
}
