import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, ShieldCheck, ShieldAlert, Star, Wallet } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCourier } from "../../context/CourierContext";
import { useToast } from "../../context/ToastContext";
import { courierApi } from "../../api/courier";
import { formatSum } from "../../utils/format";

const VEHICLE_TYPES = [
  { value: "bicycle", label: "Velosiped" },
  { value: "motorbike", label: "Mototsikl" },
  { value: "car", label: "Avtomobil" },
  { value: "foot", label: "Piyoda" },
];

export default function CourierProfilePage() {
  const { logout } = useAuth();
  const { profile, refreshProfile } = useCourier();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ vehicle_type: "motorbike", vehicle_number: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        vehicle_type: profile.vehicle_type || "motorbike",
        vehicle_number: profile.vehicle_number || "",
      });
    }
  }, [profile]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await courierApi.updateProfile(form);
      await refreshProfile();
      toast.success("Profil yangilandi");
    } catch (err) {
      toast.error(err.message || "Saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!profile) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="animate-spin text-ink/40" size={26} />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <h1 className="font-display text-xl text-ink">Kuryer profili</h1>

      <div className="flex items-center gap-3 rounded-tile border-2 border-ink/10 bg-white p-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ceramic-light font-display text-lg text-ceramic-dark">
          {(profile.full_name || "?")[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base text-ink">
            {profile.full_name || "Ism kiritilmagan"}
          </p>
          <p className="truncate text-xs text-ink/50">{profile.phone}</p>
        </div>
        {profile.is_approved ? (
          <span className="flex items-center gap-1 rounded-full bg-ceramic-light px-2.5 py-1 text-xs font-semibold text-ceramic-dark">
            <ShieldCheck size={13} /> Tasdiqlangan
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-marigold-light px-2.5 py-1 text-xs font-semibold text-marigold-dark">
            <ShieldAlert size={13} /> Kutilmoqda
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-tile border-2 border-ink/10 bg-white p-3 text-center">
          <Star size={16} className="mx-auto mb-1 text-marigold-dark" />
          <p className="font-display text-sm text-ink">{Number(profile.rating).toFixed(2)}</p>
          <p className="text-[10px] font-semibold uppercase text-ink/40">Reyting</p>
        </div>
        <div className="rounded-tile border-2 border-ink/10 bg-white p-3 text-center">
          <Wallet size={16} className="mx-auto mb-1 text-ceramic-dark" />
          <p className="font-display text-sm text-ink">{formatSum(profile.balance)}</p>
          <p className="text-[10px] font-semibold uppercase text-ink/40">Balans</p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-3 rounded-tile border-2 border-ink/10 bg-white p-4">
        <p className="text-xs font-semibold text-ink/60">Transport turi</p>
        <div className="grid grid-cols-2 gap-2">
          {VEHICLE_TYPES.map((v) => (
            <button
              type="button"
              key={v.value}
              onClick={() => setForm((f) => ({ ...f, vehicle_type: v.value }))}
              className={`rounded-full border-2 py-2 text-sm font-semibold transition ${
                form.vehicle_type === v.value
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/15 bg-white text-ink/70"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <label className="block text-xs font-semibold text-ink/60">
          Transport raqami
          <input
            value={form.vehicle_number}
            onChange={(e) => setForm((f) => ({ ...f, vehicle_number: e.target.value }))}
            placeholder="01 A 123 BC"
            className="mt-1 w-full rounded-xl border-2 border-ink/15 bg-paper px-3 py-2 text-sm font-medium text-ink outline-none focus:border-ceramic"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold py-2.5 text-sm font-display text-ink disabled:opacity-40"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Saqlash
        </button>
      </form>

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/15 py-3 text-sm font-semibold text-ink/70 transition hover:border-pomegranate hover:text-pomegranate"
      >
        <LogOut size={16} /> Chiqish
      </button>
    </div>
  );
}
