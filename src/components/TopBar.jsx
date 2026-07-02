import { Link, NavLink } from "react-router-dom";
import { Search, ShoppingBag, Bell, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function TopBar() {
  const { itemCount } = useCart();
  const { isAuthed, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink/10 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-tile bg-ink text-marigold font-display text-sm">
            D
          </span>
          <span className="hidden font-display text-lg tracking-tight text-ink sm:block">
            Dasturxon
          </span>
        </Link>

        <Link
          to="/search"
          className="flex flex-1 items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm text-ink/50 transition hover:border-ink/30"
        >
          <Search size={16} />
          Taom yoki do'kon qidirish
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm font-semibold transition ${
                isActive ? "bg-ink text-paper" : "text-ink/70 hover:bg-ink/5"
              }`
            }
          >
            Buyurtmalar
          </NavLink>
        </nav>

        <Link
          to="/cart"
          aria-label="Savat"
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink/15 bg-white text-ink transition hover:border-marigold"
        >
          <ShoppingBag size={18} />
          {itemCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-pomegranate px-1 text-[10px] font-bold text-white">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </Link>

        <Link
          to={isAuthed ? "/profile" : "/login"}
          className="hidden shrink-0 items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-marigold sm:flex"
        >
          <User size={16} />
          {isAuthed ? user?.full_name?.split(" ")[0] || "Profil" : "Kirish"}
        </Link>
      </div>
    </header>
  );
}
