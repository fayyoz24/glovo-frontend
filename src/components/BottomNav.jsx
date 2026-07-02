import { NavLink } from "react-router-dom";
import { Home, Search, ShoppingBag, Receipt, User } from "lucide-react";
import { useCart } from "../context/CartContext";

const ITEMS = [
  { to: "/", label: "Bosh sahifa", icon: Home, end: true },
  { to: "/search", label: "Qidiruv", icon: Search },
  { to: "/cart", label: "Savat", icon: ShoppingBag, cart: true },
  { to: "/orders", label: "Buyurtmalar", icon: Receipt },
  { to: "/profile", label: "Profil", icon: User },
];

export default function BottomNav() {
  const { itemCount } = useCart();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink/10 bg-paper/95 backdrop-blur-sm sm:hidden">
      <ul className="flex items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ to, label, icon: Icon, end, cart }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${
                  isActive ? "text-marigold-dark" : "text-ink/50"
                }`
              }
            >
              <span className="relative">
                <Icon size={20} />
                {cart && itemCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-pomegranate px-0.5 text-[9px] font-bold text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
