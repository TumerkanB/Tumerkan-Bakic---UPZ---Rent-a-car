import { ArrowDown, ArrowUp, Download, Search } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  csvValue?: (row: T) => string | number | null | undefined;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  sort?: string;
  order?: 'asc' | 'desc';
  onSortChange?: (key: string) => void;
  search?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  exportFilename?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  emptyMessage = 'No records found',
  page,
  pageSize,
  total,
  onPageChange,
  sort,
  order,
  onSortChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  exportFilename,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function handleExportCsv() {
    const exportCols = columns.filter((c) => c.csvValue);
    const headers = exportCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const lines = rows.map((r) =>
      exportCols
        .map((c) => {
          const val = c.csvValue?.(r) ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(','),
    );
    const blob = new Blob([[headers, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename || 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {(onSearchChange || filters || exportFilename) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {onSearchChange && (
              <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}
            {filters}
          </div>

          {exportFilename && rows.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">{emptyMessage}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3">
                      {col.sortable && onSortChange ? (
                        <button
                          type="button"
                          onClick={() => onSortChange(col.key)}
                          className="inline-flex items-center gap-1 hover:text-slate-800"
                        >
                          {col.header}
                          {sort === col.key &&
                            (order === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            ))}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-slate-50/70">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
            <span>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="rounded border border-slate-300 bg-white px-2.5 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="rounded border border-slate-300 bg-white px-2.5 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
