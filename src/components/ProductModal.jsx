import { useEffect, useMemo, useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { catalogApi } from "../api/catalog";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { formatSum } from "../utils/format";
import QuantityStepper, { QtyIncrementPicker } from "./QuantityStepper";

export default function ProductModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [variantId, setVariantId] = useState(null);
  const [selected, setSelected] = useState({}); // groupId -> Set(optionId)
  const [qty, setQty] = useState(1);
  const [activeStep, setActiveStep] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { addItem } = useCart();
  const { isAuthed } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    catalogApi
      .productDetail(productId)
      .then((data) => {
        setProduct(data);
        const def = data.variants?.find((v) => v.is_default) || data.variants?.[0];
        setVariantId(def?.id ?? null);
        const initial = {};
        (data.modifier_groups || []).forEach((g) => {
          initial[g.id] = new Set();
        });
        setSelected(initial);
        setQty(1);
        setActiveStep(1);
      })
      .catch(() => {
        toast.error("Mahsulot topilmadi");
        onClose();
      })
      .finally(() => setLoading(false));
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeVariant = useMemo(
    () => product?.variants?.find((v) => v.id === variantId),
    [product, variantId]
  );

  const basePrice = useMemo(() => {
    if (!product) return 0;
    if (product.has_discount) return Number(product.discounted_price);
    return Number(product.base_price_display ?? product.base_price);
  }, [product]);

  const inStock = product ? product.in_stock !== false : true;
  const isOrderable = product ? product.is_available !== false && inStock : false;

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    let price = activeVariant ? Number(activeVariant.final_price) : basePrice;
    (product.modifier_groups || []).forEach((g) => {
      const chosen = selected[g.id];
      if (!chosen) return;
      g.options.forEach((o) => {
        if (chosen.has(o.id)) price += Number(o.price_delta);
      });
    });
    return price;
  }, [product, activeVariant, selected]);

  const toggleOption = (group, optionId) => {
    setSelected((prev) => {
      const next = { ...prev };
      const current = new Set(next[group.id]);
      const isRadio = group.max_select === 1;
      if (isRadio) {
        next[group.id] = current.has(optionId) && !group.required ? new Set() : new Set([optionId]);
      } else {
        if (current.has(optionId)) {
          current.delete(optionId);
        } else if (current.size < (group.max_select || Infinity)) {
          current.add(optionId);
        }
        next[group.id] = current;
      }
      return next;
    });
  };

  const missingRequired = useMemo(() => {
    if (!product) return false;
    return (product.modifier_groups || []).some(
      (g) => g.required && (!selected[g.id] || selected[g.id].size < (g.min_select || 1))
    );
  }, [product, selected]);

  const handleAdd = async () => {
    if (!isAuthed) {
      onClose();
      navigate("/login");
      return;
    }
    if (missingRequired) {
      toast.error("Majburiy variantlarni tanlang");
      return;
    }
    const modifier_option_ids = Object.values(selected).flatMap((set) => [...set]);
    setSubmitting(true);
    try {
      await addItem({
        product_id: product.id,
        qty,
        variant_id: variantId || undefined,
        modifier_option_ids,
        instructions,
      });
      onClose();
    } catch {
      // toast already shown by cart context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-tile bg-paper shadow-card sm:rounded-tile"
      >
        <div className="flex items-center justify-between border-b-2 border-ink/10 px-4 py-3">
          <h2 className="font-display text-base text-ink">Mahsulot</h2>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="grid h-8 w-8 place-items-center rounded-full bg-ink/5 text-ink hover:bg-ink/10"
          >
            <X size={16} />
          </button>
        </div>

        {loading || !product ? (
          <div className="grid flex-1 place-items-center py-16">
            <Loader2 className="animate-spin text-ink/40" size={26} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {product.image && (
                <img
                  src={product.image}
                  alt=""
                  className="mb-4 h-44 w-full rounded-tile object-cover"
                />
              )}
              <h3 className="font-display text-lg text-ink">{product.name_uz}</h3>
              {product.description_uz && (
                <p className="mt-1 text-sm text-ink/60">{product.description_uz}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <p className="font-mono text-base font-semibold text-ceramic-dark">
                  {formatSum(activeVariant ? activeVariant.final_price : basePrice)}
                  {product.unit_type === "kg" && <span className="text-sm font-normal text-ink/50"> / kg</span>}
                </p>
                {!activeVariant && product.has_discount && (
                  <>
                    <p className="font-mono text-sm text-ink/40 line-through">
                      {formatSum(product.base_price_display ?? product.base_price)}
                    </p>
                    <span className="rounded-full bg-pomegranate-light px-2 py-0.5 text-[10px] font-bold text-pomegranate-dark">
                      -{product.discount_percent}%
                    </span>
                  </>
                )}
              </div>
              {!inStock && (
                <p className="mt-1 text-xs font-semibold text-pomegranate">
                  Mahsulot omborda tugagan
                </p>
              )}

              {product.variants?.length > 1 && (
                <div className="mt-5">
                  <h4 className="mb-2 font-body text-sm font-bold text-ink">O'lcham / Tur</h4>
                  <div className="space-y-2">
                    {product.variants.map((v) => (
                      <label
                        key={v.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-3 py-2.5 text-sm transition ${
                          variantId === v.id
                            ? "border-ceramic bg-ceramic-light"
                            : "border-ink/10 bg-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="variant"
                            checked={variantId === v.id}
                            onChange={() => setVariantId(v.id)}
                            className="accent-ceramic"
                          />
                          {v.name_uz}
                        </span>
                        <span className="font-mono text-xs text-ink/60">
                          {formatSum(v.final_price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(product.modifier_groups || []).map((g) => (
                <div key={g.id} className="mt-5">
                  <h4 className="mb-2 flex items-center justify-between font-body text-sm font-bold text-ink">
                    {g.name_uz}
                    {g.required && (
                      <span className="rounded-full bg-pomegranate-light px-2 py-0.5 text-[10px] font-semibold text-pomegranate-dark">
                        Majburiy
                      </span>
                    )}
                  </h4>
                  <div className="space-y-2">
                    {g.options.map((o) => {
                      const checked = selected[g.id]?.has(o.id);
                      return (
                        <label
                          key={o.id}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-3 py-2.5 text-sm transition ${
                            checked ? "border-ceramic bg-ceramic-light" : "border-ink/10 bg-white"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`grid h-4 w-4 place-items-center rounded-full border-2 ${
                                checked ? "border-ceramic bg-ceramic" : "border-ink/30"
                              }`}
                            >
                              {checked && <Check size={10} className="text-white" />}
                            </span>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={!!checked}
                              onChange={() => toggleOption(g, o.id)}
                            />
                            {o.name_uz}
                          </span>
                          {Number(o.price_delta) > 0 && (
                            <span className="font-mono text-xs text-ink/60">
                              +{formatSum(o.price_delta)}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-5">
                <h4 className="mb-2 font-body text-sm font-bold text-ink">Izoh (ixtiyoriy)</h4>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Masalan: piyozsiz bo'lsin"
                  className="w-full rounded-xl border-2 border-ink/15 bg-white p-3 text-sm outline-none focus:border-ceramic"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 border-t-2 border-ink/10 bg-white px-4 py-3">
              {product.unit_type === "kg" && (
                <QtyIncrementPicker
                  increments={product.qty_increments || [1]}
                  activeStep={activeStep}
                  onSelect={setActiveStep}
                  disabled={submitting}
                />
              )}
              <div className="flex items-center gap-3">
                <QuantityStepper
                  qty={qty}
                  step={activeStep}
                  unitType={product.unit_type}
                  min={activeStep}
                  onDecrease={() => setQty((q) => Math.max(activeStep, +(q - activeStep).toFixed(2)))}
                  onIncrease={() => setQty((q) => +(q + activeStep).toFixed(2))}
                />
                <button
                  onClick={handleAdd}
                  disabled={submitting || !isOrderable}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-marigold py-3 font-display text-sm text-ink shadow-tile transition hover:bg-marigold-dark disabled:opacity-40"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {isOrderable
                    ? `Savatga qo'shish · ${formatSum(unitPrice * qty)}`
                    : "Mavjud emas"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
