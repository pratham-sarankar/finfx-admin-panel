import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLoader,
  IconSearch,
} from "@tabler/icons-react";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SignalService } from "@/services/signal";
import type { Signal } from "@/types/signal";

/* ---------------- helpers ---------------- */
// prefer normalized botName, fallback to nested objects
const getBotName = (s: any): string => {
  if (!s) return "-";
  if (typeof s.botName === "string" && s.botName.trim()) return s.botName;
  if (s?.bot && typeof s.bot === "object" && s.bot.name) return s.bot.name;
  if (s?.botId && typeof s.botId === "object" && s.botId.name)
    return s.botId.name;
  if (s?.bot && typeof s.bot === "string") return s.bot;
  if (s?.botId && typeof s.botId === "string") return s.botId;
  return "-";
};

function formatNumber(v: any) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  const n = Number(v);
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2).replace(/\.?0+$/, "");
}

/* ---------------- columns (4 fixed columns) ---------------- */
const COL_MIN_WIDTH = 160; // px

const COLUMNS = (): ColumnDef<Signal>[] => [
  {
    accessorKey: "pairName",
    header: () => (
      <div
        style={{ minWidth: COL_MIN_WIDTH }}
        className="text-left whitespace-nowrap">
        Pair
      </div>
    ),
    cell: ({ row }) => (
      <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
        {row.original.pairName ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "entryPrice",
    header: () => (
      <div
        style={{ minWidth: COL_MIN_WIDTH }}
        className="text-left whitespace-nowrap">
        Entry Price
      </div>
    ),
    cell: ({ row }) => (
      <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
        {formatNumber((row.original as any).entryPrice)}
      </div>
    ),
  },
  {
    accessorKey: "exitPrice",
    header: () => (
      <div
        style={{ minWidth: COL_MIN_WIDTH }}
        className="text-left whitespace-nowrap">
        Exit Price
      </div>
    ),
    cell: ({ row }) => (
      <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
        {formatNumber((row.original as any).exitPrice)}
      </div>
    ),
  },
  {
    accessorKey: "botName", // ensure accessor is botName so table uses name (not id)
    header: () => (
      <div
        style={{ minWidth: COL_MIN_WIDTH }}
        className="text-left whitespace-nowrap">
        Bot Name
      </div>
    ),
    cell: ({ row }) => (
      <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
        {row.original.botName || getBotName(row.original)}
      </div>
    ),
  },
];

/* ---------------- component ---------------- */
export default function SignalsDataTable() {
  const [data, setData] = React.useState<Signal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

  // debounce same as UsersDataTable
  React.useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearchQuery(searchQuery.trim()),
      300
    );
    return () => clearTimeout(t);
  }, [searchQuery]);

  // reset to first page when new search settles
  React.useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    if (pagination.pageIndex !== 0)
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, searchQuery]);

  const fetchSignals = React.useCallback(
    async (pageIndex: number, pageSize: number, query?: string) => {
      setLoading(true);
      try {
        const res: any = await SignalService.getSignals(
          pageIndex + 1,
          pageSize,
          query ?? ""
        );
        const items: any[] = res?.data ?? [];

        const totalSignals =
          res?.pagination?.totalSignals ??
          res?.pagination?.total ??
          res?.totalItems ??
          res?.totalSignals ??
          items.length;

        const totalPagesFromServer =
          res?.pagination?.totalPages ??
          res?.totalPages ??
          Math.max(1, Math.ceil(totalSignals / pageSize));

        const safePageIndex = Math.max(
          0,
          Math.min(pageIndex, Math.max(0, totalPagesFromServer - 1))
        );

        let displayed: any[] = items;
        const serverProvidedPagination = Boolean(
          res?.pagination ||
            typeof res?.totalPages !== "undefined" ||
            typeof res?.totalItems !== "undefined"
        );

        if (!serverProvidedPagination) {
          const pages = Math.max(1, Math.ceil(items.length / pageSize));
          const idx = Math.max(0, Math.min(pageIndex, pages - 1));
          displayed = items.slice(idx * pageSize, (idx + 1) * pageSize);
        } else {
          if (items.length > pageSize) {
            displayed = items.slice(
              safePageIndex * pageSize,
              (safePageIndex + 1) * pageSize
            );
          } else {
            displayed = items;
          }
        }

        setData(displayed as Signal[]);
        setTotalPages(Math.max(1, Number(totalPagesFromServer)));
        setTotalItems(Number(totalSignals));

        if (safePageIndex !== pageIndex) {
          setPagination((p) => ({ ...p, pageIndex: safePageIndex }));
        }
      } catch (err: any) {
        console.error("Failed to fetch signals:", err);
        toast.error(err?.message || "Failed to load signals");
        setData([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchSignals(
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchQuery
    );
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchQuery,
    fetchSignals,
  ]);

  // initial load
  React.useEffect(() => {
    fetchSignals(0, pagination.pageSize, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = React.useMemo(() => COLUMNS(), []);

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    getRowId: (row) =>
      (row as any).id?.toString?.() ??
      (row as any)._id?.toString?.() ??
      Math.random().toString(),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  //

  return (
    <div className="w-full flex-col justify-start gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 lg:px-6">
        <div className="flex items-center gap-2"></div>

        {/* Search on the right (Users-like) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </div>
      </div>

      {/* Table area - NOTE: parent does NOT have overflow-auto; only table-wrapper scrolls horizontally */}
      <div className="relative flex flex-col gap-4 px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          {/* Table wrapper that scrolls horizontally on small screens (only this wrapper) */}
          <div className="w-full overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <IconLoader className="h-4 w-4 animate-spin" /> Loading
                        signals...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="align-top">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No signals found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel?.().rows.length ?? 0} of{" "}
            {totalItems} row(s) selected.
          </div>

          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {totalPages}
            </div>

            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}>
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}>
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
