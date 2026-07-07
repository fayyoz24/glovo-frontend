import { useEffect, useState } from "react";
import { Loader2, Wallet, Gift, HandCoins } from "lucide-react";
import { courierApi } from "../../api/courier";
import { formatSum, formatDate } from "../../utils/format";
import EmptyState from "../../components/EmptyState";

const PERIODS = [
  { value: 7, label: "7 kun" },
  { value: 30, label: "30 kun" },
  { value: 90, label: "90 kun" },
];

export default function CourierEarningsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    courierApi
      .earnings(days)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [days]);

  const summary = data?.summary;
  const history = data?.history || [];

  return (
    <div className="space-y-5 pb-6">
      <h1 className="font-display text-xl text-ink">Daromadlarim</h1>

      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setDays(p.value)}
            className={`flex-1 rounded-full border-2 py-2 text-sm font-semibold transition ${
              days === p.value ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white text-ink/70"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader2 className="animate-spin text-ink/40" size={26} />
        </div>
      ) : (
        <>
          <div className="rounded-tile border-2 border-ink/10 bg-white p-4">
            <p className="text-xs font-semibold text-ink/50">Jami daromad ({summary?.period_days} kun)</p>
            <p className="mt-1 font-display text-3xl text-ceramic-dark">
              {formatSum(summary?.total)}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <SummaryItem icon={Wallet} label="Baza" value={formatSum(summary?.base_fee)} />
              <SummaryItem icon={Gift} label="Bonus" value={formatSum(summary?.bonus)} />
              <SummaryItem icon={HandCoins} label="Choy puli" value={formatSum(summary?.tips)} />
            </div>
            <p className="mt-3 text-center text-xs text-ink/50">
              {summary?.deliveries ?? 0} ta yetkazish
            </p>
          </div>

          <section>
            <h2 className="mb-2 font-body text-sm font-bold text-ink">Tarix</h2>
            {history.length === 0 ? (
              <EmptyState icon={Wallet} title="Hali yozuv yo'q" />
            ) : (
              <div className="space-y-2">
                {history.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-tile border-2 border-ink/10 bg-white p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {e.order_public_id ? `#${e.order_public_id}` : e.note || "Bonus"}
                      </p>
                      <p className="text-xs text-ink/50">{formatDate(e.created_at)}</p>
                    </div>
                    <span className="shrink-0 font-display text-ceramic-dark">
                      {formatSum(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-paper p-2">
      <Icon size={14} className="mx-auto mb-1 text-ink/40" />
      <p className="font-semibold text-ink">{value}</p>
      <p className="text-[10px] text-ink/40">{label}</p>
    </div>
  );
}
