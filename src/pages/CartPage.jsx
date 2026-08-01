import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, Tag, Loader2, ArrowRight, PlusCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatSum } from "../utils/format";
import EmptyState from "../components/EmptyState";
import QuantityStepper from "../components/QuantityStepper";

export default function CartPage() {
  const { cart, loading, busyItemId, updateItem, removeItem, applyPromo, clearCart } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const hasItems = cart?.items?.length > 0;

  const submitPromo = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setApplying(true);
    try {
      await applyPromo(promoInput.trim());
      setPromoInput("");
    } finally {
      setApplying(false);
    }
  };

  if (loading && !cart) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-24 w-full rounded-tile" />
        ))}
      </div>
    );
  }

  if (!hasItems) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Savatingiz bo'sh"
        description="Kerakli mahsulotlaringizni tanlang va bu yerga qo'shing."
        action={
          <Link
            to="/"
            className="mt-2 rounded-full bg-marigold px-5 py-2.5 font-display text-sm text-ink shadow-tile transition hover:bg-marigold-dark"
          >
            Do'konlarni ko'rish
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-ink">Savat</h1>
          <p className="text-sm text-ink/50">{cart.merchant_name}</p>
        </div>
        <button
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-pomegranate hover:underline"
        >
          <Trash2 size={14} /> Tozalash
        </button>
      </div>

      <div className="space-y-3">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="rounded-tile border-2 border-ink/10 bg-white p-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-body text-sm font-semibold text-ink">
                  {item.product_name}
                </h3>
                {item.variant_name && (
                  <p className="text-xs text-ink/50">{item.variant_name}</p>
                )}
                {item.modifiers?.length > 0 && (
                  <p className="mt-0.5 truncate text-xs text-ink/50">
                    {item.modifiers.map((m) => m.name_uz).join(", ")}
                  </p>
                )}
                {item.instructions && (
                  <p className="mt-0.5 truncate text-xs italic text-ink/40">
                    "{item.instructions}"
                  </p>
                )}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                aria-label="O'chirish"
                disabled={busyItemId === item.id}
                className="shrink-0 text-ink/30 hover:text-pomegranate"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <QuantityStepper
                qty={item.qty}
                busy={busyItemId === item.id}
                step={item.qty_step || 1}
                unitType={item.unit_type}
                onDecrease={() => {
                  const step = Number(item.qty_step || 1);
                  const next = +(Number(item.qty) - step).toFixed(2);
                  next > 0 ? updateItem(item.id, next) : removeItem(item.id);
                }}
                onIncrease={() => {
                  const step = Number(item.qty_step || 1);
                  updateItem(item.id, +(Number(item.qty) + step).toFixed(2));
                }}
              />
              <span className="font-mono text-sm font-semibold text-ceramic-dark">
                {formatSum(item.line_total)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submitPromo} className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-4 py-2.5">
          <Tag size={15} className="text-ink/40" />
          <input
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            placeholder={cart.coupon_code || "Promokod"}
            className="flex-1 bg-transparent text-sm uppercase outline-none placeholder:normal-case placeholder:text-ink/40"
          />
        </div>
        <button
          type="submit"
          disabled={applying || !promoInput.trim()}
          className="rounded-full border-2 border-ink bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-paper disabled:opacity-40"
        >
          {applying ? <Loader2 size={15} className="animate-spin" /> : "Qo'llash"}
        </button>
      </form>

      <div className="space-y-2 rounded-tile border-2 border-ink/10 bg-white p-4 text-sm">
        <Row label="Mahsulotlar" value={cart.subtotal} />
        {Number(cart.discount_amount) > 0 && (
          <Row label="Chegirma" value={-cart.discount_amount} highlight="text-pomegranate" />
        )}
        <Row label="Yetkazib berish" value={cart.delivery_fee} />
        {Number(cart.service_fee) > 0 && <Row label="Xizmat haqi" value={cart.service_fee} />}
        <div className="my-1 border-t-2 border-dashed border-ink/10" />
        <Row label="Jami" value={cart.total} bold />
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex w-full items-center justify-center gap-2 rounded-tile border-2 border-dashed border-ink/15 bg-marigold/10 py-3 font-body text-sm font-semibold text-ink/70 transition hover:border-marigold hover:bg-marigold/20 hover:text-ink"
      >
        <PlusCircle size={16} className="text-marigold-dark" />
        Buyurtma qilishdan avval hech narsa esdan chiqmadimi?
      </button>

      <button
        onClick={() => navigate("/checkout")}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold py-3.5 font-display text-sm text-ink shadow-tile transition hover:bg-marigold-dark"
      >
        Buyurtma berish <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Row({ label, value, bold, highlight }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold text-ink" : "text-ink/70"}`}>
      <span>{label}</span>
      <span className={`font-mono ${highlight || ""}`}>{formatSum(value)}</span>
    </div>
  );
}
