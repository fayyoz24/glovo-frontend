import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { merchantApi } from "../../api/merchant";
import { useMerchant } from "../../context/MerchantContext";
import { useToast } from "../../context/ToastContext";
import LocationMapPicker from "../LocationMapPicker";

export default function BranchSetupForm() {
  const { refreshProfile } = useMerchant();
  const toast = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      toast.error("Filial nomi va manzilini kiriting");
      return;
    }
    if (!location) {
      toast.error("Xaritadan filial joylashuvini belgilang");
      return;
    }
    setSubmitting(true);
    try {
      await merchantApi.createBranch({
        name: name.trim(),
        phone: phone.trim(),
        address_text: address.trim(),
        latitude: location.lat,
        longitude: location.lng,
      });
      toast.success("Filial qo'shildi!");
      await refreshProfile();
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-marigold text-ink">
          <MapPin size={20} />
        </div>
        <div>
          <p className="font-display text-lg text-ink">Filial qo'shing</p>
          <p className="text-sm text-ink/50">Buyurtma qabul qilish uchun kamida bitta filial kerak</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">Filial nomi</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Chilonzor filiali"
            className="w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ceramic"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">Telefon</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
            className="w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ceramic"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">Manzil</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ko'cha, uy raqami, tuman"
            className="w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-ceramic"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-ink/70">Joylashuv (xarita)</label>
          <LocationMapPicker value={location} onChange={setLocation} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ceramic py-3.5 font-display text-white shadow-tile disabled:opacity-50"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          Filialni saqlash
        </button>
      </form>
    </div>
  );
}
