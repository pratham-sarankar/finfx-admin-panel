import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import data from "./data.json";
import { HomeDataTable } from "./components/home_data_table";
import { HomeSectionCards } from "./components/home_section_cards";

export default function HomePage() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-1 md:gap-6 md:py-2">
            <HomeSectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <HomeDataTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
