// import { UsersDataTable } from "./components/subscription_data_table.tsx";
import { SubscriptionsDataTable } from "./components/subscription_data_table";

export default function SubscriptionPage() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-1 md:gap-6 md:py-2">
            <SubscriptionsDataTable />
          </div>
        </div>
      </div>
    </>
  );
}
