import BotsDataTable from "./components/bots_data_table";

export default function BotsPage() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-1 md:gap-6 md:py-2">
            <BotsDataTable />
          </div>
        </div>
      </div>
    </>
  );
}
