import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function SettingsDataTable() {
  const { theme, setTheme } = useTheme();
  const options: Array<"light" | "dark"> = ["light", "dark"];

  return (
    <div className="flex-1 bg-white dark:bg-neutral-900 border rounded-xl shadow-sm p-6">
      {/* Theme Selector */}
      <div className="mb-8">
        <h2 className="block text-lg font-medium mb-2">Theme</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Select the theme for the dashboard.
        </p>

        <div className="flex gap-6">
          {options.map((item) => (
            <button
              key={item}
              onClick={() => setTheme(item)}
              className={cn(
                "border cursor-pointer rounded-lg overflow-hidden relative w-32 h-28 flex flex-col justify-between items-center shadow-sm hover:border-primary transition",
                theme === item && "border-primary"
              )}>
              {/* Preview */}
              <div
                className={cn(
                  "w-full h-20 flex flex-col justify-center items-center",
                  item === "light" && "bg-gray-100 text-black",
                  item === "dark" && "bg-gray-950 text-white"
                )}>
                <div className="w-20 h-3 rounded bg-current/30 mb-2"></div>
                <div className="w-16 h-3 rounded bg-current/30"></div>
              </div>

              {/* Label */}
              <span className="text-sm capitalize mb-2">{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
