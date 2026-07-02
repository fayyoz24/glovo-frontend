import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="py-10">
      <EmptyState
        icon={Compass}
        title="Sahifa topilmadi"
        description="Siz izlayotgan sahifa mavjud emas yoki ko'chirilgan."
        action={
          <Link
            to="/"
            className="mt-2 rounded-full bg-marigold px-5 py-2.5 font-display text-sm text-ink shadow-tile"
          >
            Bosh sahifaga qaytish
          </Link>
        }
      />
    </div>
  );
}
