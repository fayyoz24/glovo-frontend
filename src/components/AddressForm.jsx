import { useState } from "react";
import { Loader2, LocateFixed } from "lucide-react";
import { useGeolocation } from "../hooks/useGeolocation";

const EMPTY = {
  title: "",
  address_line: "",
  district: "",
  city: "Toshkent",
  landmark: "",
  entrance: "",
  floor: "",
  apartment: "",
};

export default function AddressForm({ initial, onSubmit, onCancel, submitLabel = "Saqlash" }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [submitting, setSubmitting] = useState(false);
  const { coords, status, request } = useGeolocation();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        latitude: coords?.lat ?? initial?.latitude ?? null,
        longitude: coords?.lng ?? initial?.longitude ?? null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Nom (masalan: Uy, Ish)" value={form.title} onChange={set("title")} required />
      <Field label="Manzil" value={form.address_line} onChange={set("address_line")} required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tuman" value={form.district} onChange={set("district")} />
        <Field label="Shahar" value={form.city} onChange={set("city")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Kirish" value={form.entrance} onChange={set("entrance")} />
        <Field label="Qavat" value={form.floor} onChange={set("floor")} />
        <Field label="Xonadon" value={form.apartment} onChange={set("apartment")} />
      </div>
      <Field label="Mo'ljal (ixtiyoriy)" value={form.landmark} onChange={set("landmark")} />

      <button
        type="button"
        onClick={request}
        className="flex items-center gap-2 text-sm font-semibold text-ceramic-dark"
      >
        <LocateFixed size={15} />
        {status === "locating"
          ? "Aniqlanmoqda..."
          : coords
          ? "Joylashuv qo'shildi ✓"
          : "Joriy joylashuvni qo'shish"}
      </button>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border-2 border-ink/15 py-2.5 text-sm font-semibold text-ink"
          >
            Bekor qilish
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-marigold py-2.5 text-sm font-display text-ink disabled:opacity-40"
        >
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <label className="block text-xs font-semibold text-ink/60">
      {label}
      <input
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full rounded-xl border-2 border-ink/15 bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus:border-ceramic"
      />
    </label>
  );
}
