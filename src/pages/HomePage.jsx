import { useEffect, useState } from "react";
import { MapPin, Loader2, ChevronDown, Frown } from "lucide-react";
import { merchantsApi } from "../api/merchants";
import MerchantCard from "../components/MerchantCard";
import { MerchantCardSkeleton, Grid } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import { MERCHANT_TYPES } from "../utils/merchantTypes";
import { useGeolocation } from "../hooks/useGeolocation";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const [type, setType] = useState("");
  const [merchants, setMerchants] = useState([]);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { isAuthed } = useAuth();
  const { coords, status: geoStatus, request: requestLocation } = useGeolocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    merchantsApi
      .list({ type })
      .then((data) => {
        if (cancelled) return;
        setMerchants(data.results ?? data);
        setCount(data.count ?? (data.results ?? data).length);
        setNextUrl(data.next ?? null);
      })
      .catch(() => !cancelled && setMerchants([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [type]);

  const loadMore = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      const res = await fetch(nextUrl, {
        headers: isAuthed
          ? { Authorization: `Bearer ${localStorage.getItem("dasturxon_access")}` }
          : {},
      });
      const data = await res.json();
      setMerchants((prev) => [...prev, ...(data.results ?? [])]);
      setNextUrl(data.next ?? null);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-tile border-2 border-ink/10 bg-gradient-to-br from-ink to-[#33291d] px-6 py-8 text-paper shadow-card">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-marigold">Dasturxon</p>
        <h1 className="mt-2 max-w-md font-display text-2xl leading-tight sm:text-3xl">
          Sevimli taomingiz — bir necha bosishda uyingizga
        </h1>
        <button
          onClick={requestLocation}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper/10 px-4 py-2 text-sm font-semibold text-paper backdrop-blur transition hover:bg-paper/20"
        >
          <MapPin size={16} className="text-marigold" />
          {geoStatus === "locating"
            ? "Aniqlanmoqda..."
            : coords
            ? "Joylashuv aniqlandi"
            : "Yaqin atrofdagilarni ko'rish"}
        </button>
      </section>

      <div className="-mx-4 flex gap-2 overflow-x-auto scrollbar-none px-4 pb-1">
        {MERCHANT_TYPES.map((t) => {
          const Icon = t.icon;
          const active = type === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 bg-white text-ink/70 hover:border-ink/30"
              }`}
            >
              {Icon && <Icon size={15} />}
              {t.label}
            </button>
          );
        })}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">
            {type ? MERCHANT_TYPES.find((t) => t.value === type)?.label : "Barcha do'konlar"}
          </h2>
          {!loading && <span className="text-sm text-ink/50">{count} ta topildi</span>}
        </div>

        {loading ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <MerchantCardSkeleton key={i} />
            ))}
          </Grid>
        ) : merchants.length === 0 ? (
          <EmptyState
            icon={Frown}
            title="Hech narsa topilmadi"
            description="Ushbu kategoriya bo'yicha hozircha do'konlar yo'q. Boshqasini tanlab ko'ring."
          />
        ) : (
          <>
            <Grid>
              {merchants.map((m) => (
                <MerchantCard key={m.id} merchant={m} />
              ))}
            </Grid>
            {nextUrl && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-ink/15 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/30 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  Ko'proq ko'rsatish
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
