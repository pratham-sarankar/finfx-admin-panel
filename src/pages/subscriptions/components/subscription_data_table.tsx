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
  IconUser,
  IconUserOff,
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionService } from "@/services/subscription";
import { UserService } from "@/services/user";
import { getApiUrl } from "@/config/api";
import { StorageService } from "@/lib/storage";
import type {
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from "@/types/subscription";
import type { User as ApiUser } from "@/types/user";

type CombinedSubscription = Subscription & {
  userName?: string;
  botName?: string;
  packageName?: string;
};

interface Bot {
  id: string;
  name: string;
  description: string;
}

interface BotPackage {
  id: string; // BotPackage id (required by backend)
  name: string;
  price?: number;
  duration?: number;
}

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
      const pkg = row.original.package as any;
      if (!pkg) return "-";

      return `${pkg.name} - $${pkg.price} (${pkg.duration} days)`;
    },
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
    cell: ({ row }) => {
      const subscription = row.original as Subscription;

      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {subscription.status === "active" && (
            <IconUser className="fill-blue-500 dark:fill-blue-400" />
          )}
          {subscription.status === "paused" && (
            <IconUserOff className="fill-gray-400 dark:fill-gray-300" />
          )}
          {subscription.status === "expired" && (
            <IconTrash className="fill-red-500" />
          )}
          {subscription.status
            ? subscription.status.charAt(0).toUpperCase() +
              subscription.status.slice(1)
            : "-"}
        </Badge>
      );
    },
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
    lotSize: number | undefined;
    status: "active" | "paused" | "expired";
  }>({
    userId: "",
    botId: "",
    botPackageId: "",
    lotSize: undefined,
    status: "active",
  });

  const [loading, setLoading] = React.useState(false);
  const [users, setUsers] = React.useState<ApiUser[]>([]);
  const [bots, setBots] = React.useState<Bot[]>([]);
  const [availablePackages, setAvailablePackages] = React.useState<
    BotPackage[]
  >([]);
  const [userSearchOpen, setUserSearchOpen] = React.useState(false);
  const [userSearch, setUserSearch] = React.useState("");
  const [loadingUsers, setLoadingUsers] = React.useState(false);
  const [loadingBots, setLoadingBots] = React.useState(false);
  const [loadingPackages, setLoadingPackages] = React.useState(false);
  const isEdit = !!subscription;

  // Reset form when switching from edit mode back to create mode
  React.useEffect(() => {
    if (!subscription) {
      setForm({
        userId: "",
        botId: "",
        botPackageId: "",
        lotSize: undefined,
        status: "active",
      });
      setAvailablePackages([]);
      setUserSearch("");
      setUsers([]);
    }
  }, [subscription]);

  // Fetch users only when query length >= 2 (admin searches explicitly)
  React.useEffect(() => {
    const fetchUsers = async () => {
      const hasQuery = !!(userSearch && userSearch.trim().length >= 2);
      if (!hasQuery) {
        setUsers([]);
        return;
      }

      setLoadingUsers(true);
      try {
        const res = await UserService.getUsers(1, 20, userSearch);
        setUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
        toast.error("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [userSearch]);

  // Fetch bots on component mount
  React.useEffect(() => {
    const fetchBots = async () => {
      setLoadingBots(true);
      try {
        const response = await fetch(getApiUrl("/bots"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(StorageService.getToken() && {
              Authorization: `Bearer ${StorageService.getToken()}`,
            }),
          },
        });
        if (!response.ok) throw new Error("Failed to fetch bots");
        const data = await response.json();
        setBots(data.data || data.bots || []);
      } catch (err) {
        console.error("Failed to fetch bots:", err);
        setBots([]);
        toast.error("Failed to load bots");
      } finally {
        setLoadingBots(false);
      }
    };

    fetchBots();
  }, []);

  // Fetch packages when bot changes
  React.useEffect(() => {
    const fetchPackages = async () => {
      if (!form.botId) {
        setAvailablePackages([]);
        return;
      }

      setLoadingPackages(true);
      try {
        const candidates = [
          `${getApiUrl("/bot-packages")}?botId=${form.botId}`,
          `${getApiUrl("/bot-packages")}?bot=${form.botId}`,
        ];

        let success = false;
        let lastStatus: number | undefined;
        let lastBody: any;
        for (const url of candidates) {
          try {
            const response = await fetch(url, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...(StorageService.getToken() && {
                  Authorization: `Bearer ${StorageService.getToken()}`,
                }),
              },
            });
            lastStatus = response.status;
            if (!response.ok) {
              try {
                lastBody = await response.text();
              } catch {}
              console.warn(
                `Packages request failed: ${url}`,
                lastStatus,
                lastBody
              );
              continue;
            }
            const data = await response.json();
            const raw = data.data || data.packages || data || [];
            const mapped = Array.isArray(raw)
              ? raw.map((item: any) => {
                  const pkg = item.package || {};
                  return {
                    id: pkg.id || item.id,
                    name: pkg.name || item.name,
                    price: item.price ?? pkg.price,
                    duration: pkg.duration ?? item.duration,
                  } as BotPackage;
                })
              : [];
            setAvailablePackages(mapped);
            success = true;
            break;
          } catch (innerErr) {
            console.warn("Packages request error: ", url, innerErr);
            continue;
          }
        }

        if (!success) {
          const detail = lastStatus ? ` (status ${lastStatus})` : "";
          toast.error(`Failed to load packages${detail}`);
          setAvailablePackages([]);
        }
      } catch (err) {
        console.error("Failed to fetch packages:", err);
        setAvailablePackages([]);
        toast.error("Failed to load packages");
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, [form.botId]);

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
        lotSize: subscription.lotSize ?? undefined,
        status:
          (subscription.status as "active" | "paused" | "expired") || "active",
      });

      setOpen(true);
    }
  }, [subscription, bots]);

  const reset = () => {
    setOpen(false);
    setForm({
      userId: "",
      botId: "",
      botPackageId: "",
      lotSize: undefined,
      status: "active",
    });
    setAvailablePackages([]);
    setUserSearch("");
    setUsers([]);
    onClose?.();
  };

  const handleBotChange = (botId: string) => {
    setForm((prev) => ({
      ...prev,
      botId,
      botPackageId: "", // Reset package when bot changes
    }));
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
        };
        await SubscriptionService.updateSubscription(
          subscription.id,
          updateData
        );

        toast.success("Subscription updated successfully");
        reset();
        onUpdated?.();
      } else {
        const createData: CreateSubscriptionRequest = {
          userId: form.userId,
          botId: form.botId,
          botPackageId: form.botPackageId,
          lotSize: form.lotSize,
          status: form.status,
        };

        await SubscriptionService.createSubscription(createData);

        reset();
        onAdded?.();
        // toast.success("Subscription created successfully");
      }
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === form.userId);

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
            {/* User Selection with Search */}
            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="userId">User *</Label>
              {isEdit ? (
                <Input
                  value={(() => {
                    const u = (subscription?.user as any) || null;
                    if (u?.fullName) {
                      return `${u.fullName}${u.email ? ` (${u.email})` : ""}`;
                    }
                    return "Unknown User";
                  })()}
                  disabled
                  className="bg-muted w-full"
                />
              ) : (
                <Popover
                  open={userSearchOpen}
                  onOpenChange={(open) => {
                    setUserSearchOpen(open);
                    if (open) setUserSearch("");
                  }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userSearchOpen}
                      className="w-full justify-between">
                      {selectedUser
                        ? `${selectedUser.fullName} (${selectedUser.email})`
                        : "Search and select user..."}
                      <IconSearch className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="min-w-[250px] w-[var(--radix-popover-trigger-width)] px-7"
                    align="start">
                    <Command>
                      <CommandInput
                        className="w-full"
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onValueChange={setUserSearch}
                      />
                      <CommandList className="w-full px-5">
                        {loadingUsers ? (
                          <div className="flex items-center justify-center px-12">
                            <IconLoader className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Searching...</span>
                          </div>
                        ) : users.length === 0 ? (
                          <CommandEmpty>
                            {userSearch && userSearch.trim().length >= 2
                              ? "No users found"
                              : "Start typing to search or see recent users"}
                          </CommandEmpty>
                        ) : (
                          <CommandGroup className="w-full px-6">
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.fullName} ${user.email}`}
                                onSelect={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    userId: user.id,
                                  }));
                                  setUserSearchOpen(false);
                                }}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {user.fullName}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {user.email}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Bot Selection */}
            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="botId">Bot *</Label>
              <Select value={form.botId} onValueChange={handleBotChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a bot" />
                </SelectTrigger>
                <SelectContent>
                  {loadingBots ? (
                    <div className="flex items-center justify-center p-4">
                      <IconLoader className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading bots...</span>
                    </div>
                  ) : (
                    bots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        {bot.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Package Selection */}
            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="botPackageId">Package *</Label>
              <Select
                value={form.botPackageId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, botPackageId: value }))
                }
                disabled={!form.botId || loadingPackages}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingPackages
                        ? "Loading packages..."
                        : form.botId
                        ? "Select a package"
                        : "Select bot first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {loadingPackages ? (
                    <div className="flex items-center justify-center p-4">
                      <IconLoader className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading packages...</span>
                    </div>
                  ) : (
                    availablePackages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                        {typeof pkg.price === "number"
                          ? ` - $${pkg.price}`
                          : ""}
                        {pkg.duration ? ` (${pkg.duration} days)` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Lot Size */}
            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="lotSize">Lot Size *</Label>
              <Input
                id="lotSize"
                type="number"
                min="0"
                step="0.01"
                value={form.lotSize === undefined ? "" : String(form.lotSize)}
                onChange={(e) =>
                  setForm((v) => ({
                    ...v,
                    lotSize:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-3 w-full">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={form.status}
                onValueChange={(value: "active" | "paused" | "expired") =>
                  setForm((prev) => ({ ...prev, status: value }))
                }>
                <SelectTrigger className="w-full">
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

            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={loading} className="flex-1">
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
          res.data.map((s: any) => {
            const user = s.user ?? s.userId ?? s.user_id ?? undefined;
            const bot = s.bot ?? s.botId ?? s.bot_id ?? undefined;
            let pkg: any =
              s.package ?? s.botPackage ?? s.botPackageId ?? undefined;

            if (pkg && typeof pkg === "string") {
              pkg = { id: pkg };
            }
            return { ...s, user, bot, package: pkg };
          })
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

  AddSubscriptionDrawer;

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

  const handleAdded = () => {
    setRowSelection({});
    // Ensure UI resets to first page and refetches
    table.setPageIndex(0);
    fetchSubscriptions(
      0,
      table.getState().pagination.pageSize,
      debouncedSearchQuery
    );
  };

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

AddSubscriptionDrawer;
