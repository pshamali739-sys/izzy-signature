import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter,
  MoreVertical,
  ArrowUpDown
} from 'lucide-react';

export default function DataTable({
  columns,
  data,
  loading,
  onRowClick,
  onSort,
  sortColumn,
  sortDirection,
  searchable = true,
  filterable = true,
  emptyMessage = 'No data found'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const filteredData = data?.filter(row => {
    if (!searchTerm) return true;
    return columns.some(col => {
      const value = row[col.accessor];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  }) || [];

  const handleSort = (column) => {
    if (!onSort) return;
    const newDirection = sortColumn === column.accessor && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.accessor, newDirection);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      {(searchable || filterable) && (
        <div className="flex items-center gap-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#16182e]/60 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a98be8]/50 focus:border-transparent transition-all"
              />
            </div>
          )}
          {filterable && (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#16182e]/60 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-white/5 bg-[#161825]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {columns.map((column) => (
                  <th
                    key={column.accessor}
                    className={cn(
                      'px-6 py-4 text-left text-sm font-semibold text-slate-300',
                      column.sortable && 'cursor-pointer hover:text-white transition-colors',
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && sortColumn === column.accessor && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4 text-[#e5b962]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#e5b962]" />
                        )
                      )}
                      {column.sortable && sortColumn !== column.accessor && (
                        <ArrowUpDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <React.Fragment key={row.id || index}>
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={cn(
                        'border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer',
                        onRowClick && 'hover:bg-white/5'
                      )}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.accessor}
                          className={cn('px-6 py-4 text-sm', column.cellClassName)}
                        >
                          {column.cell ? column.cell(row) : row[column.accessor]}
                        </td>
                      ))}
                    </motion.tr>
                    {expandedRow === row.id && row.expandableContent && (
                      <tr>
                        <td colSpan={columns.length} className="px-6 py-4 bg-white/5">
                          {row.expandableContent}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredData.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Showing {filteredData.length} of {data?.length || 0} entries</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
