import { useEffect, useState } from "react";
import { Loader2, ListOrdered, Store } from "lucide-react";
import { courierApi } from "../../api/courier";
import { formatDate } from "../../utils/format";
import EmptyState from "../../components/EmptyState";

const ASSIGNMENT_STATUS_LABEL = {
  offered: "Taklif qilingan",
  accepted: "Qabul qilingan",
  rejected: "Rad etilgan",
  expired: "Muddati tugagan",
  completed: "Yakunlangan",
};

const ASSIGNMENT_STATUS_TONE = {
  offered: "bg-marigold-light text-marigold-dark",
  accepted: "bg-ceramic-light text-ceramic-dark",
  completed: "bg-ink text-paper",
  rejected: "bg-pomegranate-light text-pomegranate-dark",
  expired: "bg-pomegranate-light text-pomegranate-dark",
};

export default function CourierOrdersPage() {
  const [assignments, setAssignments] = useState(null);

  useEffect(() => {
    courierApi
      .assignmentHistory()
      .then(setAssignments)
      .catch(() => setAssignments([]));
  }, []);

  return (
    <div className="space-y-4 pb-6">
      <h1 className="font-display text-xl text-ink">Buyurtmalar tarixi</h1>

      {assignments === null ? (
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="animate-spin text-ink/40" size={26} />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title="Hali buyurtma yo'q"
          description="Onlayn bo'lib birinchi buyurtmangizni qabul qiling."
        />
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-tile border-2 border-ink/10 bg-white p-4"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand text-ink/60">
                <Store size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{a.merchant_name}</p>
                <p className="text-xs text-ink/50">
                  #{a.order_public_id} · {formatDate(a.assigned_at)}
                  {a.distance_km != null && ` · ~${a.distance_km} km`}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  ASSIGNMENT_STATUS_TONE[a.status] || "bg-sand text-ink"
                }`}
              >
                {ASSIGNMENT_STATUS_LABEL[a.status] || a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
