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
  IconShieldFilled,
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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserService } from "@/services/user";
import type { User, CreateUserRequest, UpdateUserRequest } from "@/types/user";

// Type for the table that includes user data from API with status
type CombinedUser = {
  id: string | number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  status?: "active" | "inactive";
  role?: "admin" | "user";
};

const createColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void
): ColumnDef<CombinedUser>[] => [
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
  // New user columns at the beginning
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => row.original.fullName || "-",
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || "-",
    enableHiding: false,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => row.original.phoneNumber || "-",
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original as User;

      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {user.status === "inactive" ? (
            <IconUserOff className="fill-gray-400 dark:fill-gray-300" />
          ) : (
            <IconUser className="fill-blue-500 dark:fill-blue-400" />
          )}
          {user.status
            ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
            : "-"}
        </Badge>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original as User;

      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {user.role === "admin" ? (
            <IconShieldFilled className="fill-blue-500 dark:fill-blue-400" />
          ) : (
            <IconUser className="fill-gray-400 dark:fill-gray-300" />
          )}
          {user.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "-"}
        </Badge>
      );
    },
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original as User;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(user)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface UserFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  status: "active" | "inactive";
  role: "admin" | "user";
}

// AddUserDrawer component for adding/editing users
function AddUserDrawer({
  user,
  onUserAdded,
  onUserUpdated,
  onClose,
}: {
  user?: User | null;
  onUserAdded?: () => void;
  onUserUpdated?: () => void;
  onClose?: () => void;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<UserFormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    status: "active",
    role: "user",
  });
  const [loading, setLoading] = React.useState(false);

  const isEdit = !!user;

  // Pre-fill form when editing
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        password: "",
        status: user.status || "active",
        role: user.role || "user",
      });
      setOpen(true);
    }
  }, [user]);

  const handleClose = () => {
    setOpen(false);
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      status: "active",
      role: "user",
    });
    onClose?.();
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isEdit && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    if (!isEdit && !formData.phoneNumber) {
      toast.error("Phone number is required for new users");
      return;
    }

    setLoading(true);

    try {
      if (isEdit && user) {
        const updateData: UpdateUserRequest = {
          fullName: formData.fullName,
          email: formData.email,
          status: formData.status,
          role: formData.role,
        };

        // Only include phoneNumber if it's not empty
        if (formData.phoneNumber.trim()) {
          updateData.phoneNumber = formData.phoneNumber;
        }

        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        await UserService.updateUser(user.id, updateData);
        toast.success("User updated successfully");
        onUserUpdated?.();
      } else {
        const createData: CreateUserRequest = {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          status: formData.status,
          role: formData.role,
        };

        await UserService.createUser(createData);
        toast.success("User created successfully");
        onUserAdded?.();
      }

      handleClose();
    } catch (error: any) {
      const errorMessage =
        error.message || "Something went wrong. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add User</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{isEdit ? "Edit User" : "Add New User"}</DrawerTitle>
          <DrawerDescription>
            {isEdit
              ? "Update the user account information"
              : "Create a new user account with the required information"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="phone">
                Phone Number {isEdit ? "(Optional)" : "*"}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                required={!isEdit}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="password">
                Password {isEdit ? "(Leave empty to keep current)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isEdit ? "Enter new password" : "Enter password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required={!isEdit}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleInputChange("status", value as "active" | "inactive")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  handleInputChange("role", value as "admin" | "user")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function UsersDataTable() {
  const [data, setData] = React.useState<CombinedUser[]>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] =
    React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users from API
  const fetchUsers = React.useCallback(
    async (page: number, pageSize: number, query?: string) => {
      setLoading(true);
      try {
        const result = await UserService.getUsers(page + 1, pageSize, query);

        // Transform API data to match combined schema
        const transformedData = result.data.map((user: User) => ({
          ...user,
          // Ensure status and role have proper defaults if not provided by API
          // Filter status to only allow active/inactive
          status:
            user.status === "active" || user.status === "inactive"
              ? user.status
              : "active",
          // Filter role to only allow admin/user
          role:
            user.role === "admin" || user.role === "user" ? user.role : "user",
          // Ensure phoneNumber is handled properly
          phoneNumber: user.phoneNumber || "",
        }));

        setData(transformedData);
        setTotalPages(result.totalPages);
        setTotalUsers(result.totalUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
        // Set empty data if API fails
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch users when pagination or search changes
  React.useEffect(() => {
    fetchUsers(pagination.pageIndex, pagination.pageSize, debouncedSearchQuery);
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchQuery,
    fetchUsers,
  ]);

  // Reset to first page when search changes
  React.useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return; // Avoid double fetch during debounce
    if (pagination.pageIndex !== 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [debouncedSearchQuery, pagination.pageIndex, searchQuery]);

  // Initial data fetch
  React.useEffect(() => {
    fetchUsers(0, 10);
  }, [fetchUsers]);

  const handleUserAdded = () => {
    // Clear selection and refresh data
    setRowSelection({});
    fetchUsers(pagination.pageIndex, pagination.pageSize, debouncedSearchQuery);
  };

  const handleUserUpdated = () => {
    setEditingUser(null);
    // Clear selection and refresh data
    setRowSelection({});
    fetchUsers(pagination.pageIndex, pagination.pageSize, debouncedSearchQuery);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await UserService.deleteUser(userToDelete.id);
      toast.success("User deleted successfully");
      // Clear selection and refresh data
      setRowSelection({});
      fetchUsers(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchQuery
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleMultiDelete = () => {
    setShowMultiDeleteConfirm(true);
  };

  const confirmMultiDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id.toString());

    if (selectedIds.length === 0) return;

    setDeleting(true);
    try {
      const response = await UserService.deleteMultipleUsers(selectedIds);
      toast.success(response.message);
      // Clear selection and refresh data
      setRowSelection({});
      fetchUsers(
        pagination.pageIndex,
        pagination.pageSize,
        debouncedSearchQuery
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete users"
      );
    } finally {
      setDeleting(false);
      setShowMultiDeleteConfirm(false);
    }
  };

  const columns = React.useMemo(
    () => createColumns(handleEditUser, handleDeleteUser),
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      pagination,
    },
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
              disabled={deleting}
            >
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
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          <AddUserDrawer
            user={editingUser}
            onUserAdded={handleUserAdded}
            onUserUpdated={handleUserUpdated}
            onClose={() => setEditingUser(null)}
          />
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <IconLoader className="h-4 w-4 animate-spin" />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {totalUsers}{" "}
            row(s) selected.
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
                }}
              >
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
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete User"
        description={`Are you sure you want to delete "${userToDelete?.fullName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteUser}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showMultiDeleteConfirm}
        onOpenChange={setShowMultiDeleteConfirm}
        title="Delete Multiple Users"
        description={`Are you sure you want to delete ${selectedCount} selected user(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={confirmMultiDelete}
        variant="destructive"
      />
    </div>
  );
}
