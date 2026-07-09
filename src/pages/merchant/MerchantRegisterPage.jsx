import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Store } from "lucide-react";
import { merchantApi } from "../../api/merchant";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const MERCHANT_TYPES = [
  { value: "food", label: "Restoran / Fastfood" },
  { value: "grocery", label: "Market / Oziq-ovqat" },
  { value: "pharmacy", label: "Dorixona" },
  { value: "flowers", label: "Gullar" },
  { value: "express", label: "Tezkor yetkazib berish" },
];

export default function MerchantRegisterPage() {
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState("");
  const [type, setType] = useState("food");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "guest") {
    navigate("/login");
    return null;
  }

  if (user?.role === "merchant_owner" || user?.role === "merchant_manager") {
    navigate("/merchant");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Do'kon nomini kiriting");
      return;
    }
    setSubmitting(true);
    try {
      await merchantApi.register({ name: name.trim(), type, description: description.trim() });
      toast.success("Arizangiz yuborildi! Admin tez orada ko'rib chiqadi.");
      navigate("/merchant/status");
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-marigold text-ink">
          <Store size={22} />
        </div>
        <div>
          <h1 className="font-display text-xl text-ink">O'z do'koningizni oching</h1>
          <p className="text-sm text-ink/50">Ariza yuborilgach admin tasdiqlaydi</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">Do'kon nomi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Osh Markazi"
            className="w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ceramic"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">Turi</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ceramic"
          >
            {MERCHANT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">
            Tavsif <span className="font-normal text-ink/40">(ixtiyoriy)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Do'koningiz haqida qisqacha"
            className="w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ceramic"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ceramic py-3.5 font-display text-white shadow-tile disabled:opacity-50"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Arizani yuborish
        </button>
      </form>
    </div>
  );
}
