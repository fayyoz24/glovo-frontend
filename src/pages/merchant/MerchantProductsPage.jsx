import { useEffect, useMemo, useState } from "react";
import { Loader2, Package, Plus, Pencil, X, Check, EyeOff, Eye } from "lucide-react";
import { merchantApi } from "../../api/merchant";
import { useToast } from "../../context/ToastContext";
import { formatSum } from "../../utils/format";
import EmptyState from "../../components/EmptyState";

function flattenCategories(categories, depth = 0) {
  return categories.flatMap((c) => [
    { id: c.id, label: `${"— ".repeat(depth)}${c.name_uz}` },
    ...(c.children?.length ? flattenCategories(c.children, depth + 1) : []),
  ]);
}

export default function MerchantProductsPage() {
  const toast = useToast();

  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  const load = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        merchantApi.products(),
        merchantApi.categories(),
      ]);
      setProducts(productsRes?.results ?? productsRes ?? []);
      setCategories(categoriesRes ?? []);
    } catch (err) {
      toast.error(err.message || "Yuklab bo'lmadi");
      setProducts([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleAvailability = async (product) => {
    try {
      await merchantApi.toggleProductAvailability(product.id, !product.is_available);
      setProducts((list) =>
        list.map((p) => (p.id === product.id ? { ...p, is_available: !p.is_available } : p))
      );
    } catch (err) {
      toast.error(err.message || "Amalga oshmadi");
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl text-ink">Mahsulotlar</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-full bg-ceramic px-3.5 py-2 text-xs font-display text-white shadow-tile"
          >
            <Plus size={15} /> Qo'shish
          </button>
        )}
      </div>

      {showAddForm && (
        <ProductForm
          categoryOptions={categoryOptions}
          onCancel={() => setShowAddForm(false)}
          onSaved={(product) => {
            const normalized = { ...product, category_name: product.category?.name_uz };
            setProducts((list) => [normalized, ...(list || [])]);
            setShowAddForm(false);
            toast.success("Mahsulot qo'shildi");
          }}
        />
      )}

      {products === null ? (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader2 className="animate-spin text-ink/40" size={26} />
        </div>
      ) : products.length === 0 && !showAddForm ? (
        <EmptyState
          icon={Package}
          title="Hali mahsulot yo'q"
          description="Yuqoridagi 'Qo'shish' tugmasi orqali birinchi mahsulotingizni qo'shing."
        />
      ) : (
        <div className="space-y-2">
          {products.map((product) =>
            editingId === product.id ? (
              <ProductForm
                key={product.id}
                product={product}
                categoryOptions={categoryOptions}
                onCancel={() => setEditingId(null)}
                onSaved={(updated) => {
                  const normalized = { ...updated, category_name: updated.category?.name_uz };
                  setProducts((list) =>
                    list.map((p) => (p.id === normalized.id ? { ...p, ...normalized } : p))
                  );
                  setEditingId(null);
                  toast.success("Saqlandi");
                }}
              />
            ) : (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-tile border-2 border-ink/10 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{product.name_uz}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink/50">
                    <span className="font-display text-ceramic-dark">
                      {formatSum(product.base_price)}
                    </span>
                    {product.category_name && <span>· {product.category_name}</span>}
                    {!product.is_available && (
                      <span className="text-pomegranate-dark">· Vaqtincha tugagan</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleAvailability(product)}
                  aria-label={product.is_available ? "Vaqtincha o'chirish" : "Qayta yoqish"}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                    product.is_available ? "text-ink/40 hover:bg-ink/5" : "bg-pomegranate-light text-pomegranate-dark"
                  }`}
                >
                  {product.is_available ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => setEditingId(product.id)}
                  aria-label="Tahrirlash"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-ink/5"
                >
                  <Pencil size={15} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, categoryOptions, onCancel, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(product);

  const [form, setForm] = useState({
    name_uz: product?.name_uz || "",
    name_ru: product?.name_ru || "",
    category: product?.category?.id || "",
    base_price: product?.base_price ?? "",
    description_uz: product?.description_uz || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name_uz.trim() || !form.base_price) {
      toast.error("Nomi va narxini kiriting");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name_uz: form.name_uz.trim(),
        name_ru: form.name_ru.trim() || form.name_uz.trim(),
        base_price: Number(form.base_price),
        description_uz: form.description_uz.trim(),
        ...(form.category ? { category: form.category } : {}),
      };
      const saved = isEdit
        ? await merchantApi.updateProduct(product.id, payload)
        : await merchantApi.createProduct(payload);
      onSaved(saved);
    } catch (err) {
      toast.error(err.message || "Saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-tile border-2 border-ceramic/30 bg-white p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">Nomi (uz)</label>
          <input
            value={form.name_uz}
            onChange={(e) => setForm((f) => ({ ...f, name_uz: e.target.value }))}
            placeholder="Osh"
            className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">Nomi (ru)</label>
          <input
            value={form.name_ru}
            onChange={(e) => setForm((f) => ({ ...f, name_ru: e.target.value }))}
            placeholder="Плов"
            className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">Narxi (so'm)</label>
          <input
            type="number"
            min={0}
            value={form.base_price}
            onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value }))}
            placeholder="25000"
            className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink/60">Kategoriya</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
          >
            <option value="">Tanlanmagan</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-ink/60">
          Tavsif <span className="font-normal text-ink/40">(ixtiyoriy)</span>
        </label>
        <textarea
          value={form.description_uz}
          onChange={(e) => setForm((f) => ({ ...f, description_uz: e.target.value }))}
          rows={2}
          className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink/10 py-2 text-sm font-semibold text-ink/60"
        >
          <X size={15} /> Bekor qilish
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ceramic py-2 text-sm font-display text-white disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          Saqlash
        </button>
      </div>
    </form>
  );
}
