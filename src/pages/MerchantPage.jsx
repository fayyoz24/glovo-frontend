import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, Clock, MapPin, Search, X } from "lucide-react";
import { merchantsApi } from "../api/merchants";
import { catalogApi } from "../api/catalog";
import ProductRow from "../components/ProductRow";
import { ProductRowSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import ProductModal from "../components/ProductModal";
import { merchantTypeLabel } from "../utils/merchantTypes";

export default function MerchantPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [merchant, setMerchant] = useState(null);
  const [branchId, setBranchId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingMerchant, setLoadingMerchant] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeProductId, setActiveProductId] = useState(null);

  useEffect(() => {
    setLoadingMerchant(true);
    merchantsApi
      .detail(id)
      .then((data) => {
        setMerchant(data);
        setBranchId(data.branches?.[0]?.id ?? null);
      })
      .catch(() => navigate("/", { replace: true }))
      .finally(() => setLoadingMerchant(false));
    // merchant bo'yicha filterlash — backend shu do'kon turiga mos kategoriyalarni qaytaradi
    catalogApi
      .categories(undefined, { merchant: id })
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!branchId) return;
    setLoadingProducts(true);
    const handle = setTimeout(() => {
      catalogApi
        .branchProducts(id, { branch: branchId, category: categoryId || undefined, q: query })
        .then((data) => setProducts(data.results ?? data))
        .catch(() => setProducts([]))
        .finally(() => setLoadingProducts(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [id, branchId, categoryId, query]);

  const activeBranch = useMemo(
    () => merchant?.branches?.find((b) => b.id === branchId),
    [merchant, branchId]
  );

  const usedCategories = useMemo(() => {
    const names = new Set(products.map((p) => p.category_name).filter(Boolean));
    return categories.filter((c) => names.has(c.name_uz));
  }, [categories, products]);

  if (loadingMerchant) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-40 w-full rounded-tile" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!merchant) return null;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-tile border-2 border-ink/10 bg-white shadow-tile">
        <div className="h-32 w-full bg-sand">
          {merchant.cover ? (
            <img src={merchant.cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-marigold-light to-sand font-display text-4xl text-marigold-dark">
              {merchant.name[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-xl text-ink">{merchant.name}</h1>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-marigold-light px-2.5 py-1 text-xs font-bold text-marigold-dark">
              <Star size={12} className="fill-marigold-dark" />
              {Number(merchant.rating_avg || 0).toFixed(1)} ({merchant.total_reviews})
            </span>
          </div>
          <p className="text-sm text-ink/60">{merchantTypeLabel(merchant.type)}</p>
          {merchant.description && <p className="text-sm text-ink/70">{merchant.description}</p>}

          {activeBranch && (
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-ink/60">
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} /> {activeBranch.address_text}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} /> ~{activeBranch.prep_time_min} daq tayyorlanadi
              </span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  activeBranch.is_open ? "text-ceramic-dark" : "text-pomegranate"
                }`}
              >
                {activeBranch.is_open ? "Ochiq" : "Yopiq"}
              </span>
            </div>
          )}

          {merchant.branches?.length > 1 && (
            <div className="-mx-1 flex gap-1.5 overflow-x-auto scrollbar-none pt-2">
              {merchant.branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBranchId(b.id)}
                  className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition ${
                    branchId === b.id
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/15 bg-white text-ink/70"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-4 py-2.5">
        <Search size={16} className="text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Menyudan qidirish"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink/40"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Tozalash">
            <X size={15} className="text-ink/40" />
          </button>
        )}
      </div>

      {usedCategories.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setCategoryId("")}
            className={`shrink-0 rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition ${
              !categoryId ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white text-ink/70"
            }`}
          >
            Barchasi
          </button>
          {usedCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`shrink-0 rounded-full border-2 px-3.5 py-1.5 text-xs font-semibold transition ${
                categoryId === c.id
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 bg-white text-ink/70"
              }`}
            >
              {c.name_uz}
            </button>
          ))}
        </div>
      )}

      <section className="space-y-2.5">
        {loadingProducts ? (
          Array.from({ length: 5 }).map((_, i) => <ProductRowSkeleton key={i} />)
        ) : products.length === 0 ? (
          <EmptyState title="Mahsulot topilmadi" description="Boshqa so'z bilan qidirib ko'ring." />
        ) : (
          products.map((p) => (
            <ProductRow key={p.id} product={p} onOpen={() => setActiveProductId(p.id)} />
          ))
        )}
      </section>

      {activeProductId && (
        <ProductModal productId={activeProductId} onClose={() => setActiveProductId(null)} />
      )}
    </div>
  );
}
