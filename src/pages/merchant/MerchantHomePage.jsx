import { Loader2, BellRing } from "lucide-react";
import { useMerchant } from "../../context/MerchantContext";
import MerchantOrderCard from "../../components/merchant/MerchantOrderCard";
import EmptyState from "../../components/EmptyState";

export default function MerchantHomePage() {
  const { newOrders, loadingOrders, profile, toggleAcceptingOrders } = useMerchant();
  const accepting = profile?.branch?.accepting_orders;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl text-ink">Yangi buyurtmalar</h1>
        {profile?.branch && (
          <button
            onClick={() => toggleAcceptingOrders(!accepting)}
            className={`rounded-full px-3 py-1.5 text-xs font-display shadow-tile ${
              accepting ? "bg-ceramic text-white" : "bg-pomegranate text-white"
            }`}
          >
            {accepting ? "Buyurtma qabul qilinmoqda" : "Qabul to'xtatilgan"}
          </button>
        )}
      </div>

      {loadingOrders ? (
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="animate-spin text-ink/40" size={26} />
        </div>
      ) : newOrders.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="Yangi buyurtma yo'q"
          description="Yangi buyurtma kelganida shu yerda ko'rinadi va tovush bilan ogohlantirasiz."
        />
      ) : (
        <div className="space-y-3">
          {newOrders.map((order) => (
            <MerchantOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
