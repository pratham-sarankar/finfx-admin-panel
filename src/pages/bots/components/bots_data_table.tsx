// components/bots/BotsDataTable.tsx
import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLoader,
  IconPlus,
  IconSearch,
  IconTrash,
  IconPencil,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

import { BotService } from "@/services/bot";

// Local Bot type (keeps parity with service/backend)
export interface Bot {
  id: string;
  name: string;
  description?: string;
  recommendedCapital?: number;
  performanceDuration?: string | number;
  script?: string;
  createdAt?: string;
}

const PERFORMANCE_OPTIONS = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"];

/* ----------------------------- Columns factory ---------------------------- */
const createColumns = (
  onEdit: (b: Bot) => void,
  onDelete: (b: Bot) => void
): ColumnDef<Bot>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name || "-",
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-sm text-sm leading-snug line-clamp-2">
        {row.original.description ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "recommendedCapital",
    header: "Recommended Capital",
    cell: ({ row }) =>
      row.original.recommendedCapital == null
        ? "-"
        : `${row.original.recommendedCapital}`,
  },
  {
    accessorKey: "performanceDuration",
    header: "Perf. Duration",
    cell: ({ row }) => row.original.performanceDuration ?? "-",
  },
  {
    accessorKey: "script",
    header: "Script",
    cell: ({ row }) => row.original.script ?? "-",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleDateString()
        : "-",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const b = row.original as Bot;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon">
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => {
                onEdit(b);
              }}>
              <div className="flex items-center gap-2">
                <IconPencil className="h-4 w-4" /> Edit
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(b)}>
              <div className="flex items-center gap-2">
                <IconTrash className="h-4 w-4" /> Delete
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

/* ------------------------------ Add/Edit Drawer -------------------------- */
function AddBotDrawer({
  bot,
  onAdded,
  onUpdated,
  onClose,
}: {
  bot?: Bot | null;
  onAdded?: () => void;
  onUpdated?: () => void;
  onClose?: () => void;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const isEdit = !!bot;
  const [loading, setLoading] = React.useState(false);

  const [form, setForm] = React.useState<{
    name: string;
    description: string;
    recommendedCapital: number | undefined;
    performanceDuration: string;
    script: string;
  }>({
    name: "",
    description: "",
    recommendedCapital: undefined,
    performanceDuration: "1M",
    script: "",
  });

  React.useEffect(() => {
    if (!bot) {
      setForm({
        name: "",
        description: "",
        recommendedCapital: undefined,
        performanceDuration: "1M",
        script: "",
      });
      setOpen(false);
      return;
    }

    setForm({
      name: bot.name ?? "",
      description: bot.description ?? "",
      recommendedCapital: bot.recommendedCapital,
      performanceDuration: String(bot.performanceDuration ?? "1M"),
      script: bot.script ?? "",
    });
    // open drawer for edit
    setOpen(true);
  }, [bot]);

  const reset = () => {
    setOpen(false);
    setForm({
      name: "",
      description: "",
      recommendedCapital: undefined,
      performanceDuration: "1M",
      script: "",
    });
    onClose?.();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.name || form.name.trim().length < 2) {
      toast.error("Bot name is required (2+ chars)");
      return;
    }
    if (!form.description || form.description.trim().length < 10) {
      toast.error("Bot description is required (10+ chars)");
      return;
    }
    if (
      form.recommendedCapital === undefined ||
      Number.isNaN(form.recommendedCapital)
    ) {
      toast.error("Recommended capital is required");
      return;
    }

    if (
      !form.performanceDuration ||
      !PERFORMANCE_OPTIONS.includes(form.performanceDuration)
    ) {
      toast.error("Please select a valid performance duration");
      return;
    }
    if (form.script && form.script.length > 10) {
      toast.error("script cannot exceed 10 characters");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        recommendedCapital: form.recommendedCapital,
        performanceDuration:
          typeof form.performanceDuration === "string"
            ? form.performanceDuration
            : String(form.performanceDuration || ""),
        script: form.script || undefined,
      };

      if (isEdit && bot) {
        await BotService.updateBot(bot.id, payload);
        toast.success("Bot updated successfully");
        reset();
        onUpdated?.();
      } else {
        await BotService.createBot(payload as any);
        toast.success("Bot created successfully");
        reset();
        onAdded?.();
      }
    } catch (err: any) {
      const msg = err?.message || "Operation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) onClose?.();
      }}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add Bot</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{isEdit ? "Edit Bot" : "Create New Bot"}</DrawerTitle>
          <DrawerDescription>
            {isEdit ? "Update bot details" : "Create a new trading bot"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="recommendedCapital">Recommended Capital *</Label>
              <Input
                id="recommendedCapital"
                type="number"
                step="0.01"
                value={
                  form.recommendedCapital === undefined
                    ? ""
                    : String(form.recommendedCapital)
                }
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    recommendedCapital:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="performanceDuration">
                Performance Duration *
              </Label>
              <Select
                value={form.performanceDuration}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, performanceDuration: v }))
                }>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {PERFORMANCE_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="script">Script</Label>
              <Input
                id="script"
                value={form.script}
                onChange={(e) =>
                  setForm((p) => ({ ...p, script: e.target.value }))
                }
                className="w-full"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : isEdit ? (
                  "Update Bot"
                ) : (
                  "Create Bot"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" onClick={reset} className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </form>
        </div>

        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
}

/* ------------------------------- Main Table ------------------------------- */

export function BotsDataTable() {
  const [data, setData] = React.useState<Bot[]>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [editing, setEditing] = React.useState<Bot | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] =
    React.useState(false);
  const [toDelete, setToDelete] = React.useState<Bot | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

  // debounce searchQuery -> debouncedSearchQuery
  React.useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearchQuery(searchQuery.trim()),
      300
    );
    return () => clearTimeout(t);
  }, [searchQuery]);

  // reset page to 0 when search changes
  React.useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearchQuery]);

  const fetchBots = React.useCallback(
    async (pageIndex: number, pageSize: number, query?: string) => {
      setLoading(true);
      try {
        const res = await BotService.getBots(
          pageIndex + 1,
          pageSize,
          query ?? ""
        );
        setData(res.data || []);
        setTotalPages(res.totalPages ?? 1);
        setTotalItems(res.totalItems ?? res.data?.length ?? 0);
      } catch (err: any) {
        console.error("Failed to fetch bots:", err);
        toast.error(err?.message || "Failed to load bots");
        setData([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // fetch when pagination or search changes
  React.useEffect(() => {
    fetchBots(pagination.pageIndex, pagination.pageSize, debouncedSearchQuery);
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchQuery,
    fetchBots,
  ]);

  // initial load
  React.useEffect(() => {
    fetchBots(0, pagination.pageSize, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = React.useMemo(
    () => createColumns(handleEdit, handleDelete),
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, pagination },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // helper functions (defined after table so they can use it)
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  function handleAdded() {
    setRowSelection({});
    table.setPageIndex(0);
    fetchBots(0, table.getState().pagination.pageSize, debouncedSearchQuery);
  }

  function handleUpdated() {
    setEditing(null);
    setRowSelection({});
    fetchBots(pagination.pageIndex, pagination.pageSize, debouncedSearchQuery);
  }

  // defensive edit: clear then set so clicking the same bot re-opens drawer
  function handleEdit(b: Bot) {
    setEditing(null);
    // ensure next state is set after a tick
    requestAnimationFrame(() => setEditing(b));
  }

  function handleDelete(b: Bot) {
    setToDelete(b);
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await BotService.deleteBot(toDelete.id);
      toast.success("Bot deleted successfully");
      setRowSelection({});
      fetchBots(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchQuery
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete bot");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setToDelete(null);
    }
  }

  function handleMultiDelete() {
    setShowMultiDeleteConfirm(true);
  }

  async function confirmMultiDelete() {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const ids = selectedRows.map((r) => r.original.id.toString());
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      await BotService.deleteMultipleBots(ids);
      toast.success("Selected bots deleted successfully");
      setRowSelection({});
      fetchBots(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchQuery
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete bots");
    } finally {
      setDeleting(false);
      setShowMultiDeleteConfirm(false);
    }
  }

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 py-2 lg:px-6">
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleMultiDelete}
              disabled={deleting}>
              {deleting ? (
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconTrash className="mr-2 h-4 w-4" />
              )}
              Delete Selected ({selectedCount})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>

          <AddBotDrawer
            bot={editing}
            onAdded={handleAdded}
            onUpdated={handleUpdated}
            onClose={() => setEditing(null)}
          />
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <IconLoader className="h-4 w-4 animate-spin" />
                      Loading bots...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center">
                    No bots found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {totalItems}{" "}
            row(s) selected.
          </div>

          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(v) => table.setPageSize(Number(v))}>
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((ps) => (
                    <SelectItem key={ps} value={`${ps}`}>
                      {ps}
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

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Bot"
        description={`Are you sure you want to delete this bot? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showMultiDeleteConfirm}
        onOpenChange={setShowMultiDeleteConfirm}
        title="Delete Multiple Bots"
        description={`Are you sure you want to delete ${selectedCount} selected bot(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={confirmMultiDelete}
        variant="destructive"
      />
    </div>
  );
}

export default BotsDataTable;
