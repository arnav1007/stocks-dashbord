'use client';

import { MarketData } from '@/types';
import { formatNumber, formatPercentage } from '@/utils/formatters';

interface MarketOverviewProps {
  data: MarketData;
}

export default function MarketOverview({ data }: MarketOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-red-600 bg-red-100';
      case 'pre-market':
        return 'text-yellow-600 bg-yellow-100';
      case 'after-hours':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Market Overview</h2>
        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(data.marketStatus)}`}>
          {formatStatus(data.marketStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* S&P 500 */}
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">S&P 500</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(data.indices.sp500.value)}
          </p>
          <div className={`text-xs sm:text-sm font-medium ${
            data.indices.sp500.change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {data.indices.sp500.change >= 0 ? '+' : ''}{formatNumber(data.indices.sp500.change)} 
            ({formatPercentage(data.indices.sp500.changePercent)})
          </div>
        </div>

        {/* NASDAQ */}
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">NASDAQ</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(data.indices.nasdaq.value)}
          </p>
          <div className={`text-xs sm:text-sm font-medium ${
            data.indices.nasdaq.change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {data.indices.nasdaq.change >= 0 ? '+' : ''}{formatNumber(data.indices.nasdaq.change)} 
            ({formatPercentage(data.indices.nasdaq.changePercent)})
          </div>
        </div>

        {/* Dow Jones */}
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Dow Jones</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {formatNumber(data.indices.dow.value)}
          </p>
          <div className={`text-xs sm:text-sm font-medium ${
            data.indices.dow.change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {data.indices.dow.change >= 0 ? '+' : ''}{formatNumber(data.indices.dow.change)} 
            ({formatPercentage(data.indices.dow.changePercent)})
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
} 