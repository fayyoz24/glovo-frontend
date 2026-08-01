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

// Har bir bo'lim uchun alohida bosh sahifa banner matni — "taomingiz yo'lda"
// degan umumiy matn endi faqat Restoran bo'limida ko'rinadi, boshqalarida
// (gullar, dorixona va h.k.) o'sha bo'limga mos matn chiqadi.
export const HOME_HERO_CONTENT = {
  "": {
    title: "Nimaga ehtiyojingiz bor — bir necha bosishda uyingizga",
    cta: "Yaqin atrofdagilarni ko'rish",
  },
  food: {
    title: "Sevimli taomingiz — bir necha bosishda uyingizga",
    cta: "Yaqin atrofdagi restoranlar",
  },
  grocery: {
    title: "Kundalik mahsulotlar — do'konga bormasdan uyingizga",
    cta: "Yaqin atrofdagi do'konlar",
  },
  pharmacy: {
    title: "Dori-darmon kerakmi? Tez va ishonchli yetkazamiz",
    cta: "Yaqin atrofdagi dorixonalar",
  },
  flowers: {
    title: "Chiroyli gullar dastasi — sevganlaringizga tez yetkazing",
    cta: "Yaqin atrofdagi gulchilar",
  },
  express: {
    title: "Har qanday narsa — eng tez yetkazib berish xizmati",
    cta: "Yaqin atrofdagi ekspress xizmatlar",
  },
};
