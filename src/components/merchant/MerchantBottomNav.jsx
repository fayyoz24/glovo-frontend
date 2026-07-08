import { NavLink } from "react-router-dom";
import { Bell, ListOrdered, History, Store } from "lucide-react";
import { useMerchant } from "../../context/MerchantContext";

export default function MerchantBottomNav() {
  const { newOrders } = useMerchant();
  const newCount = newOrders?.length ?? 0;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink/10 bg-paper/95 backdrop-blur-sm">
      <ul className="mx-auto flex max-w-5xl items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        <NavItem to="/merchant" label="Yangi" icon={Bell} end badge={newCount} />
        <NavItem to="/merchant/active" label="Faol" icon={ListOrdered} />
        <NavItem to="/merchant/history" label="Tarix" icon={History} />
        <NavItem to="/merchant/profile" label="Do'kon" icon={Store} />
      </ul>
    </nav>
  );
}

function NavItem({ to, label, icon: Icon, end, badge }) {
  return (
    <li className="flex-1">
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition ${
            isActive ? "text-ceramic-dark" : "text-ink/50"
          }`
        }
      >
        <span className="relative">
          <Icon size={20} />
          {!!badge && (
            <span className="absolute -right-2 -top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-pomegranate px-1 text-[9px] font-bold text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </span>
        {label}
      </NavLink>
    </li>
  );
}
