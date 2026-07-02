import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, MapPin, Plus, Star, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { locationsApi } from "../api/locations";
import AddressForm from "../components/AddressForm";

const LANGUAGES = [
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    language: user?.language || "uz",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    locationsApi
      .listAddresses()
      .then(setAddresses)
      .finally(() => setLoadingAddresses(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(form);
      toast.success("Profil yangilandi");
    } catch (e) {
      toast.error(e.message || "Saqlab bo'lmadi");
    } finally {
      setSavingProfile(false);
    }
  };

  const createAddress = async (payload) => {
    try {
      const created = await locationsApi.createAddress(payload);
      setAddresses((prev) => [...prev, created]);
      setAddingNew(false);
      toast.success("Manzil qo'shildi");
    } catch (e) {
      toast.error(e.message || "Saqlab bo'lmadi");
    }
  };

  const updateAddress = async (id, payload) => {
    try {
      const updated = await locationsApi.updateAddress(id, payload);
      setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setEditingId(null);
      toast.success("Manzil yangilandi");
    } catch (e) {
      toast.error(e.message || "Saqlab bo'lmadi");
    }
  };

  const deleteAddress = async (id) => {
    try {
      await locationsApi.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      toast.error(e.message || "O'chirib bo'lmadi");
    }
  };

  const setDefault = async (id) => {
    try {
      await locationsApi.setDefault(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
    } catch (e) {
      toast.error(e.message || "Amalga oshmadi");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="space-y-6 pb-6">
      <h1 className="font-display text-xl text-ink">Profil</h1>

      <form onSubmit={saveProfile} className="space-y-3 rounded-tile border-2 border-ink/10 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-marigold-light font-display text-lg text-marigold-dark">
            {(user?.full_name || user?.telegram_username || "?")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-base text-ink">
              {user?.full_name || "Ism kiritilmagan"}
            </p>
            {user?.telegram_username && (
              <p className="truncate text-xs text-ink/50">@{user.telegram_username}</p>
            )}
          </div>
        </div>

        <Field label="To'liq ism" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} />
        <Field label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} type="email" />
        <Field label="Telefon" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />

        <div>
          <p className="mb-1 text-xs font-semibold text-ink/60">Til</p>
          <div className="flex gap-2">
            {LANGUAGES.map((l) => (
              <button
                type="button"
                key={l.value}
                onClick={() => setForm((f) => ({ ...f, language: l.value }))}
                className={`flex-1 rounded-full border-2 py-2 text-sm font-semibold transition ${
                  form.language === l.value
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/15 bg-white text-ink/70"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold py-2.5 text-sm font-display text-ink disabled:opacity-40"
        >
          {savingProfile && <Loader2 size={15} className="animate-spin" />}
          Saqlash
        </button>
      </form>

      <section>
        <h2 className="mb-2 font-body text-sm font-bold text-ink">Manzillarim</h2>
        {loadingAddresses ? (
          <div className="skeleton h-16 w-full rounded-tile" />
        ) : (
          <div className="space-y-2">
            {addresses.map((a) =>
              editingId === a.id ? (
                <div key={a.id} className="rounded-tile border-2 border-ink/10 bg-white p-4">
                  <AddressForm
                    initial={a}
                    onSubmit={(payload) => updateAddress(a.id, payload)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-tile border-2 border-ink/10 bg-white p-4"
                >
                  <MapPin size={16} className="mt-0.5 shrink-0 text-ink/50" />
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">{a.title}</span>
                      {a.is_default && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-marigold-light px-2 py-0.5 text-[10px] font-bold text-marigold-dark">
                          <Star size={9} className="fill-marigold-dark" /> Asosiy
                        </span>
                      )}
                    </div>
                    <p className="text-ink/60">{a.address_line}</p>
                    {!a.is_default && (
                      <button
                        onClick={() => setDefault(a.id)}
                        className="mt-1 text-xs font-semibold text-ceramic-dark hover:underline"
                      >
                        Asosiy qilish
                      </button>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setEditingId(a.id)}
                      aria-label="Tahrirlash"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink/40 hover:bg-ink/5"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteAddress(a.id)}
                      aria-label="O'chirish"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink/40 hover:bg-pomegranate-light hover:text-pomegranate"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}

            {addingNew ? (
              <div className="rounded-tile border-2 border-ink/10 bg-white p-4">
                <AddressForm onSubmit={createAddress} onCancel={() => setAddingNew(false)} />
              </div>
            ) : (
              <button
                onClick={() => setAddingNew(true)}
                className="flex w-full items-center justify-center gap-2 rounded-tile border-2 border-dashed border-ink/20 py-3 text-sm font-semibold text-ink/60 hover:border-ink/40"
              >
                <Plus size={15} /> Yangi manzil qo'shish
              </button>
            )}
          </div>
        )}
      </section>

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/15 py-3 text-sm font-semibold text-ink/70 transition hover:border-pomegranate hover:text-pomegranate"
      >
        <LogOut size={16} /> Chiqish
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block text-xs font-semibold text-ink/60">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border-2 border-ink/15 bg-paper px-3 py-2 text-sm font-medium text-ink outline-none focus:border-ceramic"
      />
    </label>
  );
}
