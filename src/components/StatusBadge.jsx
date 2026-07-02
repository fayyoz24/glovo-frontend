import { ORDER_STATUS_LABEL } from "../utils/format";

const TONE = {
  pending: "bg-marigold-light text-marigold-dark",
  merchant_confirmed: "bg-ceramic-light text-ceramic-dark",
  preparing: "bg-ceramic-light text-ceramic-dark",
  ready_for_pickup: "bg-ceramic-light text-ceramic-dark",
  courier_assigned: "bg-ceramic-light text-ceramic-dark",
  picked_up: "bg-ceramic-light text-ceramic-dark",
  on_the_way: "bg-ceramic-light text-ceramic-dark",
  delivered: "bg-ink text-paper",
  cancelled: "bg-pomegranate-light text-pomegranate-dark",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        TONE[status] || "bg-sand text-ink"
      }`}
    >
      {ORDER_STATUS_LABEL[status] || status}
    </span>
  );
}
