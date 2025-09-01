import { SettingsDataTable } from "./components/settings_data_table";

export default function SettingsPage() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-1 md:gap-6 md:py-2 m-10">
            <h1 className="pl-2 text-xl md:text-2xl ">
              Manage your account settings and set e-mail preferences.
            </h1>
            <SettingsDataTable />
          </div>
        </div>
      </div>
    </>
  );
}
