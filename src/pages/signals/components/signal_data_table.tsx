// // components/signals/SignalsDataTable.tsx
// import * as React from "react";
// import {
//   IconChevronLeft,
//   IconChevronRight,
//   IconChevronsLeft,
//   IconChevronsRight,
//   IconDotsVertical,
//   IconLoader,
//   IconPlus,
//   IconSearch,
//   IconTrash,
//   IconPencil,
// } from "@tabler/icons-react";
// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
// import { useIsMobile } from "@/hooks/use-mobile";

// import { SignalService } from "@/services/signal.ts";
// import type { Signal } from "@/types/signal.ts";

// const DIRECTION_OPTIONS = ["LONG", "SHORT"] as const;

// /* ----------------------------- util helpers ------------------------------ */
// function toInputDateTimeLocal(iso?: string | Date) {
//   if (!iso) return "";
//   const d = typeof iso === "string" ? new Date(iso) : iso;
//   if (Number.isNaN(d.getTime())) return "";
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
//     d.getHours()
//   )}:${pad(d.getMinutes())}`;
// }

// /* ----------------------------- Columns factory ---------------------------- */
// const createColumns = (
//   onEdit: (s: Signal) => void,
//   onDelete: (s: Signal) => void
// ): ColumnDef<Signal>[] => [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={
//             table.getIsAllPageRowsSelected() ||
//             (table.getIsSomePageRowsSelected() && "indeterminate")
//           }
//           onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
//           aria-label="Select all"
//         />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(v) => row.toggleSelected(!!v)}
//           aria-label="Select row"
//         />
//       </div>
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "pairName",
//     header: "Pair",
//     cell: ({ row }) => row.original.pairName || "-",
//     enableHiding: false,
//   },
//   {
//     accessorKey: "direction",
//     header: "Direction",
//     cell: ({ row }) => row.original.direction || "-",
//   },
//   {
//     accessorKey: "entryTime",
//     header: "Entry Time",
//     cell: ({ row }) =>
//       row.original.entryTime
//         ? new Date(row.original.entryTime).toLocaleString()
//         : "-",
//   },
//   {
//     accessorKey: "entryPrice",
//     header: "Entry Price",
//     cell: ({ row }) =>
//       row.original.entryPrice == null ? "-" : String(row.original.entryPrice),
//   },
//   {
//     accessorKey: "lotSize",
//     header: "Lot",
//     cell: ({ row }) =>
//       row.original.lotSize == null ? "-" : String(row.original.lotSize),
//   },
//   {
//     accessorKey: "profitLoss",
//     header: "P/L",
//     cell: ({ row }) =>
//       row.original.profitLoss == null ? "-" : String(row.original.profitLoss),
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Created",
//     cell: ({ row }) =>
//       row.original.createdAt
//         ? new Date(row.original.createdAt).toLocaleDateString()
//         : "-",
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const s = row.original as Signal;
//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button
//               variant="ghost"
//               className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
//               size="icon">
//               <IconDotsVertical />
//               <span className="sr-only">Open menu</span>
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end" className="w-32">
//             <DropdownMenuItem onClick={() => onEdit(s)}>
//               <div className="flex items-center gap-2">
//                 <IconPencil className="h-4 w-4" /> Edit
//               </div>
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem variant="destructive" onClick={() => onDelete(s)}>
//               <div className="flex items-center gap-2">
//                 <IconTrash className="h-4 w-4" /> Delete
//               </div>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];

// /* ------------------------------ Add/Edit Drawer -------------------------- */
// function AddSignalDrawer({
//   signal,
//   onAdded,
//   onUpdated,
//   onClose,
// }: {
//   signal?: Signal | null;
//   onAdded?: () => void;
//   onUpdated?: () => void;
//   onClose?: () => void;
// }) {
//   const isMobile = useIsMobile();
//   const [open, setOpen] = React.useState(false);
//   const isEdit = !!signal;
//   const [loading, setLoading] = React.useState(false);

//   const [form, setForm] = React.useState<{
//     pairName: string;
//     direction: "LONG" | "SHORT" | "";
//     entryTime: string; // datetime-local
//     entryPrice: number | undefined;
//     lotSize: number | undefined;
//     userId: string;
//     botId?: string;
//     tradeId?: string;
//     stopLossPrice?: number | undefined;
//     targetPrice?: number | undefined;
//     stoploss?: number | undefined;
//     target1r?: number | undefined;
//     target2r?: number | undefined;
//     exitTime?: string; // datetime-local
//     exitPrice?: number | undefined;
//     exitReason?: string;
//   }>({
//     pairName: "",
//     direction: "",
//     entryTime: "",
//     entryPrice: undefined,
//     lotSize: undefined,
//     userId: "",
//     botId: "",
//     tradeId: "",
//     stopLossPrice: undefined,
//     targetPrice: undefined,
//     stoploss: undefined,
//     target1r: undefined,
//     target2r: undefined,
//     exitTime: "",
//     exitPrice: undefined,
//     exitReason: "",
//   });

//   React.useEffect(() => {
//     if (!signal) {
//       setForm({
//         pairName: "",
//         direction: "",
//         entryTime: "",
//         entryPrice: undefined,
//         lotSize: undefined,
//         userId: "",
//         botId: "",
//         tradeId: "",
//         stopLossPrice: undefined,
//         targetPrice: undefined,
//         stoploss: undefined,
//         target1r: undefined,
//         target2r: undefined,
//         exitTime: "",
//         exitPrice: undefined,
//         exitReason: "",
//       });
//       setOpen(false);
//       return;
//     }

//     setForm({
//       pairName: signal.pairName ?? "",
//       direction: (signal.direction as any) ?? "",
//       entryTime: toInputDateTimeLocal(signal.entryTime),
//       entryPrice: signal.entryPrice,
//       lotSize: signal.lotSize,
//       userId:
//         (signal.userId as any)?.toString?.() ?? (signal as any).userId ?? "",
//       botId: (signal.botId as any)?.toString?.() ?? (signal as any).botId ?? "",
//       tradeId: signal.tradeId ?? "",
//       stopLossPrice: signal.stopLossPrice,
//       targetPrice: signal.targetPrice,
//       stoploss: signal.stoploss,
//       target1r: signal.target1r,
//       target2r: signal.target2r,
//       exitTime: toInputDateTimeLocal(signal.exitTime),
//       exitPrice: signal.exitPrice,
//       exitReason: signal.exitReason ?? "",
//     });
//     setOpen(true);
//   }, [signal]);

//   const reset = () => {
//     setOpen(false);
//     setForm({
//       pairName: "",
//       direction: "",
//       entryTime: "",
//       entryPrice: undefined,
//       lotSize: undefined,
//       userId: "",
//       botId: "",
//       tradeId: "",
//       stopLossPrice: undefined,
//       targetPrice: undefined,
//       stoploss: undefined,
//       target1r: undefined,
//       target2r: undefined,
//       exitTime: "",
//       exitPrice: undefined,
//       exitReason: "",
//     });
//     onClose?.();
//   };

//   const validate = () => {
//     if (!form.pairName || form.pairName.trim().length < 3) {
//       toast.error("Pair name is required (min 3 chars)");
//       return false;
//     }
//     if (!form.direction || !DIRECTION_OPTIONS.includes(form.direction as any)) {
//       toast.error("Direction is required (LONG/SHORT)");
//       return false;
//     }
//     if (!form.entryTime) {
//       toast.error("Entry time is required");
//       return false;
//     }
//     if (
//       form.entryPrice === undefined ||
//       Number.isNaN(form.entryPrice) ||
//       Number(form.entryPrice) <= 0
//     ) {
//       toast.error("Valid entry price is required");
//       return false;
//     }
//     if (
//       form.lotSize === undefined ||
//       Number.isNaN(form.lotSize) ||
//       Number(form.lotSize) <= 0
//     ) {
//       toast.error("Valid lot size is required");
//       return false;
//     }
//     if (!form.userId || form.userId.trim().length < 10) {
//       toast.error("User ID is required");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!validate()) return;

//     setLoading(true);
//     try {
//       const payload: any = {
//         pairName: form.pairName.trim(),
//         direction: form.direction as "LONG" | "SHORT",
//         entryTime: new Date(form.entryTime).toISOString(),
//         entryPrice: Number(form.entryPrice),
//         lotSize: Number(form.lotSize),
//         userId: form.userId.trim(),
//       };

//       // optional fields
//       if (form.botId) payload.botId = form.botId.trim();
//       if (form.tradeId) payload.tradeId = form.tradeId.trim();
//       if (form.stopLossPrice != null)
//         payload.stopLossPrice = Number(form.stopLossPrice);
//       if (form.targetPrice != null)
//         payload.targetPrice = Number(form.targetPrice);
//       if (form.stoploss != null) payload.stoploss = Number(form.stoploss);
//       if (form.target1r != null) payload.target1r = Number(form.target1r);
//       if (form.target2r != null) payload.target2r = Number(form.target2r);
//       if (form.exitTime)
//         payload.exitTime = new Date(form.exitTime).toISOString();
//       if (form.exitPrice != null) payload.exitPrice = Number(form.exitPrice);
//       if (form.exitReason) payload.exitReason = form.exitReason.trim();

//       if (isEdit && signal) {
//         await SignalService.updateSignal(signal.id, payload);
//         toast.success("Signal updated");
//         reset();
//         onUpdated?.();
//       } else {
//         await SignalService.createSignal(payload);
//         toast.success("Signal created");
//         reset();
//         onAdded?.();
//       }
//     } catch (err: any) {
//       toast.error(err?.message || "Operation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Drawer
//       direction={isMobile ? "bottom" : "right"}
//       open={open}
//       onOpenChange={(v) => {
//         setOpen(v);
//         if (!v) onClose?.();
//       }}>
//       <DrawerTrigger asChild>
//         <Button variant="outline" size="sm">
//           <IconPlus />
//           <span className="hidden lg:inline">Add Signal</span>
//         </Button>
//       </DrawerTrigger>

//       <DrawerContent>
//         <DrawerHeader className="gap-1">
//           <DrawerTitle>
//             {isEdit ? "Edit Signal" : "Create New Signal"}
//           </DrawerTitle>
//           <DrawerDescription>
//             {isEdit ? "Update signal details" : "Create a new trading signal"}
//           </DrawerDescription>
//         </DrawerHeader>

//         <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleSubmit();
//             }}
//             className="flex flex-col gap-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="pairName">Pair Name *</Label>
//                 <Input
//                   id="pairName"
//                   value={form.pairName}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, pairName: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="direction">Direction *</Label>
//                 <Select
//                   value={form.direction}
//                   onValueChange={(v) =>
//                     setForm((p) => ({ ...p, direction: v as "LONG" | "SHORT" }))
//                   }>
//                   <SelectTrigger id="direction">
//                     <SelectValue placeholder="Select direction" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {DIRECTION_OPTIONS.map((d) => (
//                       <SelectItem key={d} value={d}>
//                         {d}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="entryTime">Entry Time *</Label>
//                 <Input
//                   id="entryTime"
//                   type="datetime-local"
//                   value={form.entryTime}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, entryTime: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="entryPrice">Entry Price *</Label>
//                 <Input
//                   id="entryPrice"
//                   type="number"
//                   step="0.01"
//                   value={form.entryPrice ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       entryPrice:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="lotSize">Lot Size *</Label>
//                 <Input
//                   id="lotSize"
//                   type="number"
//                   step="0.01"
//                   value={form.lotSize ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       lotSize:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="userId">User ID *</Label>
//                 <Input
//                   id="userId"
//                   value={form.userId}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, userId: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="botId">Bot ID</Label>
//                 <Input
//                   id="botId"
//                   value={form.botId ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, botId: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="tradeId">Trade ID</Label>
//                 <Input
//                   id="tradeId"
//                   value={form.tradeId ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, tradeId: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="stopLossPrice">Stop Loss Price</Label>
//                 <Input
//                   id="stopLossPrice"
//                   type="number"
//                   step="0.01"
//                   value={form.stopLossPrice ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       stopLossPrice:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="targetPrice">Target Price</Label>
//                 <Input
//                   id="targetPrice"
//                   type="number"
//                   step="0.01"
//                   value={form.targetPrice ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       targetPrice:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="stoploss">Stoploss (R)</Label>
//                 <Input
//                   id="stoploss"
//                   type="number"
//                   step="0.01"
//                   value={form.stoploss ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       stoploss:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="target1r">Target 1R</Label>
//                 <Input
//                   id="target1r"
//                   type="number"
//                   step="0.01"
//                   value={form.target1r ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       target1r:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="target2r">Target 2R</Label>
//                 <Input
//                   id="target2r"
//                   type="number"
//                   step="0.01"
//                   value={form.target2r ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       target2r:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="exitTime">Exit Time</Label>
//                 <Input
//                   id="exitTime"
//                   type="datetime-local"
//                   value={form.exitTime ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, exitTime: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="exitPrice">Exit Price</Label>
//                 <Input
//                   id="exitPrice"
//                   type="number"
//                   step="0.01"
//                   value={form.exitPrice ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       exitPrice:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2 md:col-span-2">
//                 <Label htmlFor="exitReason">Exit Reason</Label>
//                 <Input
//                   id="exitReason"
//                   value={form.exitReason ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, exitReason: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>

//             <div className="flex gap-2 mt-4">
//               <Button type="submit" disabled={loading} className="flex-1">
//                 {loading ? (
//                   <>
//                     <IconLoader className="mr-2 h-4 w-4 animate-spin" />
//                     {isEdit ? "Updating..." : "Creating..."}
//                   </>
//                 ) : isEdit ? (
//                   "Update Signal"
//                 ) : (
//                   "Create Signal"
//                 )}
//               </Button>
//               <DrawerClose asChild>
//                 <Button variant="outline" onClick={reset} className="flex-1">
//                   Cancel
//                 </Button>
//               </DrawerClose>
//             </div>
//           </form>
//         </div>

//         <DrawerFooter />
//       </DrawerContent>
//     </Drawer>
//   );
// }

// /* ------------------------------- Main Table ------------------------------- */
// export function SignalsDataTable() {
//   const [data, setData] = React.useState<Signal[]>([]);
//   const [rowSelection, setRowSelection] = React.useState({});
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [loading, setLoading] = React.useState(true);
//   const [totalPages, setTotalPages] = React.useState(1);
//   const [totalItems, setTotalItems] = React.useState(0);
//   const [editing, setEditing] = React.useState<Signal | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
//   const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] =
//     React.useState(false);
//   const [toDelete, setToDelete] = React.useState<Signal | null>(null);
//   const [deleting, setDeleting] = React.useState(false);
//   const [searchQuery, setSearchQuery] = React.useState("");
//   const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

//   React.useEffect(() => {
//     const t = setTimeout(
//       () => setDebouncedSearchQuery(searchQuery.trim()),
//       300
//     );
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   React.useEffect(() => {
//     setPagination((p) => ({ ...p, pageIndex: 0 }));
//   }, [debouncedSearchQuery]);

//   const fetchSignals = React.useCallback(
//     async (pageIndex: number, pageSize: number, query?: string) => {
//       setLoading(true);
//       try {
//         const res = await SignalService.getSignals(
//           pageIndex + 1,
//           pageSize,
//           query ?? ""
//         );
//         setData(res.data || []);
//         setTotalPages(res.totalPages ?? 1);
//         setTotalItems(res.totalItems ?? res.data?.length ?? 0);
//       } catch (err: any) {
//         console.error("Failed to fetch signals:", err);
//         toast.error(err?.message || "Failed to load signals");
//         setData([]);
//         setTotalPages(1);
//         setTotalItems(0);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   React.useEffect(() => {
//     fetchSignals(
//       pagination.pageIndex,
//       pagination.pageSize,
//       debouncedSearchQuery
//     );
//   }, [
//     pagination.pageIndex,
//     pagination.pageSize,
//     debouncedSearchQuery,
//     fetchSignals,
//   ]);

//   React.useEffect(() => {
//     fetchSignals(0, pagination.pageSize, debouncedSearchQuery);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const columns = React.useMemo(
//     () => createColumns(handleEdit, handleDelete),
//     []
//   );

//   const table = useReactTable({
//     data,
//     columns,
//     state: { rowSelection, pagination },
//     getRowId: (row) => row.id.toString(),
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     manualPagination: true,
//     pageCount: totalPages,
//   });

//   const selectedCount = table.getFilteredSelectedRowModel().rows.length;

//   function handleAdded() {
//     setRowSelection({});
//     table.setPageIndex(0);
//     fetchSignals(0, table.getState().pagination.pageSize, debouncedSearchQuery);
//   }

//   function handleUpdated() {
//     setEditing(null);
//     setRowSelection({});
//     fetchSignals(
//       pagination.pageIndex,
//       pagination.pageSize,
//       debouncedSearchQuery
//     );
//   }

//   function handleEdit(s: Signal) {
//     setEditing(null);
//     requestAnimationFrame(() => setEditing(s));
//   }

//   function handleDelete(s: Signal) {
//     setToDelete(s);
//     setShowDeleteConfirm(true);
//   }

//   async function confirmDelete() {
//     if (!toDelete) return;
//     setDeleting(true);
//     try {
//       await SignalService.deleteSignal(toDelete.id);
//       toast.success("Signal deleted");
//       setRowSelection({});
//       fetchSignals(
//         pagination.pageIndex,
//         pagination.pageSize,
//         debouncedSearchQuery
//       );
//     } catch (err: any) {
//       toast.error(err?.message || "Failed to delete signal");
//     } finally {
//       setDeleting(false);
//       setShowDeleteConfirm(false);
//       setToDelete(null);
//     }
//   }

//   function handleMultiDelete() {
//     setShowMultiDeleteConfirm(true);
//   }

//   async function confirmMultiDelete() {
//     const selectedRows = table.getFilteredSelectedRowModel().rows;
//     const ids = selectedRows.map((r) => r.original.id.toString());
//     if (ids.length === 0) return;
//     setDeleting(true);
//     try {
//       await SignalService.deleteMultipleSignals(ids);
//       toast.success("Selected signals deleted");
//       setRowSelection({});
//       fetchSignals(
//         pagination.pageIndex,
//         pagination.pageSize,
//         debouncedSearchQuery
//       );
//     } catch (err: any) {
//       toast.error(err?.message || "Failed to delete signals");
//     } finally {
//       setDeleting(false);
//       setShowMultiDeleteConfirm(false);
//     }
//   }

//   return (
//     <div className="w-full flex-col justify-start gap-6">
//       <div className="flex items-center justify-between px-4 py-2 lg:px-6">
//         <div className="flex items-center gap-2">
//           {selectedCount > 0 && (
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={handleMultiDelete}
//               disabled={deleting}>
//               {deleting ? (
//                 <IconLoader className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 <IconTrash className="mr-2 h-4 w-4" />
//               )}
//               Delete Selected ({selectedCount})
//             </Button>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="relative flex-1 max-w-sm">
//             <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search signals (pair/tradeId)..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 h-8"
//             />
//           </div>

//           <AddSignalDrawer
//             signal={editing}
//             onAdded={handleAdded}
//             onUpdated={handleUpdated}
//             onClose={() => setEditing(null)}
//           />
//         </div>
//       </div>

//       <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
//         <div className="overflow-hidden rounded-lg border">
//           <Table>
//             <TableHeader className="bg-muted sticky top-0 z-10">
//               {table.getHeaderGroups().map((hg) => (
//                 <TableRow key={hg.id}>
//                   {hg.headers.map((header) => (
//                     <TableHead key={header.id} colSpan={header.colSpan}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>

//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="h-24 text-center">
//                     <div className="flex items-center justify-center gap-2">
//                       <IconLoader className="h-4 w-4 animate-spin" />
//                       Loading signals...
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : table.getRowModel().rows.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}>
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="h-24 text-center">
//                     No signals found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         <div className="flex items-center justify-between px-4">
//           <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
//             {table.getFilteredSelectedRowModel().rows.length} of {totalItems}{" "}
//             row(s) selected.
//           </div>

//           <div className="flex w-full items-center gap-8 lg:w-fit">
//             <div className="hidden items-center gap-2 lg:flex">
//               <Label htmlFor="rows-per-page" className="text-sm font-medium">
//                 Rows per page
//               </Label>
//               <Select
//                 value={`${table.getState().pagination.pageSize}`}
//                 onValueChange={(v) => table.setPageSize(Number(v))}>
//                 <SelectTrigger size="sm" className="w-20" id="rows-per-page">
//                   <SelectValue
//                     placeholder={table.getState().pagination.pageSize}
//                   />
//                 </SelectTrigger>
//                 <SelectContent side="top">
//                   {[10, 20, 30, 40, 50].map((ps) => (
//                     <SelectItem key={ps} value={`${ps}`}>
//                       {ps}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex w-fit items-center justify-center text-sm font-medium">
//               Page {table.getState().pagination.pageIndex + 1} of {totalPages}
//             </div>

//             <div className="ml-auto flex items-center gap-2 lg:ml-0">
//               <Button
//                 variant="outline"
//                 className="hidden h-8 w-8 p-0 lg:flex"
//                 onClick={() => table.setPageIndex(0)}
//                 disabled={!table.getCanPreviousPage()}>
//                 <span className="sr-only">Go to first page</span>
//                 <IconChevronsLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() => table.previousPage()}
//                 disabled={!table.getCanPreviousPage()}>
//                 <span className="sr-only">Go to previous page</span>
//                 <IconChevronLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() => table.nextPage()}
//                 disabled={!table.getCanNextPage()}>
//                 <span className="sr-only">Go to next page</span>
//                 <IconChevronRight />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="hidden size-8 lg:flex"
//                 size="icon"
//                 onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//                 disabled={!table.getCanNextPage()}>
//                 <span className="sr-only">Go to last page</span>
//                 <IconChevronsRight />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <ConfirmationDialog
//         open={showDeleteConfirm}
//         onOpenChange={setShowDeleteConfirm}
//         title="Delete Signal"
//         description={`Are you sure you want to delete this signal? This action cannot be undone.`}
//         confirmText="Delete"
//         cancelText="Cancel"
//         onConfirm={confirmDelete}
//         variant="destructive"
//       />

//       <ConfirmationDialog
//         open={showMultiDeleteConfirm}
//         onOpenChange={setShowMultiDeleteConfirm}
//         title="Delete Multiple Signals"
//         description={`Are you sure you want to delete ${selectedCount} selected signal(s)? This action cannot be undone.`}
//         confirmText="Delete All"
//         cancelText="Cancel"
//         onConfirm={confirmMultiDelete}
//         variant="destructive"
//       />
//     </div>
//   );
// }

// export default SignalsDataTable;

// import * as React from "react";
// import {
//   IconChevronLeft,
//   IconChevronRight,
//   IconChevronsLeft,
//   IconChevronsRight,
//   IconDotsVertical,
//   IconLoader,
//   IconPlus,
//   IconSearch,
//   IconTrash,
//   IconPencil,
// } from "@tabler/icons-react";
// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
// import { useIsMobile } from "@/hooks/use-mobile";

// import { SignalService } from "@/services/signal.ts";
// import type { Signal } from "@/types/signal.ts";

// // Only the minimal/necessary fields are exposed to admin for create/edit.
// // Required: pairName, direction, entryTime, entryPrice, lotSize, userId.
// // Optional: botId, tradeId, (advanced collapsed) stoploss, target1r, target2r.

// const DIRECTION_OPTIONS = ["LONG", "SHORT"] as const;

// function toInputDateTimeLocal(iso?: string | Date) {
//   if (!iso) return "";
//   const d = typeof iso === "string" ? new Date(iso) : iso;
//   if (Number.isNaN(d.getTime())) return "";
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
//     d.getHours()
//   )}:${pad(d.getMinutes())}`;
// }

// /* ----------------------------- Columns factory ---------------------------- */
// const createColumns = (
//   onEdit: (s: Signal) => void,
//   onDelete: (s: Signal) => void
// ): ColumnDef<Signal>[] => [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={
//             table.getIsAllPageRowsSelected() ||
//             (table.getIsSomePageRowsSelected() && "indeterminate")
//           }
//           onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
//           aria-label="Select all"
//         />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="flex items-center justify-center">
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(v) => row.toggleSelected(!!v)}
//           aria-label="Select row"
//         />
//       </div>
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "pairName",
//     header: "Pair",
//     cell: ({ row }) => row.original.pairName || "-",
//     enableHiding: false,
//   },
//   {
//     accessorKey: "direction",
//     header: "Direction",
//     cell: ({ row }) => row.original.direction || "-",
//   },
//   {
//     accessorKey: "entryTime",
//     header: "Entry Time",
//     cell: ({ row }) =>
//       row.original.entryTime
//         ? new Date(row.original.entryTime).toLocaleString()
//         : "-",
//   },
//   {
//     accessorKey: "entryPrice",
//     header: "Entry Price",
//     cell: ({ row }) =>
//       row.original.entryPrice == null ? "-" : String(row.original.entryPrice),
//   },
//   {
//     accessorKey: "lotSize",
//     header: "Lot",
//     cell: ({ row }) =>
//       row.original.lotSize == null ? "-" : String(row.original.lotSize),
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Created",
//     cell: ({ row }) =>
//       row.original.createdAt
//         ? new Date(row.original.createdAt).toLocaleDateString()
//         : "-",
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const s = row.original as Signal;
//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button
//               variant="ghost"
//               className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
//               size="icon">
//               <IconDotsVertical />
//               <span className="sr-only">Open menu</span>
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end" className="w-32">
//             <DropdownMenuItem onClick={() => onEdit(s)}>
//               <div className="flex items-center gap-2">
//                 <IconPencil className="h-4 w-4" /> Edit
//               </div>
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem variant="destructive" onClick={() => onDelete(s)}>
//               <div className="flex items-center gap-2">
//                 <IconTrash className="h-4 w-4" /> Delete
//               </div>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];

// /* ------------------------------ Add/Edit Drawer -------------------------- */
// function AddSignalDrawer({
//   signal,
//   onAdded,
//   onUpdated,
//   onClose,
// }: {
//   signal?: Signal | null;
//   onAdded?: () => void;
//   onUpdated?: () => void;
//   onClose?: () => void;
// }) {
//   const isMobile = useIsMobile();
//   const [open, setOpen] = React.useState(false);
//   const isEdit = !!signal;
//   const [loading, setLoading] = React.useState(false);

//   const [showAdvanced, setShowAdvanced] = React.useState(false);

//   const [form, setForm] = React.useState<{
//     pairName: string;
//     direction: "LONG" | "SHORT" | "";
//     entryTime: string; // datetime-local
//     entryPrice: number | undefined;
//     lotSize: number | undefined;
//     userId: string;
//     botId?: string;
//     tradeId?: string;
//     stoploss?: number | undefined;
//     target1r?: number | undefined;
//     target2r?: number | undefined;
//     exitTime?: string; // datetime-local
//     exitPrice?: number | undefined;
//     exitReason?: string;
//   }>({
//     pairName: "",
//     direction: "",
//     entryTime: "",
//     entryPrice: undefined,
//     lotSize: undefined,
//     userId: "",
//     botId: "",
//     tradeId: "",
//     stoploss: undefined,
//     target1r: undefined,
//     target2r: undefined,
//     exitTime: "",
//     exitPrice: undefined,
//     exitReason: "",
//   });

//   React.useEffect(() => {
//     if (!signal) {
//       setForm({
//         pairName: "",
//         direction: "",
//         entryTime: "",
//         entryPrice: undefined,
//         lotSize: undefined,
//         userId: "",
//         botId: "",
//         tradeId: "",
//         stoploss: undefined,
//         target1r: undefined,
//         target2r: undefined,
//         exitTime: "",
//         exitPrice: undefined,
//         exitReason: "",
//       });
//       setOpen(false);
//       setShowAdvanced(false);
//       return;
//     }

//     setForm({
//       pairName: signal.pairName ?? "",
//       direction: (signal.direction as any) ?? "",
//       entryTime: toInputDateTimeLocal(signal.entryTime),
//       entryPrice: signal.entryPrice,
//       lotSize: signal.lotSize,
//       userId:
//         (signal.userId as any)?.toString?.() ?? (signal as any).userId ?? "",
//       botId: (signal.botId as any)?.toString?.() ?? (signal as any).botId ?? "",
//       tradeId: signal.tradeId ?? "",
//       stoploss: signal.stoploss,
//       target1r: signal.target1r,
//       target2r: signal.target2r,
//       exitTime: toInputDateTimeLocal(signal.exitTime),
//       exitPrice: signal.exitPrice,
//       exitReason: signal.exitReason ?? "",
//     });
//     setShowAdvanced(
//       Boolean(signal.stoploss || signal.target1r || signal.target2r)
//     );
//     setOpen(true);
//   }, [signal]);

//   const reset = () => {
//     setOpen(false);
//     setForm({
//       pairName: "",
//       direction: "",
//       entryTime: "",
//       entryPrice: undefined,
//       lotSize: undefined,
//       userId: "",
//       botId: "",
//       tradeId: "",
//       stoploss: undefined,
//       target1r: undefined,
//       target2r: undefined,
//       exitTime: "",
//       exitPrice: undefined,
//       exitReason: "",
//     });
//     setShowAdvanced(false);
//     onClose?.();
//   };

//   const validate = () => {
//     if (!form.pairName || form.pairName.trim().length < 3) {
//       toast.error("Pair name is required (min 3 chars)");
//       return false;
//     }
//     if (!form.direction || !DIRECTION_OPTIONS.includes(form.direction as any)) {
//       toast.error("Direction is required (LONG/SHORT)");
//       return false;
//     }
//     if (!form.entryTime) {
//       toast.error("Entry time is required");
//       return false;
//     }
//     if (
//       form.entryPrice === undefined ||
//       Number.isNaN(form.entryPrice) ||
//       Number(form.entryPrice) <= 0
//     ) {
//       toast.error("Valid entry price is required");
//       return false;
//     }
//     if (
//       form.lotSize === undefined ||
//       Number.isNaN(form.lotSize) ||
//       Number(form.lotSize) <= 0
//     ) {
//       toast.error("Valid lot size is required");
//       return false;
//     }
//     if (!form.userId || form.userId.trim().length < 6) {
//       // server previously checked for >=10 but we'll allow >=6; adjust if your server requires 10.
//       toast.error("User ID is required");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!validate()) return;

//     setLoading(true);
//     try {
//       const payload: any = {
//         pairName: form.pairName.trim(),
//         direction: form.direction as "LONG" | "SHORT",
//         entryTime: new Date(form.entryTime).toISOString(),
//         entryPrice: Number(form.entryPrice),
//         lotSize: Number(form.lotSize),
//         userId: form.userId.trim(),
//       };

//       // optional fields
//       if (form.botId) payload.botId = form.botId.trim();
//       if (form.tradeId) payload.tradeId = form.tradeId.trim();
//       if (showAdvanced && form.stoploss != null)
//         payload.stoploss = Number(form.stoploss);
//       if (showAdvanced && form.target1r != null)
//         payload.target1r = Number(form.target1r);
//       if (showAdvanced && form.target2r != null)
//         payload.target2r = Number(form.target2r);
//       if (form.exitTime)
//         payload.exitTime = new Date(form.exitTime).toISOString();
//       if (form.exitPrice != null) payload.exitPrice = Number(form.exitPrice);
//       if (form.exitReason) payload.exitReason = form.exitReason.trim();

//       if (isEdit && signal) {
//         await SignalService.updateSignal(signal.id, payload);
//         toast.success("Signal updated");
//         reset();
//         onUpdated?.();
//       } else {
//         await SignalService.createSignal(payload);
//         toast.success("Signal created");
//         reset();
//         onAdded?.();
//       }
//     } catch (err: any) {
//       toast.error(err?.message || "Operation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Drawer
//       direction={isMobile ? "bottom" : "right"}
//       open={open}
//       onOpenChange={(v) => {
//         setOpen(v);
//         if (!v) onClose?.();
//       }}>
//       <DrawerTrigger asChild>
//         <Button variant="outline" size="sm">
//           <IconPlus />
//           <span className="hidden lg:inline">Add Signal</span>
//         </Button>
//       </DrawerTrigger>

//       <DrawerContent>
//         <DrawerHeader className="gap-1">
//           <DrawerTitle>
//             {isEdit ? "Edit Signal" : "Create New Signal"}
//           </DrawerTitle>
//           <DrawerDescription>
//             {isEdit ? "Update signal details" : "Create a new trading signal"}
//           </DrawerDescription>
//         </DrawerHeader>

//         <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleSubmit();
//             }}
//             className="flex flex-col gap-4">
//             {/* Single-column layout: each field on its own line */}
//             <div className="flex flex-col gap-3">
//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="pairName">Pair Name *</Label>
//                 <Input
//                   id="pairName"
//                   value={form.pairName}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, pairName: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="direction">Direction *</Label>
//                 <Select
//                   value={form.direction}
//                   onValueChange={(v) =>
//                     setForm((p) => ({ ...p, direction: v as "LONG" | "SHORT" }))
//                   }>
//                   <SelectTrigger id="direction">
//                     <SelectValue placeholder="Select direction" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {DIRECTION_OPTIONS.map((d) => (
//                       <SelectItem key={d} value={d}>
//                         {d}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="entryTime">Entry Time *</Label>
//                 <Input
//                   id="entryTime"
//                   type="datetime-local"
//                   value={form.entryTime}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, entryTime: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="entryPrice">Entry Price *</Label>
//                 <Input
//                   id="entryPrice"
//                   type="number"
//                   step="0.01"
//                   value={form.entryPrice ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       entryPrice:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="lotSize">Lot Size *</Label>
//                 <Input
//                   id="lotSize"
//                   type="number"
//                   step="0.01"
//                   value={form.lotSize ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({
//                       ...p,
//                       lotSize:
//                         e.target.value === ""
//                           ? undefined
//                           : Number(e.target.value),
//                     }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="userId">User ID *</Label>
//                 <Input
//                   id="userId"
//                   value={form.userId}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, userId: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="botId">Bot ID (optional)</Label>
//                 <Input
//                   id="botId"
//                   value={form.botId ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, botId: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="flex flex-col gap-2">
//                 <Label htmlFor="tradeId">Trade ID (optional)</Label>
//                 <Input
//                   id="tradeId"
//                   value={form.tradeId ?? ""}
//                   onChange={(e) =>
//                     setForm((p) => ({ ...p, tradeId: e.target.value }))
//                   }
//                 />
//               </div>

//               <details className="mt-2 p-3 border rounded">
//                 <summary className="cursor-pointer font-medium">
//                   Advanced (optional)
//                 </summary>
//                 <div className="flex flex-col gap-3 mt-3">
//                   <div className="flex flex-col gap-2">
//                     <Label htmlFor="stoploss">Stoploss (R)</Label>
//                     <Input
//                       id="stoploss"
//                       type="number"
//                       step="0.01"
//                       value={form.stoploss ?? ""}
//                       onChange={(e) =>
//                         setForm((p) => ({
//                           ...p,
//                           stoploss:
//                             e.target.value === ""
//                               ? undefined
//                               : Number(e.target.value),
//                         }))
//                       }
//                     />
//                   </div>

//                   <div className="flex flex-col gap-2">
//                     <Label htmlFor="target1r">Target 1R</Label>
//                     <Input
//                       id="target1r"
//                       type="number"
//                       step="0.01"
//                       value={form.target1r ?? ""}
//                       onChange={(e) =>
//                         setForm((p) => ({
//                           ...p,
//                           target1r:
//                             e.target.value === ""
//                               ? undefined
//                               : Number(e.target.value),
//                         }))
//                       }
//                     />
//                   </div>

//                   <div className="flex flex-col gap-2">
//                     <Label htmlFor="target2r">Target 2R</Label>
//                     <Input
//                       id="target2r"
//                       type="number"
//                       step="0.01"
//                       value={form.target2r ?? ""}
//                       onChange={(e) =>
//                         setForm((p) => ({
//                           ...p,
//                           target2r:
//                             e.target.value === ""
//                               ? undefined
//                               : Number(e.target.value),
//                         }))
//                       }
//                     />
//                   </div>
//                 </div>
//               </details>

//               {/* show exit fields only when editing */}
//               {isEdit && (
//                 <div className="flex flex-col gap-2">
//                   <Label htmlFor="exitTime">Exit Time</Label>
//                   <Input
//                     id="exitTime"
//                     type="datetime-local"
//                     value={form.exitTime ?? ""}
//                     onChange={(e) =>
//                       setForm((p) => ({ ...p, exitTime: e.target.value }))
//                     }
//                   />

//                   <Label htmlFor="exitPrice" className="mt-2">
//                     Exit Price
//                   </Label>
//                   <Input
//                     id="exitPrice"
//                     type="number"
//                     step="0.01"
//                     value={form.exitPrice ?? ""}
//                     onChange={(e) =>
//                       setForm((p) => ({
//                         ...p,
//                         exitPrice:
//                           e.target.value === ""
//                             ? undefined
//                             : Number(e.target.value),
//                       }))
//                     }
//                   />

//                   <Label htmlFor="exitReason" className="mt-2">
//                     Exit Reason
//                   </Label>
//                   <Input
//                     id="exitReason"
//                     value={form.exitReason ?? ""}
//                     onChange={(e) =>
//                       setForm((p) => ({ ...p, exitReason: e.target.value }))
//                     }
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="flex gap-2 mt-4">
//               <Button type="submit" disabled={loading} className="flex-1">
//                 {loading ? (
//                   <>
//                     <IconLoader className="mr-2 h-4 w-4 animate-spin" />
//                     {isEdit ? "Updating..." : "Creating..."}
//                   </>
//                 ) : isEdit ? (
//                   "Update Signal"
//                 ) : (
//                   "Create Signal"
//                 )}
//               </Button>
//               <DrawerClose asChild>
//                 <Button variant="outline" onClick={reset} className="flex-1">
//                   Cancel
//                 </Button>
//               </DrawerClose>
//             </div>
//           </form>
//         </div>

//         <DrawerFooter />
//       </DrawerContent>
//     </Drawer>
//   );
// }

// /* ------------------------------- Main Table ------------------------------- */
// export function SignalsDataTable() {
//   const [data, setData] = React.useState<Signal[]>([]);
//   const [rowSelection, setRowSelection] = React.useState({});
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [loading, setLoading] = React.useState(true);
//   const [totalPages, setTotalPages] = React.useState(1);
//   const [totalItems, setTotalItems] = React.useState(0);
//   const [editing, setEditing] = React.useState<Signal | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
//   const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] =
//     React.useState(false);
//   const [toDelete, setToDelete] = React.useState<Signal | null>(null);
//   const [deleting, setDeleting] = React.useState(false);
//   const [searchQuery, setSearchQuery] = React.useState("");
//   const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

//   React.useEffect(() => {
//     const t = setTimeout(
//       () => setDebouncedSearchQuery(searchQuery.trim()),
//       300
//     );
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   React.useEffect(() => {
//     // reset to page 0 when searching
//     setPagination((p) => ({ ...p, pageIndex: 0 }));
//   }, [debouncedSearchQuery]);

//   const fetchSignals = React.useCallback(
//     async (pageIndex: number, pageSize: number, query?: string) => {
//       setLoading(true);
//       try {
//         // backend expects 1-indexed page number
//         const res = await SignalService.getSignals(
//           pageIndex + 1,
//           pageSize,
//           query ?? ""
//         );
//         setData(res.data || []);
//         setTotalPages(res.totalPages ?? 1);
//         setTotalItems(res.totalItems ?? res.data?.length ?? 0);
//       } catch (err: any) {
//         console.error("Failed to fetch signals:", err);
//         toast.error(err?.message || "Failed to load signals");
//         setData([]);
//         setTotalPages(1);
//         setTotalItems(0);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   React.useEffect(() => {
//     fetchSignals(
//       pagination.pageIndex,
//       pagination.pageSize,
//       debouncedSearchQuery
//     );
//   }, [
//     pagination.pageIndex,
//     pagination.pageSize,
//     debouncedSearchQuery,
//     fetchSignals,
//   ]);

//   // initial load
//   React.useEffect(() => {
//     fetchSignals(0, pagination.pageSize, debouncedSearchQuery);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // handlers used by columns
//   function handleEdit(s: Signal) {
//     setEditing(null);
//     requestAnimationFrame(() => setEditing(s));
//   }

//   function handleDelete(s: Signal) {
//     setToDelete(s);
//     setShowDeleteConfirm(true);
//   }

//   const columns = React.useMemo(
//     () => createColumns(handleEdit, handleDelete),
//     [
//       /* stable */
//     ]
//   );

//   const table = useReactTable({
//     data,
//     columns,
//     state: { rowSelection, pagination },
//     getRowId: (row) => row.id.toString(),
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     manualPagination: true,
//     pageCount: totalPages,
//   });

//   const selectedCount = table.getFilteredSelectedRowModel().rows.length;

//   function handleAdded() {
//     setRowSelection({});
//     // reload first page to see newly added
//     setPagination((p) => ({ ...p, pageIndex: 0 }));
//     fetchSignals(0, pagination.pageSize, debouncedSearchQuery);
//   }

//   function handleUpdated() {
//     setEditing(null);
//     setRowSelection({});
//     fetchSignals(
//       pagination.pageIndex,
//       pagination.pageSize,
//       debouncedSearchQuery
//     );
//   }

//   async function confirmDelete() {
//     if (!toDelete) return;
//     setDeleting(true);
//     try {
//       await SignalService.deleteSignal(toDelete.id);
//       toast.success("Signal deleted");
//       setRowSelection({});
//       // if deleting last item on page, ensure pageIndex isn't out-of-range
//       const nextPage = Math.max(0, pagination.pageIndex);
//       fetchSignals(nextPage, pagination.pageSize, debouncedSearchQuery);
//     } catch (err: any) {
//       toast.error(err?.message || "Failed to delete signal");
//     } finally {
//       setDeleting(false);
//       setShowDeleteConfirm(false);
//       setToDelete(null);
//     }
//   }

//   function handleMultiDelete() {
//     setShowMultiDeleteConfirm(true);
//   }

//   async function confirmMultiDelete() {
//     const selectedRows = table.getFilteredSelectedRowModel().rows;
//     const ids = selectedRows.map((r) => r.original.id.toString());
//     if (ids.length === 0) return;
//     setDeleting(true);
//     try {
//       await SignalService.deleteMultipleSignals(ids);
//       toast.success("Selected signals deleted");
//       setRowSelection({});
//       fetchSignals(
//         pagination.pageIndex,
//         pagination.pageSize,
//         debouncedSearchQuery
//       );
//     } catch (err: any) {
//       toast.error(err?.message || "Failed to delete signals");
//     } finally {
//       setDeleting(false);
//       setShowMultiDeleteConfirm(false);
//     }
//   }

//   // Pagination helpers: explicitly call fetchSignals so pagination stays in-sync
//   function goToPage(index: number) {
//     const safeIndex = Math.max(0, Math.min(index, totalPages - 1));
//     setPagination((p) => ({ ...p, pageIndex: safeIndex }));
//     fetchSignals(safeIndex, pagination.pageSize, debouncedSearchQuery);
//   }

//   function prevPage() {
//     goToPage(pagination.pageIndex - 1);
//   }

//   function nextPage() {
//     goToPage(pagination.pageIndex + 1);
//   }

//   function onChangePageSize(size: number) {
//     setPagination({ pageIndex: 0, pageSize: size });
//     fetchSignals(0, size, debouncedSearchQuery);
//   }

//   return (
//     <div className="w-full flex-col justify-start gap-6">
//       <div className="flex items-center justify-between px-4 py-2 lg:px-6">
//         <div className="flex items-center gap-2">
//           {selectedCount > 0 && (
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={handleMultiDelete}
//               disabled={deleting}>
//               {deleting ? (
//                 <IconLoader className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 <IconTrash className="mr-2 h-4 w-4" />
//               )}
//               Delete Selected ({selectedCount})
//             </Button>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="relative flex-1 max-w-sm">
//             <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search signals (pair/tradeId)..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 h-8"
//             />
//           </div>

//           <AddSignalDrawer
//             signal={editing}
//             onAdded={handleAdded}
//             onUpdated={handleUpdated}
//             onClose={() => setEditing(null)}
//           />
//         </div>
//       </div>

//       <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
//         <div className="overflow-hidden rounded-lg border">
//           <Table>
//             <TableHeader className="bg-muted sticky top-0 z-10">
//               {table.getHeaderGroups().map((hg) => (
//                 <TableRow key={hg.id}>
//                   {hg.headers.map((header) => (
//                     <TableHead key={header.id} colSpan={header.colSpan}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>

//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="h-24 text-center">
//                     <div className="flex items-center justify-center gap-2">
//                       <IconLoader className="h-4 w-4 animate-spin" />
//                       Loading signals...
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : table.getRowModel().rows.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}>
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="h-24 text-center">
//                     No signals found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         <div className="flex items-center justify-between px-4">
//           <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
//             {table.getFilteredSelectedRowModel().rows.length} of {totalItems}{" "}
//             row(s) selected.
//           </div>

//           <div className="flex w-full items-center gap-8 lg:w-fit">
//             <div className="hidden items-center gap-2 lg:flex">
//               <Label htmlFor="rows-per-page" className="text-sm font-medium">
//                 Rows per page
//               </Label>
//               <Select
//                 value={`${pagination.pageSize}`}
//                 onValueChange={(v) => onChangePageSize(Number(v))}>
//                 <SelectTrigger size="sm" className="w-20" id="rows-per-page">
//                   <SelectValue placeholder={pagination.pageSize} />
//                 </SelectTrigger>
//                 <SelectContent side="top">
//                   {[10, 20, 30, 40, 50].map((ps) => (
//                     <SelectItem key={ps} value={`${ps}`}>
//                       {ps}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex w-fit items-center justify-center text-sm font-medium">
//               Page {pagination.pageIndex + 1} of {totalPages}
//             </div>

//             <div className="ml-auto flex items-center gap-2 lg:ml-0">
//               <Button
//                 variant="outline"
//                 className="hidden h-8 w-8 p-0 lg:flex"
//                 onClick={() => goToPage(0)}
//                 disabled={pagination.pageIndex === 0}>
//                 <span className="sr-only">Go to first page</span>
//                 <IconChevronsLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={prevPage}
//                 disabled={pagination.pageIndex === 0}>
//                 <span className="sr-only">Go to previous page</span>
//                 <IconChevronLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={nextPage}
//                 disabled={pagination.pageIndex + 1 >= totalPages}>
//                 <span className="sr-only">Go to next page</span>
//                 <IconChevronRight />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="hidden size-8 lg:flex"
//                 size="icon"
//                 onClick={() => goToPage(totalPages - 1)}
//                 disabled={pagination.pageIndex + 1 >= totalPages}>
//                 <span className="sr-only">Go to last page</span>
//                 <IconChevronsRight />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <ConfirmationDialog
//         open={showDeleteConfirm}
//         onOpenChange={setShowDeleteConfirm}
//         title="Delete Signal"
//         description={`Are you sure you want to delete this signal? This action cannot be undone.`}
//         confirmText="Delete"
//         cancelText="Cancel"
//         onConfirm={confirmDelete}
//         variant="destructive"
//       />

//       <ConfirmationDialog
//         open={showMultiDeleteConfirm}
//         onOpenChange={setShowMultiDeleteConfirm}
//         title="Delete Multiple Signals"
//         description={`Are you sure you want to delete ${selectedCount} selected signal(s)? This action cannot be undone.`}
//         confirmText="Delete All"
//         cancelText="Cancel"
//         onConfirm={confirmMultiDelete}
//         variant="destructive"
//       />
//     </div>
//   );
// }

// export default SignalsDataTable;

// // components/signals/SignalsDataTable.tsx
// import * as React from "react";
// import {
//   IconChevronLeft,
//   IconChevronRight,
//   IconChevronsLeft,
//   IconChevronsRight,
//   IconLoader,
//   IconSearch,
// } from "@tabler/icons-react";

// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { SignalService } from "@/services/signal.ts";
// import type { Signal } from "@/types/signal.ts";

// /* ---------------- helpers ---------------- */

// const getBotName = (s: any) => {
//   if (s?.bot && typeof s.bot === "object" && s.bot.name) return s.bot.name;
//   if (s?.botId && typeof s.botId === "object" && s.botId.name)
//     return s.botId.name;
//   if (s?.bot && typeof s.bot === "string") return s.bot;
//   if (s?.botId && typeof s.botId === "string") return s.botId;
//   return "-";
// };

// function formatNumber(v: any) {
//   if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
//   const n = Number(v);
//   if (Number.isInteger(n)) return n.toString();
//   return n.toFixed(2).replace(/\.?0+$/, "");
// }

// /* ---------------- columns (25% each) ---------------- */

// const COLUMNS = (): ColumnDef<Signal>[] => [
//   {
//     accessorKey: "pairName",
//     header: () => (
//       <div style={{ width: "25%" }} className="text-left">
//         Pair
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ width: "25%" }} className="truncate">
//         {row.original.pairName ?? "-"}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "entryPrice",
//     header: () => (
//       <div style={{ width: "25%" }} className="text-left">
//         Entry Price
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ width: "25%" }} className="truncate">
//         {formatNumber((row.original as any).entryPrice)}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "exitPrice",
//     header: () => (
//       <div style={{ width: "25%" }} className="text-left">
//         Exit Price
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ width: "25%" }} className="truncate">
//         {formatNumber((row.original as any).exitPrice)}
//       </div>
//     ),
//   },
//   {
//     id: "botName",
//     header: () => (
//       <div style={{ width: "25%" }} className="text-left">
//         Bot Name
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ width: "25%" }} className="truncate">
//         {getBotName(row.original)}
//       </div>
//     ),
//   },
// ];

// /* ---------------- component ---------------- */

// export default function SignalsDataTable() {
//   const [data, setData] = React.useState<Signal[]>([]);
//   const [loading, setLoading] = React.useState(true);
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [totalPages, setTotalPages] = React.useState(1);
//   const [totalItems, setTotalItems] = React.useState(0);

//   const [searchQuery, setSearchQuery] = React.useState("");
//   const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

//   // debounce identical to UsersDataTable
//   React.useEffect(() => {
//     const t = setTimeout(
//       () => setDebouncedSearchQuery(searchQuery.trim()),
//       300
//     );
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   // when search settles, reset to first page (same behavior as Users table)
//   React.useEffect(() => {
//     if (debouncedSearchQuery !== searchQuery) return;
//     if (pagination.pageIndex !== 0)
//       setPagination((p) => ({ ...p, pageIndex: 0 }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debouncedSearchQuery, searchQuery]);

//   const fetchSignals = React.useCallback(
//     async (pageIndex: number, pageSize: number, query?: string) => {
//       setLoading(true);
//       try {
//         // backend expects 1-indexed pages
//         const res: any = await SignalService.getSignals(
//           pageIndex + 1,
//           pageSize,
//           query ?? ""
//         );
//         const items: any[] = res?.data ?? [];

//         // Determine totalSignals & totalPages from whatever backend gives
//         const totalSignals =
//           res?.pagination?.totalSignals ??
//           res?.pagination?.total ??
//           res?.totalItems ??
//           res?.totalSignals ??
//           items.length;

//         const totalPagesFromServer =
//           res?.pagination?.totalPages ??
//           res?.totalPages ??
//           Math.max(1, Math.ceil(totalSignals / pageSize));

//         // compute safe pageIndex
//         const safePageIndex = Math.max(
//           0,
//           Math.min(pageIndex, Math.max(0, totalPagesFromServer - 1))
//         );

//         // Decide displayed rows — ALWAYS ensure at most pageSize rows are shown:
//         // - If server returned paginated page (items length <= pageSize) -> use items
//         // - If server returned full list (or items length > pageSize) -> slice client-side by requested pageIndex/pageSize
//         let displayed: any[] = items;
//         const serverProvidedPagination = Boolean(
//           res?.pagination ||
//             typeof res?.totalPages !== "undefined" ||
//             typeof res?.totalItems !== "undefined"
//         );

//         if (!serverProvidedPagination) {
//           // server returned full list -> slice
//           const pages = Math.max(1, Math.ceil(items.length / pageSize));
//           const idx = Math.max(0, Math.min(pageIndex, pages - 1));
//           displayed = items.slice(idx * pageSize, (idx + 1) * pageSize);
//         } else {
//           // server provided pagination info. But sometimes backend still returns a full list.
//           // To be safe, if items.length > pageSize, slice to show only the requested page chunk.
//           if (items.length > pageSize) {
//             displayed = items.slice(
//               safePageIndex * pageSize,
//               (safePageIndex + 1) * pageSize
//             );
//           } else {
//             displayed = items;
//           }
//         }

//         setData(displayed as Signal[]);
//         setTotalPages(Math.max(1, Number(totalPagesFromServer)));
//         setTotalItems(Number(totalSignals));

//         // if requested pageIndex was out-of-range, fix it (this will re-trigger fetch)
//         if (safePageIndex !== pageIndex) {
//           setPagination((p) => ({ ...p, pageIndex: safePageIndex }));
//         }
//       } catch (err: any) {
//         console.error("Failed to fetch signals:", err);
//         toast.error(err?.message || "Failed to load signals");
//         setData([]);
//         setTotalPages(1);
//         setTotalItems(0);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   // trigger fetch on pagination or search change (same behaviour as Users table)
//   React.useEffect(() => {
//     fetchSignals(
//       pagination.pageIndex,
//       pagination.pageSize,
//       debouncedSearchQuery
//     );
//   }, [
//     pagination.pageIndex,
//     pagination.pageSize,
//     debouncedSearchQuery,
//     fetchSignals,
//   ]);

//   // initial load
//   React.useEffect(() => {
//     fetchSignals(0, pagination.pageSize, debouncedSearchQuery);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const columns = React.useMemo(() => COLUMNS(), []);

//   const table = useReactTable({
//     data,
//     columns,
//     state: { pagination },
//     getRowId: (row) =>
//       (row as any).id?.toString?.() ??
//       (row as any)._id?.toString?.() ??
//       Math.random().toString(),
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     manualPagination: true,
//     pageCount: totalPages,
//   });

//   return (
//     <div className="w-full flex-col justify-start gap-6">
//       <div className="flex items-center justify-between px-4 py-2 lg:px-6">
//         <div className="text-lg font-semibold">Signals</div>

//         <div className="flex items-center gap-2">
//           <div className="relative flex-1 max-w-sm">
//             <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search signals (pair/tradeId)..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 h-8"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
//         <div className="overflow-hidden rounded-lg border">
//           <Table className="table-fixed">
//             <TableHeader className="bg-muted sticky top-0 z-10">
//               {table.getHeaderGroups().map((hg) => (
//                 <TableRow key={hg.id}>
//                   {hg.headers.map((header) => (
//                     <TableHead key={header.id} colSpan={header.colSpan}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>

//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={4} className="h-24 text-center">
//                     <div className="flex items-center justify-center gap-2">
//                       <IconLoader className="h-4 w-4 animate-spin" /> Loading
//                       signals...
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : table.getRowModel().rows.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow key={row.id}>
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={4} className="h-24 text-center">
//                     No signals found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         <div className="flex items-center justify-between px-4">
//           <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
//             {table.getFilteredSelectedRowModel().rows.length} of {totalItems}{" "}
//             row(s) selected.
//           </div>

//           <div className="flex w-full items-center gap-8 lg:w-fit">
//             <div className="hidden items-center gap-2 lg:flex">
//               <div className="text-sm font-medium">Rows per page</div>
//               <Select
//                 value={`${table.getState().pagination.pageSize}`}
//                 onValueChange={(value) => {
//                   // set pageSize and reset pageIndex to 0 (same UX as Users table)
//                   setPagination({ pageIndex: 0, pageSize: Number(value) });
//                 }}>
//                 <SelectTrigger size="sm" className="w-20" id="rows-per-page">
//                   <SelectValue
//                     placeholder={table.getState().pagination.pageSize}
//                   />
//                 </SelectTrigger>
//                 <SelectContent side="top">
//                   {[10, 20, 30, 40, 50].map((ps) => (
//                     <SelectItem key={ps} value={`${ps}`}>
//                       {ps}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex w-fit items-center justify-center text-sm font-medium">
//               Page {table.getState().pagination.pageIndex + 1} of {totalPages}
//             </div>

//             <div className="ml-auto flex items-center gap-2 lg:ml-0">
//               <Button
//                 variant="outline"
//                 className="hidden h-8 w-8 p-0 lg:flex"
//                 onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
//                 disabled={table.getState().pagination.pageIndex === 0}>
//                 <span className="sr-only">Go to first page</span>
//                 <IconChevronsLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     pageIndex: Math.max(0, p.pageIndex - 1),
//                   }))
//                 }
//                 disabled={table.getState().pagination.pageIndex === 0}>
//                 <span className="sr-only">Go to previous page</span>
//                 <IconChevronLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     pageIndex: Math.min(totalPages - 1, p.pageIndex + 1),
//                   }))
//                 }
//                 disabled={
//                   table.getState().pagination.pageIndex + 1 >= totalPages
//                 }>
//                 <span className="sr-only">Go to next page</span>
//                 <IconChevronRight />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="hidden size-8 lg:flex"
//                 size="icon"
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     pageIndex: Math.max(0, totalPages - 1),
//                   }))
//                 }
//                 disabled={
//                   table.getState().pagination.pageIndex + 1 >= totalPages
//                 }>
//                 <span className="sr-only">Go to last page</span>
//                 <IconChevronsRight />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import * as React from "react";
// import {
//   IconChevronLeft,
//   IconChevronRight,
//   IconChevronsLeft,
//   IconChevronsRight,
//   IconLoader,
//   IconSearch,
// } from "@tabler/icons-react";

// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { SignalService } from "@/services/signal";
// import type { Signal } from "@/types/signal";

// /* ---------------- helpers ---------------- */
// const getBotName = (s: any) => {
//   if (s?.bot && typeof s.bot === "object" && s.bot.name) return s.bot.name;
//   if (s?.botId && typeof s.botId === "object" && s.botId.name)
//     return s.botId.name;
//   if (s?.bot && typeof s.bot === "string") return s.bot;
//   if (s?.botId && typeof s.botId === "string") return s.botId;
//   return "-";
// };

// function formatNumber(v: any) {
//   if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
//   const n = Number(v);
//   if (Number.isInteger(n)) return n.toString();
//   return n.toFixed(2).replace(/\.?0+$/, "");
// }

// /* ---------------- columns (4 fixed columns) ---------------- */
// // Use minWidth + whitespace-nowrap so table doesn't shrink on mobile — instead wrapper will show horizontal scroll like Users table
// const COL_MIN_WIDTH = 160; // px (adjustable)

// const COLUMNS = (): ColumnDef<Signal>[] => [
//   {
//     accessorKey: "pairName",
//     header: () => (
//       <div
//         style={{ minWidth: COL_MIN_WIDTH }}
//         className="text-left whitespace-nowrap">
//         Pair
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
//         {row.original.pairName ?? "-"}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "entryPrice",
//     header: () => (
//       <div
//         style={{ minWidth: COL_MIN_WIDTH }}
//         className="text-left whitespace-nowrap">
//         Entry Price
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
//         {formatNumber((row.original as any).entryPrice)}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "exitPrice",
//     header: () => (
//       <div
//         style={{ minWidth: COL_MIN_WIDTH }}
//         className="text-left whitespace-nowrap">
//         Exit Price
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
//         {formatNumber((row.original as any).exitPrice)}
//       </div>
//     ),
//   },
//   {
//     id: "botName",
//     header: () => (
//       <div
//         style={{ minWidth: COL_MIN_WIDTH }}
//         className="text-left whitespace-nowrap">
//         Bot Name
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
//         {getBotName(row.original)}
//       </div>
//     ),
//   },
// ];

// /* ---------------- component ---------------- */
// export default function SignalsDataTable() {
//   const [data, setData] = React.useState<Signal[]>([]);
//   const [loading, setLoading] = React.useState(true);
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [totalPages, setTotalPages] = React.useState(1);
//   const [totalItems, setTotalItems] = React.useState(0);

//   const [searchQuery, setSearchQuery] = React.useState("");
//   const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

//   // debounce identical to UsersDataTable
//   React.useEffect(() => {
//     const t = setTimeout(
//       () => setDebouncedSearchQuery(searchQuery.trim()),
//       300
//     );
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   // when search settles, reset to first page (same behavior as Users table)
//   React.useEffect(() => {
//     if (debouncedSearchQuery !== searchQuery) return;
//     if (pagination.pageIndex !== 0)
//       setPagination((p) => ({ ...p, pageIndex: 0 }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debouncedSearchQuery, searchQuery]);

//   const fetchSignals = React.useCallback(
//     async (pageIndex: number, pageSize: number, query?: string) => {
//       setLoading(true);
//       try {
//         const res: any = await SignalService.getSignals(
//           pageIndex + 1,
//           pageSize,
//           query ?? ""
//         );
//         const items: any[] = res?.data ?? [];

//         const totalSignals =
//           res?.pagination?.totalSignals ??
//           res?.pagination?.total ??
//           res?.totalItems ??
//           res?.totalSignals ??
//           items.length;

//         const totalPagesFromServer =
//           res?.pagination?.totalPages ??
//           res?.totalPages ??
//           Math.max(1, Math.ceil(totalSignals / pageSize));

//         const safePageIndex = Math.max(
//           0,
//           Math.min(pageIndex, Math.max(0, totalPagesFromServer - 1))
//         );

//         let displayed: any[] = items;
//         const serverProvidedPagination = Boolean(
//           res?.pagination ||
//             typeof res?.totalPages !== "undefined" ||
//             typeof res?.totalItems !== "undefined"
//         );

//         if (!serverProvidedPagination) {
//           const pages = Math.max(1, Math.ceil(items.length / pageSize));
//           const idx = Math.max(0, Math.min(pageIndex, pages - 1));
//           displayed = items.slice(idx * pageSize, (idx + 1) * pageSize);
//         } else {
//           if (items.length > pageSize) {
//             displayed = items.slice(
//               safePageIndex * pageSize,
//               (safePageIndex + 1) * pageSize
//             );
//           } else {
//             displayed = items;
//           }
//         }

//         setData(displayed as Signal[]);
//         setTotalPages(Math.max(1, Number(totalPagesFromServer)));
//         setTotalItems(Number(totalSignals));

//         if (safePageIndex !== pageIndex) {
//           setPagination((p) => ({ ...p, pageIndex: safePageIndex }));
//         }
//       } catch (err: any) {
//         console.error("Failed to fetch signals:", err);
//         toast.error(err?.message || "Failed to load signals");
//         setData([]);
//         setTotalPages(1);
//         setTotalItems(0);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   // trigger fetch on pagination or search change
//   React.useEffect(() => {
//     fetchSignals(
//       pagination.pageIndex,
//       pagination.pageSize,
//       debouncedSearchQuery
//     );
//   }, [
//     pagination.pageIndex,
//     pagination.pageSize,
//     debouncedSearchQuery,
//     fetchSignals,
//   ]);

//   // initial load
//   React.useEffect(() => {
//     fetchSignals(0, pagination.pageSize, debouncedSearchQuery);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const columns = React.useMemo(() => COLUMNS(), []);

//   const table = useReactTable({
//     data,
//     columns,
//     state: { pagination },
//     getRowId: (row) =>
//       (row as any).id?.toString?.() ??
//       (row as any)._id?.toString?.() ??
//       Math.random().toString(),
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     manualPagination: true,
//     pageCount: totalPages,
//   });

//   return (
//     <div className="w-full flex-col justify-start gap-6">
//       <div className="flex items-center justify-between px-4 py-2 lg:px-6">
//         <div className="text-lg font-semibold">Signals</div>

//         <div className="flex items-center gap-2">
//           <div className="relative flex-1 max-w-sm">
//             <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 h-8"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
//         <div className="rounded-lg border">
//           {/* make the immediate table wrapper horizontally scrollable on small screens — users table behaves this way */}
//           <div className="overflow-x-auto">
//             <Table className="min-w-full">
//               <TableHeader className="bg-muted sticky top-0 z-10">
//                 {table.getHeaderGroups().map((hg) => (
//                   <TableRow key={hg.id}>
//                     {hg.headers.map((header) => (
//                       <TableHead key={header.id} colSpan={header.colSpan}>
//                         {header.isPlaceholder
//                           ? null
//                           : flexRender(
//                               header.column.columnDef.header,
//                               header.getContext()
//                             )}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHeader>

//               <TableBody>
//                 {loading ? (
//                   <TableRow>
//                     <TableCell colSpan={4} className="h-24 text-center">
//                       <div className="flex items-center justify-center gap-2">
//                         <IconLoader className="h-4 w-4 animate-spin" /> Loading
//                         signals...
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : table.getRowModel().rows.length ? (
//                   table.getRowModel().rows.map((row) => (
//                     <TableRow key={row.id}>
//                       {row.getVisibleCells().map((cell) => (
//                         <TableCell key={cell.id} className="align-top">
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={4} className="h-24 text-center">
//                       No signals found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>

//         <div className="flex items-center justify-between px-4">
//           <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
//             Showing {table.getRowModel().rows.length} of {totalItems} row(s).
//           </div>

//           <div className="flex w-full items-center gap-8 lg:w-fit">
//             <div className="hidden items-center gap-2 lg:flex">
//               <div className="text-sm font-medium">Rows per page</div>
//               <Select
//                 value={`${table.getState().pagination.pageSize}`}
//                 onValueChange={(value) => {
//                   setPagination({ pageIndex: 0, pageSize: Number(value) });
//                 }}>
//                 <SelectTrigger size="sm" className="w-20" id="rows-per-page">
//                   <SelectValue
//                     placeholder={table.getState().pagination.pageSize}
//                   />
//                 </SelectTrigger>
//                 <SelectContent side="top">
//                   {[10, 20, 30, 40, 50].map((ps) => (
//                     <SelectItem key={ps} value={`${ps}`}>
//                       {ps}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex w-fit items-center justify-center text-sm font-medium">
//               Page {table.getState().pagination.pageIndex + 1} of {totalPages}
//             </div>

//             <div className="ml-auto flex items-center gap-2 lg:ml-0">
//               <Button
//                 variant="outline"
//                 className="hidden h-8 w-8 p-0 lg:flex"
//                 onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
//                 disabled={table.getState().pagination.pageIndex === 0}>
//                 <span className="sr-only">Go to first page</span>
//                 <IconChevronsLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     pageIndex: Math.max(0, p.pageIndex - 1),
//                   }))
//                 }
//                 disabled={table.getState().pagination.pageIndex === 0}>
//                 <span className="sr-only">Go to previous page</span>
//                 <IconChevronLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     pageIndex: Math.min(totalPages - 1, p.pageIndex + 1),
//                   }))
//                 }
//                 disabled={
//                   table.getState().pagination.pageIndex + 1 >= totalPages
//                 }>
//                 <span className="sr-only">Go to next page</span>
//                 <IconChevronRight />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="hidden size-8 lg:flex"
//                 size="icon"
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     pageIndex: Math.max(0, totalPages - 1),
//                   }))
//                 }
//                 disabled={
//                   table.getState().pagination.pageIndex + 1 >= totalPages
//                 }>
//                 <span className="sr-only">Go to last page</span>
//                 <IconChevronsRight />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // components/signals/SignalsDataTable.tsx
// import * as React from "react";
// import {
//   IconChevronLeft,
//   IconChevronRight,
//   IconChevronsLeft,
//   IconChevronsRight,
//   IconLoader,
//   IconSearch,
// } from "@tabler/icons-react";

// import {
//   type ColumnDef,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { SignalService } from "@/services/signal";
// import type { Signal } from "@/types/signal";

// /* ---------------- helpers ---------------- */
// // robust fallback: prefer normalized botName, then nested bot.name, then botId string
// const getBotName = (s: any): string => {
//   if (!s) return "-";
//   if (typeof s.botName === "string" && s.botName.trim()) return s.botName;
//   if (s?.bot && typeof s.bot === "object" && s.bot.name) return s.bot.name;
//   if (s?.botId && typeof s.botId === "object" && s.botId.name)
//     return s.botId.name;
//   if (s?.bot && typeof s.bot === "string") return s.bot;
//   if (s?.botId && typeof s.botId === "string") return s.botId;
//   return "-";
// };

// function formatNumber(v: any) {
//   if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
//   const n = Number(v);
//   if (Number.isInteger(n)) return n.toString();
//   return n.toFixed(2).replace(/\.?0+$/, "");
// }

// /* ---------------- columns (4 fixed columns) ---------------- */
// const COL_MIN_WIDTH = 160; // px (adjust if you want narrower/wider columns)

// const COLUMNS = (): ColumnDef<Signal>[] => [
//   {
//     accessorKey: "pairName",
//     header: () => (
//       <div
//         style={{ minWidth: COL_MIN_WIDTH }}
//         className="text-left whitespace-nowrap">
//         Pair
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
//         {row.original.pairName ?? "-"}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "entryPrice",
//     header: () => (
//       <div
//         style={{ minWidth: COL_MIN_WIDTH }}
//         className="text-left whitespace-nowrap">
//         Entry Price
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
//         {formatNumber((row.original as any).entryPrice)}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "exitPrice",
//     header: () => (
//       <div
//         style={{ minWidth: COL_MIN_WIDTH }}
//         className="text-left whitespace-nowrap">
//         Exit Price
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
//         {formatNumber((row.original as any).exitPrice)}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "botName", // <- IMPORTANT: use botName accessor so table shows name (not id)
//     header: () => (
//       <div
//         style={{ minWidth: COL_MIN_WIDTH }}
//         className="text-left whitespace-nowrap">
//         Bot Name
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div style={{ minWidth: COL_MIN_WIDTH }} className="whitespace-nowrap">
//         {/* Prefer normalized botName; fallback to nested bot object via getBotName */}
//         {row.original.botName || getBotName(row.original)}
//       </div>
//     ),
//   },
// ];

// /* ---------------- component ---------------- */

// export default function SignalsDataTable() {
//   const [data, setData] = React.useState<Signal[]>([]);
//   const [loading, setLoading] = React.useState(true);
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [totalPages, setTotalPages] = React.useState(1);
//   const [totalItems, setTotalItems] = React.useState(0);

//   const [searchQuery, setSearchQuery] = React.useState("");
//   const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

//   // debounce same as Users table
//   React.useEffect(() => {
//     const t = setTimeout(
//       () => setDebouncedSearchQuery(searchQuery.trim()),
//       300
//     );
//     return () => clearTimeout(t);
//   }, [searchQuery]);

//   // when search settles, reset to first page (same UX as Users table)
//   React.useEffect(() => {
//     if (debouncedSearchQuery !== searchQuery) return;
//     if (pagination.pageIndex !== 0)
//       setPagination((p) => ({ ...p, pageIndex: 0 }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debouncedSearchQuery, searchQuery]);

//   const fetchSignals = React.useCallback(
//     async (pageIndex: number, pageSize: number, query?: string) => {
//       setLoading(true);
//       try {
//         // backend expects 1-indexed pages
//         const res: any = await SignalService.getSignals(
//           pageIndex + 1,
//           pageSize,
//           query ?? ""
//         );
//         const items: any[] = res?.data ?? [];

//         const totalSignals =
//           res?.pagination?.totalSignals ??
//           res?.pagination?.total ??
//           res?.totalItems ??
//           res?.totalSignals ??
//           items.length;

//         const totalPagesFromServer =
//           res?.pagination?.totalPages ??
//           res?.totalPages ??
//           Math.max(1, Math.ceil(totalSignals / pageSize));

//         const safePageIndex = Math.max(
//           0,
//           Math.min(pageIndex, Math.max(0, totalPagesFromServer - 1))
//         );

//         let displayed: any[] = items;
//         const serverProvidedPagination = Boolean(
//           res?.pagination ||
//             typeof res?.totalPages !== "undefined" ||
//             typeof res?.totalItems !== "undefined"
//         );

//         if (!serverProvidedPagination) {
//           const pages = Math.max(1, Math.ceil(items.length / pageSize));
//           const idx = Math.max(0, Math.min(pageIndex, pages - 1));
//           displayed = items.slice(idx * pageSize, (idx + 1) * pageSize);
//         } else {
//           if (items.length > pageSize) {
//             displayed = items.slice(
//               safePageIndex * pageSize,
//               (safePageIndex + 1) * pageSize
//             );
//           } else {
//             displayed = items;
//           }
//         }

//         setData(displayed as Signal[]);
//         setTotalPages(Math.max(1, Number(totalPagesFromServer)));
//         setTotalItems(Number(totalSignals));

//         if (safePageIndex !== pageIndex) {
//           setPagination((p) => ({ ...p, pageIndex: safePageIndex }));
//         }
//       } catch (err: any) {
//         console.error("Failed to fetch signals:", err);
//         toast.error(err?.message || "Failed to load signals");
//         setData([]);
//         setTotalPages(1);
//         setTotalItems(0);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   React.useEffect(() => {
//     fetchSignals(
//       pagination.pageIndex,
//       pagination.pageSize,
//       debouncedSearchQuery
//     );
//   }, [
//     pagination.pageIndex,
//     pagination.pageSize,
//     debouncedSearchQuery,
//     fetchSignals,
//   ]);

//   // initial load
//   React.useEffect(() => {
//     fetchSignals(0, pagination.pageSize, debouncedSearchQuery);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const columns = React.useMemo(() => COLUMNS(), []);

//   const table = useReactTable({
//     data,
//     columns,
//     state: { pagination },
//     getRowId: (row) =>
//       (row as any).id?.toString?.() ??
//       (row as any)._id?.toString?.() ??
//       Math.random().toString(),
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     manualPagination: true,
//     pageCount: totalPages,
//   });

//   return (
//     <div className="w-full flex-col justify-start gap-6">
//       <div className="flex items-center justify-between px-4 py-2 lg:px-6">
//         <div className="flex items-center gap-2">
//           <div className="relative flex-1 max-w-sm">
//             <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 h-8"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
//         <div className="rounded-lg border">
//           {/* Immediate wrapper that enables horizontal scrolling on small screens */}
//           <div className="overflow-x-auto">
//             <Table className="min-w-full">
//               <TableHeader className="bg-muted sticky top-0 z-10">
//                 {table.getHeaderGroups().map((hg) => (
//                   <TableRow key={hg.id}>
//                     {hg.headers.map((header) => (
//                       <TableHead key={header.id} colSpan={header.colSpan}>
//                         {header.isPlaceholder
//                           ? null
//                           : flexRender(
//                               header.column.columnDef.header,
//                               header.getContext()
//                             )}
//                       </TableHead>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableHeader>

//               <TableBody>
//                 {loading ? (
//                   <TableRow>
//                     <TableCell colSpan={4} className="h-24 text-center">
//                       <div className="flex items-center justify-center gap-2">
//                         <IconLoader className="h-4 w-4 animate-spin" /> Loading
//                         signals...
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : table.getRowModel().rows.length ? (
//                   table.getRowModel().rows.map((row) => (
//                     <TableRow key={row.id}>
//                       {row.getVisibleCells().map((cell) => (
//                         <TableCell key={cell.id} className="align-top">
//                           {flexRender(
//                             cell.column.columnDef.cell,
//                             cell.getContext()
//                           )}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={4} className="h-24 text-center">
//                       No signals found.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>

//         <div className="flex items-center justify-between px-4">
//           <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
//             Showing {table.getRowModel().rows.length} of {totalItems} row(s).
//           </div>

//           <div className="flex w-full items-center gap-8 lg:w-fit">
//             <div className="hidden items-center gap-2 lg:flex">
//               <div className="text-sm font-medium">Rows per page</div>
//               <Select
//                 value={`${table.getState().pagination.pageSize}`}
//                 onValueChange={(value) => {
//                   setPagination({ pageIndex: 0, pageSize: Number(value) });
//                 }}>
//                 <SelectTrigger size="sm" className="w-20" id="rows-per-page">
//                   <SelectValue
//                     placeholder={table.getState().pagination.pageSize}
//                   />
//                 </SelectTrigger>
//                 <SelectContent side="top">
//                   {[10, 20, 30, 40, 50].map((ps) => (
//                     <SelectItem key={ps} value={`${ps}`}>
//                       {ps}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex w-fit items-center justify-center text-sm font-medium">
//               Page {table.getState().pagination.pageIndex + 1} of {totalPages}
//             </div>

//             <div className="ml-auto flex items-center gap-2 lg:ml-0">
//               <Button
//                 variant="outline"
//                 className="hidden h-8 w-8 p-0 lg:flex"
//                 onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
//                 disabled={table.getState().pagination.pageIndex === 0}>
//                 <span className="sr-only">Go to first page</span>
//                 <IconChevronsLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     pageIndex: Math.max(0, p.pageIndex - 1),
//                   }))
//                 }
//                 disabled={table.getState().pagination.pageIndex === 0}>
//                 <span className="sr-only">Go to previous page</span>
//                 <IconChevronLeft />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="size-8"
//                 size="icon"
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     pageIndex: Math.min(totalPages - 1, p.pageIndex + 1),
//                   }))
//                 }
//                 disabled={
//                   table.getState().pagination.pageIndex + 1 >= totalPages
//                 }>
//                 <span className="sr-only">Go to next page</span>
//                 <IconChevronRight />
//               </Button>
//               <Button
//                 variant="outline"
//                 className="hidden size-8 lg:flex"
//                 size="icon"
//                 onClick={() =>
//                   setPagination((p) => ({
//                     ...p,
//                     pageIndex: Math.max(0, totalPages - 1),
//                   }))
//                 }
//                 disabled={
//                   table.getState().pagination.pageIndex + 1 >= totalPages
//                 }>
//                 <span className="sr-only">Go to last page</span>
//                 <IconChevronsRight />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
