import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type Table as TableType,
  type Updater,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';

import { type Dispatch, type SetStateAction, useMemo } from 'react';
import { DataTablePagination } from './data-table-pagination';

interface PagingTableProps<
  TData,
  TValue,
  TToolbarProps = Record<string, unknown>,
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  Toolbar?: React.ComponentType<{ table: TableType<TData> } & TToolbarProps>;
  toolbarProps?: TToolbarProps;
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  page: number;
  setPage: (page: number) => void;
  lastPage: number;
}

export function PagingTable<
  TData,
  TValue,
  TToolbarProps = Record<string, unknown>,
>({
  columns,
  data,
  Toolbar,
  toolbarProps,
  sorting,
  setSorting,
  page,
  setPage,
  lastPage,
}: PagingTableProps<TData, TValue, TToolbarProps>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const paginationState = useMemo(() => {
    return {
      pageIndex: page - 1,
      pageSize: 20,
    };
  }, [page]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: paginationState,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: lastPage,
    onPaginationChange: (updater: Updater<PaginationState>) => {
      if (typeof updater === 'function') {
        setPage(updater(paginationState).pageIndex + 1);
      } else {
        setPage(updater.pageIndex + 1);
      }
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex flex-col gap-4">
      {Toolbar && (
        <Toolbar table={table} {...(toolbarProps as TToolbarProps)} />
      )}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
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
                  데이터가 없습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
