import { Check } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUS_STEPS } from "../utils/format";

export default function OrderTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-tile border-2 border-pomegranate-light bg-pomegranate-light px-4 py-3 text-sm font-semibold text-pomegranate-dark">
        Bu buyurtma bekor qilingan
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <ol className="space-y-0">
      {ORDER_STATUS_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === ORDER_STATUS_STEPS.length - 1;
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[10px] font-bold transition ${
                  done ? "border-ceramic bg-ceramic text-white" : "border-ink/20 bg-white text-ink/30"
                }`}
              >
                {done && <Check size={12} />}
              </span>
              {!isLast && (
                <span className={`w-0.5 flex-1 ${done ? "bg-ceramic" : "bg-ink/10"}`} style={{ minHeight: 20 }} />
              )}
            </div>
            <p
              className={`pb-5 pt-0.5 text-sm ${
                done ? "font-semibold text-ink" : "text-ink/40"
              }`}
            >
              {ORDER_STATUS_LABEL[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
