import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Receipt, ChevronRight } from "lucide-react";
import { ordersApi } from "../api/orders";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { formatSum, formatDate } from "../utils/format";

const FILTERS = [
  { value: "", label: "Barchasi" },
  { value: "pending", label: "Faol" },
  { value: "delivered", label: "Yetkazilgan" },
  { value: "cancelled", label: "Bekor qilingan" },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi
      .list(filter || undefined)
      .then((data) => setOrders(data.results ?? data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl text-ink">Buyurtmalarim</h1>

      <div className="-mx-1 flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
              filter === f.value ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white text-ink/70"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full rounded-tile" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Buyurtmalar yo'q"
          description="Birinchi buyurtmangizni bering va u shu yerda ko'rinadi."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="flex items-center gap-3 rounded-tile border-2 border-ink/10 bg-white p-4 transition hover:border-ink/25"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-body text-sm font-semibold text-ink">
                    {o.merchant_name}
                  </h3>
                  <span className="font-mono text-xs text-ink/40">#{o.public_id}</span>
                </div>
                <p className="mt-0.5 text-xs text-ink/50">
                  {formatDate(o.placed_at)} · {o.item_count} mahsulot
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={o.status} />
                  <span className="font-mono text-sm font-semibold text-ceramic-dark">
                    {formatSum(o.total_amount)}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-ink/30" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
