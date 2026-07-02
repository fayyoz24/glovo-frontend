import { useState } from "react";
import { Loader2 } from "lucide-react";
import { reviewsApi } from "../api/reviews";
import { useToast } from "../context/ToastContext";
import RatingStars from "./RatingStars";

export default function ReviewForm({ orderId, onDone }) {
  const [merchantRating, setMerchantRating] = useState(5);
  const [merchantComment, setMerchantComment] = useState("");
  const [courierRating, setCourierRating] = useState(5);
  const [courierComment, setCourierComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await reviewsApi.create(orderId, {
        merchant_rating: merchantRating,
        merchant_comment: merchantComment,
        courier_rating: courierRating,
        courier_comment: courierComment,
      });
      toast.success("Rahmat! Fikringiz yuborildi");
      onDone?.();
    } catch (e) {
      toast.error(e.message || "Fikr yuborilmadi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-tile border-2 border-ink/10 bg-white p-4">
      <h3 className="font-display text-base text-ink">Buyurtmani baholang</h3>

      <div>
        <p className="mb-1 text-sm font-semibold text-ink">Do'kon</p>
        <RatingStars value={merchantRating} onChange={setMerchantRating} size={22} />
        <textarea
          value={merchantComment}
          onChange={(e) => setMerchantComment(e.target.value)}
          placeholder="Fikringiz (ixtiyoriy)"
          rows={2}
          className="mt-2 w-full rounded-xl border-2 border-ink/15 bg-paper p-3 text-sm outline-none focus:border-ceramic"
        />
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-ink">Kuryer</p>
        <RatingStars value={courierRating} onChange={setCourierRating} size={22} />
        <textarea
          value={courierComment}
          onChange={(e) => setCourierComment(e.target.value)}
          placeholder="Fikringiz (ixtiyoriy)"
          rows={2}
          className="mt-2 w-full rounded-xl border-2 border-ink/15 bg-paper p-3 text-sm outline-none focus:border-ceramic"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold py-3 font-display text-sm text-ink disabled:opacity-40"
      >
        {submitting && <Loader2 size={15} className="animate-spin" />}
        Yuborish
      </button>
    </form>
  );
}
