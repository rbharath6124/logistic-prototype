import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getPaginationRowModel
} from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { useState } from 'react';

type Shipment = {
  id: string;
  tracking_id: string;
  from_location: string;
  to_location: string;
  status: string;
  latest_executive: string | null;
  created_at: string;
};

const columnHelper = createColumnHelper<Shipment>();

const columns = [
  columnHelper.accessor('tracking_id', {
    header: 'Tracking ID',
    cell: info => <span className="font-semibold text-blue-600">{info.getValue()}</span>,
  }),
  columnHelper.accessor('from_location', {
    header: 'From',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('to_location', {
    header: 'To',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: info => {
      const val = info.getValue();
      let color = 'bg-gray-100 text-gray-800';
      if (val === 'Package Scanned') color = 'bg-blue-100 text-blue-800';
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
          {val}
        </span>
      );
    }
  }),
  columnHelper.accessor('latest_executive', {
    header: 'Executive',
    cell: info => info.getValue() || <span className="text-gray-400 italic">None</span>,
  }),
  columnHelper.accessor('created_at', {
    header: 'Created At',
    cell: info => format(new Date(info.getValue()), 'MMM d, yyyy HH:mm'),
  }),
  columnHelper.display({
    id: 'actions',
    cell: props => (
      <Link 
        to={`/shipments/${props.row.original.tracking_id}`}
        className="text-blue-600 hover:text-blue-900 font-medium bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
      >
        View
      </Link>
    )
  })
];

export const Shipments = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const res = await apiClient.get('/shipments/');
      return res.data;
    }
  });

  const table = useReactTable({
    data: shipments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipments</h1>
        <Link 
          to="/shipments/new" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Create New
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search shipments..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-10 w-full rounded-xl border-gray-200 bg-gray-50 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 font-semibold tracking-wider">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    Loading shipments...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50/50 transition-colors group">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls can go here */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {table.getRowModel().rows.length} of {shipments.length} results
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
