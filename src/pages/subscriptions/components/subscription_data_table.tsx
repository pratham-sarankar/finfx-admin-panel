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
  IconCalendar,
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

import { Badge } from "@/components/ui/badge";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionService } from "@/services/subscription";
import type {
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from "@/types/subscription";

type CombinedSubscription = Subscription & {
  userName?: string;
  botName?: string;
  packageName?: string;
};

// Mock data for dropdowns - replace with actual API calls
const mockUsers = [
  { id: "1", fullName: "John Doe", email: "john@example.com" },
  { id: "2", fullName: "Jane Smith", email: "jane@example.com" },
];

const mockBots = [
  { id: "1", name: "Trading Bot A" },
  { id: "2", name: "Trading Bot B" },
  { id: "3", name: "Analysis Bot" },
];

const mockPackages: Record<
  string,
  { id: string; name: string; duration: string }[]
> = {
  "1": [
    { id: "1", name: "Basic Monthly", duration: "monthly" },
    { id: "2", name: "Premium Monthly", duration: "monthly" },
    { id: "3", name: "Basic Yearly", duration: "yearly" },
  ],
  "2": [
    { id: "4", name: "Standard Monthly", duration: "monthly" },
    { id: "5", name: "Pro Yearly", duration: "yearly" },
  ],
  "3": [
    { id: "6", name: "Analyzer Basic", duration: "monthly" },
    { id: "7", name: "Analyzer Pro", duration: "yearly" },
  ],
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "expired", label: "Expired" },
];

const createColumns = (
  onEdit: (row: Subscription) => void,
  onDelete: (row: Subscription) => void
): ColumnDef<CombinedSubscription>[] => [
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
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const u = row.original.user as any;
      return u?.fullName ? `${u.fullName} (${u.email ?? "-"})` : "-";
    },
    enableHiding: false,
  },
  {
    accessorKey: "bot",
    header: "Bot",
    cell: ({ row }) => {
      const b = row.original.bot as any;
      return b?.name ?? "-";
    },
    enableHiding: false,
  },
  {
    accessorKey: "package",
    header: "Package",
    cell: ({ row }) => {
      const p = row.original.package as any;
      return p?.name ?? "-";
    },
    enableHiding: false,
  },
  {
    accessorKey: "lotSize",
    header: "Lot Size",
    cell: ({ row }) => row.original.lotSize ?? "-",
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`text-muted-foreground px-1.5 ${
          row.original.status === "active"
            ? "border-green-500 text-green-700"
            : row.original.status === "expired"
            ? "border-orange-500 text-orange-700"
            : row.original.status === "paused"
            ? "border-yellow-500 text-yellow-700"
            : ""
        }`}>
        {row.original.status
          ? row.original.status.toString().toUpperCase()
          : "-"}
      </Badge>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "subscribedAt",
    header: "Subscribed At",
    cell: ({ row }) =>
      row.original.subscribedAt
        ? new Date(row.original.subscribedAt).toLocaleDateString()
        : "-",
  },
  {
    accessorKey: "expiresAt",
    header: "Expires At",
    cell: ({ row }) =>
      row.original.expiresAt
        ? new Date(row.original.expiresAt).toLocaleDateString()
        : "-",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sub = row.original as Subscription;
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
            <DropdownMenuItem onClick={() => onEdit(sub)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(sub)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function AddSubscriptionDrawer({
  subscription,
  onAdded,
  onUpdated,
  onClose,
}: {
  subscription?: Subscription | null;
  onAdded?: () => void;
  onUpdated?: () => void;
  onClose?: () => void;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<{
    userId: string;
    botId: string;
    botPackageId: string;
    lotSize: number;
    status: "active" | "paused" | "expired";
    expiresAt: Date | undefined;
  }>({
    userId: "",
    botId: "",
    botPackageId: "",
    lotSize: 1,
    status: "active",
    expiresAt: undefined,
  });

  const [loading, setLoading] = React.useState(false);
  const [availablePackages, setAvailablePackages] = React.useState<any[]>([]);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const isEdit = !!subscription;

  React.useEffect(() => {
    if (subscription) {
      setForm({
        userId:
          (subscription.user as any)?.id || (subscription.user as string) || "",
        botId:
          (subscription.bot as any)?.id || (subscription.bot as string) || "",
        botPackageId:
          (subscription.package as any)?.id ||
          (subscription.package as string) ||
          "",
        lotSize: subscription.lotSize ?? 1,
        status:
          (subscription.status as "active" | "paused" | "expired") || "active",
        expiresAt: subscription.expiresAt
          ? new Date(subscription.expiresAt)
          : undefined,
      });

      // Set available packages based on selected bot
      const botId =
        (subscription.bot as any)?.id || (subscription.bot as string);
      if (botId && mockPackages[botId]) {
        setAvailablePackages(mockPackages[botId]);
      }

      setOpen(true);
    }
  }, [subscription]);

  const reset = () => {
    setOpen(false);
    setForm({
      userId: "",
      botId: "",
      botPackageId: "",
      lotSize: 1,
      status: "active",
      expiresAt: undefined,
    });
    setAvailablePackages([]);
    onClose?.();
  };

  const handleBotChange = (botId: string) => {
    setForm((prev) => ({
      ...prev,
      botId,
      botPackageId: "", // Reset package when bot changes
    }));
    setAvailablePackages(mockPackages[botId] || []);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.userId || !form.botId || !form.botPackageId || !form.lotSize) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && subscription) {
        const updateData: UpdateSubscriptionRequest = {
          botId: form.botId,
          botPackageId: form.botPackageId,
          lotSize: form.lotSize,
          status: form.status,
          expiresAt: form.expiresAt?.toISOString(),
        };
        await SubscriptionService.updateSubscription(
          subscription.id,
          updateData
        );
        toast.success("Subscription updated successfully");
        onUpdated?.();
      } else {
        const createData: CreateSubscriptionRequest = {
          userId: form.userId,
          botId: form.botId,
          botPackageId: form.botPackageId,
          lotSize: form.lotSize,
          status: form.status,
          expiresAt: form.expiresAt?.toISOString(),
        };
        await SubscriptionService.createSubscription(createData);
        toast.success("Subscription created successfully");
        onAdded?.();
      }
      reset();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add Subscription</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>
            {isEdit ? "Edit Subscription" : "Create New Subscription"}
          </DrawerTitle>
          <DrawerDescription>
            {isEdit
              ? "Update subscription details"
              : "Create a new subscription for a user"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col gap-4">
            {/* User Selection - Only for create, read-only for edit */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="userId">User *</Label>
              {isEdit ? (
                <Input
                  value={
                    mockUsers.find((u) => u.id === form.userId)?.fullName ||
                    "Unknown User"
                  }
                  disabled
                  className="bg-muted"
                />
              ) : (
                <Select
                  value={form.userId}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, userId: value }))
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Bot Selection */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="botId">Bot *</Label>
              <Select value={form.botId} onValueChange={handleBotChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bot" />
                </SelectTrigger>
                <SelectContent>
                  {mockBots.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package Selection - Dependent on Bot */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="botPackageId">Package *</Label>
              <Select
                value={form.botPackageId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, botPackageId: value }))
                }
                disabled={!form.botId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      form.botId ? "Select a package" : "Select bot first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availablePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lot Size */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="lotSize">Lot Size *</Label>
              <Input
                id="lotSize"
                type="number"
                min="1"
                value={String(form.lotSize)}
                onChange={(e) =>
                  setForm((v) => ({
                    ...v,
                    lotSize: Number(e.target.value) || 1,
                  }))
                }
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={form.status}
                onValueChange={(value: "active" | "paused" | "expired") =>
                  setForm((prev) => ({ ...prev, status: value }))
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date - Optional */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal">
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {form.expiresAt ? (
                      form.expiresAt.toLocaleDateString()
                    ) : (
                      <span className="text-muted-foreground">
                        Set expiry date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.expiresAt}
                    onSelect={(date) => {
                      setForm((prev) => ({ ...prev, expiresAt: date }));
                      setShowCalendar(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                  {form.expiresAt && (
                    <div className="p-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            expiresAt: undefined,
                          }));
                          setShowCalendar(false);
                        }}>
                        Clear Date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : isEdit ? (
                  "Update Subscription"
                ) : (
                  "Create Subscription"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" onClick={reset}>
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

export function SubscriptionsDataTable() {
  const [data, setData] = React.useState<CombinedSubscription[]>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [editing, setEditing] = React.useState<Subscription | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] =
    React.useState(false);
  const [toDelete, setToDelete] = React.useState<Subscription | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchSubscriptions = React.useCallback(
    async (page: number, pageSize: number, query?: string) => {
      setLoading(true);
      try {
        const res = await SubscriptionService.getSubscriptions(
          page + 1,
          pageSize,
          query
        );
        setData(
          res.data.map((s) => ({
            ...s,
          }))
        );
        setTotalPages(res.totalPages ?? 1);
        setTotalItems(res.totalItems ?? res.totalSubscriptions ?? 0);
      } catch (err) {
        console.error(err);
        toast.error((err as any)?.message || "Failed to fetch subscriptions");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchSubscriptions(
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchQuery
    );
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchQuery,
    fetchSubscriptions,
  ]);

  React.useEffect(() => {
    fetchSubscriptions(0, 10);
  }, [fetchSubscriptions]);

  const handleAdded = () => {
    setRowSelection({});
    fetchSubscriptions(
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchQuery
    );
  };

  const handleUpdated = () => {
    setEditing(null);
    setRowSelection({});
    fetchSubscriptions(
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchQuery
    );
  };

  const handleEdit = (s: Subscription) => setEditing(s);
  const handleDelete = (s: Subscription) => {
    setToDelete(s);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await SubscriptionService.deleteSubscription(toDelete.id);
      toast.success("Subscription deleted successfully");
      setRowSelection({});
      fetchSubscriptions(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchQuery
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete subscription");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setToDelete(null);
    }
  };

  const handleMultiDelete = () => setShowMultiDeleteConfirm(true);

  const confirmMultiDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const ids = selectedRows.map((r) => r.original.id.toString());
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      await SubscriptionService.deleteMultipleSubscriptions(ids);
      toast.success("Selected subscriptions deleted successfully");
      setRowSelection({});
      fetchSubscriptions(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchQuery
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete subscriptions");
    } finally {
      setDeleting(false);
      setShowMultiDeleteConfirm(false);
    }
  };

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

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

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
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>

          <AddSubscriptionDrawer
            subscription={editing}
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
                      Loading subscriptions...
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
                    No subscriptions found.
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
        title="Delete Subscription"
        description={`Are you sure you want to delete this subscription? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showMultiDeleteConfirm}
        onOpenChange={setShowMultiDeleteConfirm}
        title="Delete Multiple Subscriptions"
        description={`Are you sure you want to delete ${selectedCount} selected subscription(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={confirmMultiDelete}
        variant="destructive"
      />
    </div>
  );
}
