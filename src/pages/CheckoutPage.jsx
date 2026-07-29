import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, Loader2, Banknote, CreditCard, ArrowRight } from "lucide-react";
import { locationsApi } from "../api/locations";
import { ordersApi } from "../api/orders";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatSum, PAYMENT_METHOD_LABEL } from "../utils/format";
import AddressForm from "../components/AddressForm";
import EmptyState from "../components/EmptyState";

const PAYMENT_METHODS = [
  { value: "cash", icon: Banknote },
  { value: "click", icon: CreditCard },
  { value: "payme", icon: CreditCard },
  { value: "uzcard", icon: CreditCard },
];

export default function CheckoutPage() {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressId, setAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [tip, setTip] = useState(0);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    locationsApi
      .listAddresses()
      .then((data) => {
        setAddresses(data);
        const def = data.find((a) => a.is_default) || data[0];
        if (def) setAddressId(def.id);
        else setShowAddForm(true);
      })
      .finally(() => setLoadingAddresses(false));
  }, []);

  // Birinchi buyurtmadan avval telefon raqami kiritilgan bo'lishi shart —
  // aks holda profil sahifasidagi telefon paneliga yo'naltiramiz (do'stona ohangda).
  useEffect(() => {
    if (user && !user.phone) {
      toast.info("Telefon raqamingizni kiriting, keyin buyurtma berishni davom ettiramiz 🙂");
      navigate("/profile?requirePhone=1", { replace: true });
    }
  }, [user, navigate, toast]);

  const createAddress = async (payload) => {
    try {
      const created = await locationsApi.createAddress(payload);
      setAddresses((prev) => [...prev, created]);
      setAddressId(created.id);
      setShowAddForm(false);
      toast.success("Manzil qo'shildi");
    } catch (e) {
      toast.error(e.message || "Manzilni saqlab bo'lmadi");
    }
  };

  const placeOrder = async () => {
    if (!addressId) {
      toast.error("Yetkazib berish manzilini tanlang");
      return;
    }
    setPlacing(true);
    try {
      const order = await ordersApi.checkout({
        address_id: addressId,
        payment_method: paymentMethod,
        tip_amount: tip,
      });
      await refresh();
      toast.success("Buyurtma qabul qilindi!");
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (e) {
      if (e?.data?.code === "phone_required") {
        toast.info("Telefon raqamingizni kiriting, keyin buyurtma berishni davom ettiramiz 🙂");
        navigate("/profile?requirePhone=1", { replace: true });
        return;
      }
      toast.error(e.message || "Buyurtmani rasmiylashtirib bo'lmadi");
    } finally {
      setPlacing(false);
    }
  };

  if (!cart?.items?.length) {
    return (
      <EmptyState
        title="Savat bo'sh"
        description="Buyurtma berish uchun avval savatga mahsulot qo'shing."
      />
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <h1 className="font-display text-xl text-ink">Buyurtmani rasmiylashtirish</h1>

      <section>
        <h2 className="mb-2 font-body text-sm font-bold text-ink">Yetkazib berish manzili</h2>
        {loadingAddresses ? (
          <div className="skeleton h-16 w-full rounded-tile" />
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`flex cursor-pointer items-start gap-3 rounded-tile border-2 px-4 py-3 transition ${
                  addressId === a.id ? "border-ceramic bg-ceramic-light" : "border-ink/10 bg-white"
                }`}
              >
                <input
                  type="radio"
                  className="mt-1 accent-ceramic"
                  checked={addressId === a.id}
                  onChange={() => setAddressId(a.id)}
                />
                <MapPin size={16} className="mt-0.5 shrink-0 text-ink/50" />
                <span className="text-sm">
                  <span className="block font-semibold text-ink">{a.title}</span>
                  <span className="text-ink/60">{a.address_line}</span>
                </span>
              </label>
            ))}

            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-tile border-2 border-dashed border-ink/20 py-3 text-sm font-semibold text-ink/60 hover:border-ink/40"
              >
                <Plus size={15} /> Yangi manzil qo'shish
              </button>
            )}

            {showAddForm && (
              <div className="rounded-tile border-2 border-ink/10 bg-white p-4">
                <AddressForm
                  onSubmit={createAddress}
                  onCancel={addresses.length ? () => setShowAddForm(false) : undefined}
                />
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-body text-sm font-bold text-ink">To'lov usuli</h2>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setPaymentMethod(value)}
              className={`flex items-center gap-2 rounded-tile border-2 px-4 py-3 text-sm font-semibold transition ${
                paymentMethod === value
                  ? "border-ceramic bg-ceramic-light text-ceramic-dark"
                  : "border-ink/10 bg-white text-ink/70"
              }`}
            >
              <Icon size={16} />
              {PAYMENT_METHOD_LABEL[value]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-body text-sm font-bold text-ink">Kuryerga choy puli (ixtiyoriy)</h2>
        <div className="flex gap-2">
          {[0, 5000, 10000, 20000].map((v) => (
            <button
              key={v}
              onClick={() => setTip(v)}
              className={`flex-1 rounded-full border-2 py-2 text-sm font-semibold transition ${
                tip === v ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white text-ink/70"
              }`}
            >
              {v === 0 ? "Yo'q" : formatSum(v)}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-tile border-2 border-ink/10 bg-white p-4 text-sm">
        <div className="flex items-center justify-between text-ink/70">
          <span>Mahsulotlar</span>
          <span className="font-mono">{formatSum(cart.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-ink/70">
          <span>Yetkazib berish</span>
          <span className="font-mono">{formatSum(cart.delivery_fee)}</span>
        </div>
        {tip > 0 && (
          <div className="flex items-center justify-between text-ink/70">
            <span>Choy puli</span>
            <span className="font-mono">{formatSum(tip)}</span>
          </div>
        )}
        <div className="my-1 border-t-2 border-dashed border-ink/10" />
        <div className="flex items-center justify-between font-bold text-ink">
          <span>Jami to'lov</span>
          <span className="font-mono">{formatSum(Number(cart.total) + Number(tip))}</span>
        </div>
      </section>

      <button
        onClick={placeOrder}
        disabled={placing || !addressId}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold py-3.5 font-display text-sm text-ink shadow-tile transition hover:bg-marigold-dark disabled:opacity-40"
      >
        {placing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        Buyurtmani tasdiqlash
      </button>
    </div>
  );
}
