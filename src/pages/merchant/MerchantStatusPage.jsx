import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Clock, CheckCircle2, XCircle, Store, Plus, RefreshCw } from "lucide-react";
import { merchantApi } from "../../api/merchant";
import { useAuth } from "../../context/AuthContext";

const STATUS_META = {
  pending: { label: "Tekshiruvda", icon: Clock, className: "bg-marigold-light text-marigold-dark" },
  active: { label: "Tasdiqlangan", icon: CheckCircle2, className: "bg-ceramic-light text-ceramic-dark" },
  rejected: { label: "Rad etilgan", icon: XCircle, className: "bg-pomegranate-light text-pomegranate-dark" },
  suspended: { label: "To'xtatilgan", icon: XCircle, className: "bg-pomegranate-light text-pomegranate-dark" },
};

export default function MerchantStatusPage() {
  const { status: authStatus, refresh } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await merchantApi.applications();
      setData(res);
      if (res.has_active_panel) {
        // Admin allaqachon tasdiqlagan — auth ni yangilab panelga o'tamiz
        await refresh();
        navigate("/merchant");
      }
    } catch {
      setData({ applications: [], pending_count: 0, max_pending: 3, has_active_panel: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === "guest") {
      navigate("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  if (loading || !data) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="animate-spin text-ink/40" size={28} />
      </div>
    );
  }

  const canApplyMore = data.pending_count < data.max_pending;

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-marigold text-ink">
          <Store size={22} />
        </div>
        <div>
          <h1 className="font-display text-xl text-ink">Do'kon arizalarim</h1>
          <p className="text-sm text-ink/50">Admin tasdiqlagach panelga kirasiz</p>
        </div>
      </div>

      {data.applications.length === 0 ? (
        <div className="rounded-tile border-2 border-dashed border-ink/15 bg-white p-6 text-center">
          <p className="text-sm text-ink/60">Hali do'kon arizasi yubormagansiz.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.applications.map((m) => {
            const meta = STATUS_META[m.status] || STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-tile border-2 border-ink/10 bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base text-ink">{m.name}</p>
                  {m.status === "rejected" && (
                    <p className="mt-0.5 text-xs text-pomegranate-dark">
                      Ariza rad etildi. Ma'lumotlarni tekshirib qayta urinib ko'ring.
                    </p>
                  )}
                  {m.status === "pending" && (
                    <p className="mt-0.5 text-xs text-ink/50">Admin ko'rib chiqmoqda…</p>
                  )}
                </div>
                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
                >
                  <Icon size={13} /> {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {canApplyMore ? (
        <button
          onClick={() => navigate("/merchant/register")}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ceramic py-3.5 font-display text-white shadow-tile"
        >
          <Plus size={18} /> Yangi do'kon uchun ariza
        </button>
      ) : (
        <p className="rounded-xl bg-pomegranate-light px-4 py-3 text-center text-sm text-pomegranate-dark">
          Tasdiqlanishini kutayotgan do'konlar soni limitiga ({data.max_pending}) yetdingiz. Birortasi
          ko'rib chiqilishini kuting.
        </p>
      )}

      <button
        onClick={load}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/10 py-3 text-sm font-semibold text-ink/60"
      >
        <RefreshCw size={15} /> Holatni yangilash
      </button>
    </div>
  );
}
