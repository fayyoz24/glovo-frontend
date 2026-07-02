import { Star } from "lucide-react";

export default function RatingStars({ value = 0, size = 14, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === "function";
  return (
    <div className="inline-flex items-center gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(s)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={`${s} yulduz`}
        >
          <Star
            size={size}
            className={s <= Math.round(value) ? "fill-marigold text-marigold" : "fill-none text-ink/25"}
          />
        </button>
      ))}
    </div>
  );
}
