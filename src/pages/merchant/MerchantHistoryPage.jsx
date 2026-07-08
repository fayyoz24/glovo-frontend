import { useEffect, useState } from "react";
import { Loader2, ListOrdered } from "lucide-react";
import { merchantApi } from "../../api/merchant";
import { formatSum, formatDate } from "../../utils/format";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

export default function MerchantHistoryPage() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    merchantApi
      .orders()
      .then((data) => setOrders(data?.results ?? data ?? []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <div className="space-y-4 pb-6">
      <h1 className="font-display text-xl text-ink">Buyurtmalar tarixi</h1>

      {orders === null ? (
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="animate-spin text-ink/40" size={26} />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title="Hali buyurtma yo'q"
          description="Qabul qilingan barcha buyurtmalar shu yerda saqlanadi."
        />
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center gap-3 rounded-tile border-2 border-ink/10 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">#{o.public_id}</p>
                <p className="text-xs text-ink/50">
                  {formatDate(o.placed_at)} · {formatSum(o.total_amount)}
                </p>
              </div>
              <StatusBadge status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
