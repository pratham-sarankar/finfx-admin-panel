import SignalsDataTable from "./components/signal_data_table";

export default function SignalPage() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-1 md:gap-6 md:py-2">
            <SignalsDataTable />
          </div>
        </div>
      </div>
    </>
  );
}
