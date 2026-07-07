import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListOrdered, Wallet, UserRound } from "lucide-react";

const ITEMS = [
  { to: "/courier", label: "Bosh sahifa", icon: LayoutDashboard, end: true },
  { to: "/courier/orders", label: "Buyurtmalar", icon: ListOrdered },
  { to: "/courier/earnings", label: "Daromad", icon: Wallet },
  { to: "/courier/profile", label: "Profil", icon: UserRound },
];

export default function CourierBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink/10 bg-paper/95 backdrop-blur-sm">
      <ul className="mx-auto flex max-w-5xl items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${
                  isActive ? "text-ceramic-dark" : "text-ink/50"
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
