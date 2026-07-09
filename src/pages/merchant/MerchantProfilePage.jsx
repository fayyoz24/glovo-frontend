import { useEffect, useState } from "react";
import { LogOut, MapPin, Phone, Clock, Store, Pencil, Loader2, X, Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMerchant } from "../../context/MerchantContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { merchantApi } from "../../api/merchant";
import LocationMapPicker from "../../components/LocationMapPicker";

const MERCHANT_TYPES = [
  { value: "food", label: "Restoran / Fastfood" },
  { value: "grocery", label: "Market / Oziq-ovqat" },
  { value: "pharmacy", label: "Dorixona" },
  { value: "flowers", label: "Gullar" },
  { value: "express", label: "Tezkor yetkazib berish" },
];

const MERCHANT_STATUS_LABEL = {
  pending: "Tekshiruvda",
  active: "Faol",
  suspended: "To'xtatilgan",
  rejected: "Rad etilgan",
};

export default function MerchantProfilePage() {
  const { profile, toggleAcceptingOrders, refreshProfile } = useMerchant();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const branch = profile?.branch;

  const [editingStore, setEditingStore] = useState(false);
  const [editingBranch, setEditingBranch] = useState(false);
  const [saving, setSaving] = useState(false);

  const [storeForm, setStoreForm] = useState(null);
  const [branchForm, setBranchForm] = useState(null);

  const startEditStore = () => {
    setStoreForm({
      name: profile?.merchant_name || "",
      type: profile?.merchant_type || "food",
      description: profile?.merchant_description || "",
    });
    setEditingStore(true);
  };

  const startEditBranch = () => {
    setBranchForm({
      name: branch?.name || "",
      phone: branch?.phone || "",
      address_text: branch?.address_text || "",
      prep_time_min: branch?.prep_time_min || 20,
      location:
        branch?.latitude != null && branch?.longitude != null
          ? { lat: Number(branch.latitude), lng: Number(branch.longitude) }
          : null,
    });
    setEditingBranch(true);
  };

  const saveStore = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await merchantApi.updateMine(storeForm);
      await refreshProfile();
      toast.success("Do'kon ma'lumotlari yangilandi");
      setEditingStore(false);
    } catch (err) {
      toast.error(err.message || "Saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const saveBranch = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { location, ...rest } = branchForm;
      await merchantApi.updateBranch({
        ...rest,
        prep_time_min: Number(branchForm.prep_time_min) || 20,
        ...(location ? { latitude: location.lat, longitude: location.lng } : {}),
      });
      await refreshProfile();
      toast.success("Filial ma'lumotlari yangilandi");
      setEditingBranch(false);
    } catch (err) {
      toast.error(err.message || "Saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-4 pb-6">
      <h1 className="font-display text-xl text-ink">Do'kon</h1>

      {/* Do'kon kartasi */}
      <div className="space-y-3 rounded-tile border-2 border-ink/10 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-marigold text-ink">
              <Store size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-lg text-ink">{profile?.merchant_name}</p>
              <p className="text-xs text-ink/50">
                {profile?.position || "Xodim"} ·{" "}
                {MERCHANT_STATUS_LABEL[profile?.merchant_status] || profile?.merchant_status}
              </p>
            </div>
          </div>
          {!editingStore && (
            <button
              onClick={startEditStore}
              aria-label="Do'kon ma'lumotlarini tahrirlash"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-ink/5"
            >
              <Pencil size={15} />
            </button>
          )}
        </div>

        {profile?.merchant_status === "pending" && !editingStore && (
          <p className="rounded-lg bg-marigold-light px-3 py-2 text-xs text-ink/70">
            Do'koningiz hozircha tekshiruvda. Tasdiqlangach mijozlarga ko'rina boshlaydi.
          </p>
        )}

        {editingStore && storeForm && (
          <form onSubmit={saveStore} className="space-y-3 border-t-2 border-ink/5 pt-3">
            <Field label="Do'kon nomi">
              <input
                value={storeForm.name}
                onChange={(e) => setStoreForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
              />
            </Field>
            <Field label="Turi">
              <select
                value={storeForm.type}
                onChange={(e) => setStoreForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
              >
                {MERCHANT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tavsif">
              <textarea
                value={storeForm.description}
                onChange={(e) => setStoreForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
              />
            </Field>
            <EditActions onCancel={() => setEditingStore(false)} saving={saving} />
          </form>
        )}
      </div>

      {/* Filial kartasi */}
      {branch && (
        <div className="space-y-3 rounded-tile border-2 border-ink/10 bg-white p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-base text-ink">{branch.name}</p>
            {!editingBranch && (
              <button
                onClick={startEditBranch}
                aria-label="Filial ma'lumotlarini tahrirlash"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-ink/5"
              >
                <Pencil size={15} />
              </button>
            )}
          </div>

          {!editingBranch ? (
            <>
              <div className="space-y-2 text-sm text-ink/60">
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0" /> {branch.address_text}
                </p>
                {branch.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="shrink-0" /> {branch.phone}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Clock size={16} className="shrink-0" />
                  O'rtacha tayyorlash: {branch.prep_time_min} daq
                </p>
              </div>

              {branch.latitude == null && (
                <p className="rounded-lg bg-pomegranate-light px-3 py-2 text-xs text-pomegranate-dark">
                  Joylashuv (xarita) belgilanmagan — do'koningiz "yaqin atrofdagilar" ro'yxatida
                  ko'rinmaydi. Tahrirlash orqali xaritadan belgilang.
                </p>
              )}

              <button
                onClick={() => toggleAcceptingOrders(!branch.accepting_orders)}
                className={`w-full rounded-full py-3 text-sm font-display shadow-tile transition ${
                  branch.accepting_orders ? "bg-ceramic text-white" : "bg-pomegranate text-white"
                }`}
              >
                {branch.accepting_orders ? "Buyurtmalarni to'xtatish" : "Buyurtmalarni qayta yoqish"}
              </button>
            </>
          ) : (
            <form onSubmit={saveBranch} className="space-y-3">
              <Field label="Filial nomi">
                <input
                  value={branchForm.name}
                  onChange={(e) => setBranchForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
                />
              </Field>
              <Field label="Telefon">
                <input
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
                />
              </Field>
              <Field label="Manzil">
                <input
                  value={branchForm.address_text}
                  onChange={(e) => setBranchForm((f) => ({ ...f, address_text: e.target.value }))}
                  className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
                />
              </Field>
              <Field label="O'rtacha tayyorlash vaqti (daqiqa)">
                <input
                  type="number"
                  min={1}
                  value={branchForm.prep_time_min}
                  onChange={(e) => setBranchForm((f) => ({ ...f, prep_time_min: e.target.value }))}
                  className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
                />
              </Field>
              <Field label="Joylashuv (xarita)">
                <LocationMapPicker
                  value={branchForm.location}
                  onChange={(loc) => setBranchForm((f) => ({ ...f, location: loc }))}
                />
              </Field>
              <EditActions onCancel={() => setEditingBranch(false)} saving={saving} />
            </form>
          )}
        </div>
      )}

      <OtherBranchesSection />

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/10 bg-white py-3 text-sm font-display text-pomegranate-dark"
      >
        <LogOut size={16} /> Chiqish
      </button>
    </div>
  );
}

function OtherBranchesSection() {
  const { profile, refreshProfile } = useMerchant();
  const toast = useToast();
  const [branches, setBranches] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [switchingId, setSwitchingId] = useState(null);

  const loadBranches = async () => {
    try {
      const res = await merchantApi.branches();
      setBranches(res.branches || []);
    } catch {
      setBranches([]);
    }
  };

  useEffect(() => {
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.branch?.id]);

  const handleSwitch = async (branchId) => {
    setSwitchingId(branchId);
    try {
      await merchantApi.switchBranch(branchId);
      await refreshProfile();
      toast.success("Faol filial almashtirildi");
    } catch (err) {
      toast.error(err.message || "Amalga oshmadi");
    } finally {
      setSwitchingId(null);
    }
  };

  const activeBranchId = profile?.branch?.id;
  const otherBranches = (branches || []).filter((b) => b.id !== activeBranchId);

  return (
    <div className="space-y-3 rounded-tile border-2 border-ink/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-base text-ink">Filiallar</p>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-full bg-ceramic px-3 py-1.5 text-xs font-display text-white shadow-tile"
          >
            <Plus size={14} /> Yangi filial
          </button>
        )}
      </div>

      <p className="text-xs text-ink/50">
        Bir vaqtda faqat bitta filial "faol" bo'lib ishlaydi — buyurtmalar shu filial bo'yicha
        keladi. Boshqa filialga o'tish uchun uni tanlang.
      </p>

      {showAddForm && (
        <NewBranchForm
          onCancel={() => setShowAddForm(false)}
          onSaved={async () => {
            setShowAddForm(false);
            await loadBranches();
            await refreshProfile();
            toast.success("Filial qo'shildi");
          }}
        />
      )}

      {branches === null ? (
        <div className="grid place-items-center py-4">
          <Loader2 className="animate-spin text-ink/40" size={20} />
        </div>
      ) : otherBranches.length === 0 ? (
        !showAddForm && <p className="text-xs text-ink/40">Boshqa filial yo'q.</p>
      ) : (
        <div className="space-y-2">
          {otherBranches.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 rounded-xl border-2 border-ink/10 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{b.name}</p>
                <p className="truncate text-xs text-ink/50">{b.address_text}</p>
              </div>
              <button
                onClick={() => handleSwitch(b.id)}
                disabled={switchingId === b.id}
                className="shrink-0 rounded-full border-2 border-ceramic px-3 py-1.5 text-xs font-display text-ceramic-dark disabled:opacity-50"
              >
                {switchingId === b.id ? "..." : "Faol qilish"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewBranchForm({ onCancel, onSaved }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await merchantApi.addBranch({
        name: name.trim(),
        phone: phone.trim(),
        address_text: address.trim(),
        latitude: location.lat,
        longitude: location.lng,
      });
      onSaved();
    } catch (err) {
      toast.error(err.message || "Saqlab bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border-2 border-ceramic/30 p-3">
      <Field label="Filial nomi">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masalan: Yunusobod filiali"
          className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
        />
      </Field>
      <Field label="Telefon">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
        />
      </Field>
      <Field label="Manzil">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ko'cha, uy raqami, tuman"
          className="w-full rounded-lg border-2 border-ink/10 bg-white px-3 py-2 text-sm outline-none focus:border-ceramic"
        />
      </Field>
      <Field label="Joylashuv (xarita)">
        <LocationMapPicker value={location} onChange={setLocation} />
      </Field>
      <EditActions onCancel={onCancel} saving={saving} />
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ink/60">{label}</label>
      {children}
    </div>
  );
}

function EditActions({ onCancel, saving }) {
  return (
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
  );
}
