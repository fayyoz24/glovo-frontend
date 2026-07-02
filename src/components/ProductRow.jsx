import { Plus } from "lucide-react";
import { formatSum } from "../utils/format";

export default function ProductRow({ product, onOpen }) {
  const image = product.images?.[0]?.image;
  const unavailable = product.is_available === false;
  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      disabled={unavailable}
      className="flex w-full items-center gap-3 rounded-tile border-2 border-ink/10 bg-white p-3 text-left transition hover:border-marigold disabled:opacity-50"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-ink/30">
            <Plus size={20} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-body text-sm font-semibold text-ink">{product.name_uz}</h4>
        {product.category_name && (
          <p className="truncate text-xs text-ink/50">{product.category_name}</p>
        )}
        <p className="mt-1 font-mono text-sm font-semibold text-ceramic-dark">
          {formatSum(product.base_price)}
        </p>
        {unavailable && <p className="text-xs font-semibold text-pomegranate">Tugagan</p>}
      </div>
      {!unavailable && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-marigold text-ink">
          <Plus size={16} />
        </span>
      )}
    </button>
  );
}
