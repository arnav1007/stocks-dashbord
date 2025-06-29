import React, { useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  GroupingState,
} from '@tanstack/react-table';
import { StockHolding } from '../types/stock';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatters';

interface PortfolioTableProps {
  holdings: StockHolding[];
  liveCmps: Record<string, number>;
  loading?: boolean;
  error?: string | null;
  onRemoveHolding?: (symbol: string) => void;
}

const columnHelper = createColumnHelper<StockHolding>();

const PortfolioTable: React.FC<PortfolioTableProps> = React.memo(({ 
  holdings, 
  liveCmps, 
  loading = false, 
  error = null,
  onRemoveHolding
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [grouping, setGrouping] = useState<GroupingState>(['sector']);

  // Calculate total investment for portfolio percent
  const totalInvestment = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.purchasePrice * h.quantity, 0);
  }, [holdings]);

  // Memoize the processed holdings to prevent unnecessary recalculations
  const processedHoldings = useMemo(() => {
    return holdings.map(holding => {
      const currentPrice = liveCmps[holding.name] || holding.cmp || holding.purchasePrice;
      const presentValue = currentPrice * holding.quantity;
      const investment = holding.purchasePrice * holding.quantity;
      const gainLoss = presentValue - investment;
      const gainLossPercent = investment ? (gainLoss / investment) * 100 : 0;
      const portfolioPercent = totalInvestment ? (investment / totalInvestment) * 100 : 0;
      return {
        ...holding,
        cmp: currentPrice,
        presentValue,
        investment,
        gainLoss,
        gainLossPercent,
        portfolioPercent,
      };
    });
  }, [holdings, liveCmps, totalInvestment]);

  // Memoize the columns to prevent unnecessary re-renders
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      id: 'symbol',
      header: 'Symbol',
      cell: ({ getValue }) => (
        <div className="font-semibold text-gray-900 text-sm sm:text-base">
          {getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('name', {
      id: 'company',
      header: 'Company',
      cell: ({ getValue }) => (
        <div className="text-xs sm:text-sm text-gray-700 hidden md:block">
          {getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('purchasePrice', {
      header: 'Purchase Price',
      cell: ({ getValue }) => (
        <div className="text-gray-700 text-xs sm:text-sm">
          {formatCurrency(getValue() as number)}
        </div>
      ),
    }),
    columnHelper.accessor('quantity', {
      header: 'Qty',
      cell: ({ getValue }) => (
        <div className="text-gray-700 text-xs sm:text-sm">
          {formatNumber(getValue() as number)}
        </div>
      ),
    }),
    columnHelper.accessor('investment', {
      header: 'Investment',
      cell: ({ getValue }) => (
        <div className="text-gray-700 text-xs sm:text-sm hidden sm:block">
          {formatCurrency(getValue() as number)}
        </div>
      ),
    }),
    columnHelper.accessor('portfolioPercent', {
      header: 'Portfolio %',
      cell: ({ getValue }) => (
        <div className="text-gray-700 text-xs sm:text-sm hidden lg:block">
          {formatPercentage(getValue() as number)}
        </div>
      ),
    }),
    columnHelper.accessor('exchange', {
      header: 'Exchange',
      cell: ({ getValue }) => (
        <div className="text-gray-700 text-xs sm:text-sm hidden xl:block">
          {getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('cmp', {
      header: 'CMP',
      cell: ({ getValue }) => (
        <div className="font-medium text-gray-900 text-xs sm:text-sm">
          {formatCurrency(getValue() as number)}
        </div>
      ),
    }),
    columnHelper.accessor('presentValue', {
      header: 'Present Value',
      cell: ({ getValue }) => (
        <div className="font-medium text-gray-900 text-xs sm:text-sm hidden sm:block">
          {formatCurrency(getValue() as number)}
        </div>
      ),
    }),
    columnHelper.accessor('gainLoss', {
      header: 'Gain/Loss',
      cell: ({ getValue, row }) => {
        const value = getValue() as number;
        const percent = row.original.gainLossPercent as number;
        const isPositive = value >= 0;
        return (
          <div className={`font-semibold text-xs sm:text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <div>{formatCurrency(value)}</div>
            <div className="text-xs hidden sm:block">
              {formatPercentage(percent)}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('peRatio', {
      header: 'P/E',
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === null || value === undefined) {
          return <div className="text-gray-400 text-xs sm:text-sm hidden lg:block">N/A</div>;
        }
        return (
          <div className="text-gray-700 text-xs sm:text-sm hidden lg:block">
            {formatNumber(value as number)}
          </div>
        );
      },
    }),
    columnHelper.accessor('latestEarnings', {
      header: 'Earnings',
      cell: ({ getValue }) => {
        const value = getValue();
        if (value === null || value === undefined) {
          return <div className="text-gray-400 text-xs sm:text-sm hidden xl:block">N/A</div>;
        }
        return (
          <div className="text-gray-700 text-xs sm:text-sm hidden xl:block">
            {formatNumber(value as number)}
          </div>
        );
      },
    }),
    columnHelper.accessor('sector', {
      header: 'Sector',
      cell: ({ getValue }) => (
        <div className="text-xs sm:text-sm text-gray-600 hidden xl:block">
          {getValue()}
        </div>
      ),
    }),
    // Add remove button column
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-center">
          {onRemoveHolding && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const symbol = row.original.name;
                const confirmMessage = `Are you sure you want to remove ${symbol} from your portfolio?`;
                if (confirm(confirmMessage)) {
                  onRemoveHolding(symbol);
                }
              }}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
              title={`Remove ${row.original.name} from portfolio`}
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ),
    }),
  ], [onRemoveHolding]);

  // Memoize the table instance
  const table = useReactTable({
    data: processedHoldings,
    columns,
    state: {
      sorting,
      grouping,
    },
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // Disable pagination to prevent state update issues
    manualPagination: true,
    pageCount: 1,
  });

  // Memoize the error display component
  const ErrorDisplay = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-xs sm:text-sm font-medium text-red-800">
              Data Loading Error
            </h3>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }, [error]);

  // Memoize the loading display component
  const LoadingDisplay = useMemo(() => {
    if (!loading) return null;
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-xs sm:text-sm font-medium text-blue-800">
              Updating Live Data
            </h3>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700">
              Fetching latest market prices...
            </div>
          </div>
        </div>
      </div>
    );
  }, [loading]);

  // Memoize the empty state component
  const EmptyState = useMemo(() => {
    if (processedHoldings.length > 0) return null;
    
    return (
      <div className="text-center py-8 sm:py-12">
        <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolio data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding some stocks to your portfolio.
        </p>
      </div>
    );
  }, [processedHoldings.length]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Portfolio Holdings</h2>
            <p className="text-sm text-gray-600">
              {processedHoldings.length} holdings • Grouped by sector • Live data updates every 15 seconds
            </p>
          </div>
          {loading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">Updating...</span>
            </div>
          )}
        </div>
      </div>

      {ErrorDisplay}
      {LoadingDisplay}

      <div className="overflow-x-auto">
        {EmptyState || (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'asc' ? '↑' : 
                             header.column.getIsSorted() === 'desc' ? '↓' : '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.original.name + '-' + row.original.exchange}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    // Optional: Add click handler for row selection
                    console.log('Clicked on:', row.original.name);
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {processedHoldings.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Last updated: <span suppressHydrationWarning>{new Date().toLocaleTimeString()}</span>
            </span>
            <span>
              {processedHoldings.length} holdings • 
              Total Value: ${processedHoldings.reduce((sum, h) => sum + (h.presentValue || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

PortfolioTable.displayName = 'PortfolioTable';

export default PortfolioTable; 