import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { merchantTypeLabel } from "../utils/merchantTypes";

export default function MerchantCard({ merchant }) {
  // is_closed backendda filial ish vaqti + accepting_orders holatidan hisoblanadi
  // (merchant.status esa do'konning umumiy hisob holati — active/suspended/pending —
  // bo'lib, "hozir yopiqmi" degan savolga javob bermaydi).
  const closed = !!merchant.is_closed;
  return (
    <Link
      to={`/merchants/${merchant.id}`}
      className="group overflow-hidden rounded-tile border-2 border-ink/10 bg-white shadow-tile transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-card"
    >
      <div className="relative h-28 w-full overflow-hidden bg-sand">
        {merchant.cover ? (
          <img
            src={merchant.cover}
            alt=""
            className={`h-full w-full object-cover transition group-hover:scale-105 ${closed ? "blur-[2px] grayscale" : ""}`}
          />
        ) : merchant.logo ? (
          <img
            src={merchant.logo}
            alt=""
            className={`h-full w-full object-cover transition group-hover:scale-105 ${closed ? "blur-[2px] grayscale" : ""}`}
          />
        ) : (
          <div
            className={`grid h-full w-full place-items-center bg-gradient-to-br from-marigold-light to-sand font-display text-2xl text-marigold-dark ${closed ? "blur-[2px] grayscale" : ""}`}
          >
            {merchant.name?.[0]?.toUpperCase()}
          </div>
        )}
        {closed && (
          <div className="absolute inset-0 grid place-items-center bg-ink/50">
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-paper">
              Yopiq
            </span>
          </div>
        )}
        {merchant.cover && merchant.logo && (
          <div className="absolute -bottom-4 left-3 grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-white shadow-tile">
            <img src={merchant.logo} alt="" className="h-full w-full object-contain" />
          </div>
        )}
      </div>
      <div className={`space-y-1 p-3 ${merchant.cover && merchant.logo ? "pt-5" : ""}`}>
        <h3 className="truncate font-display text-sm text-ink">{merchant.name}</h3>
        <div className="flex items-center justify-between text-xs text-ink/60">
          <span>{merchantTypeLabel(merchant.type)}</span>
          <span className="inline-flex items-center gap-0.5 font-semibold text-ink">
            <Star size={12} className="fill-marigold text-marigold" />
            {Number(merchant.rating_avg || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
