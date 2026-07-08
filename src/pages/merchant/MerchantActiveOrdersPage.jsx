import { Loader2, ChefHat } from "lucide-react";
import { useMerchant } from "../../context/MerchantContext";
import MerchantOrderCard from "../../components/merchant/MerchantOrderCard";
import EmptyState from "../../components/EmptyState";

export default function MerchantActiveOrdersPage() {
  const { activeOrders, loadingOrders } = useMerchant();

  return (
    <div className="space-y-4 pb-6">
      <h1 className="font-display text-xl text-ink">Faol buyurtmalar</h1>

      {loadingOrders ? (
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="animate-spin text-ink/40" size={26} />
        </div>
      ) : activeOrders.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="Faol buyurtma yo'q"
          description="Qabul qilingan buyurtmalar shu yerda ko'rinadi."
        />
      ) : (
        <div className="space-y-3">
          {activeOrders.map((order) => (
            <MerchantOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
