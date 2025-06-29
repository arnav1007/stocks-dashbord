'use client';

import { StockData } from '@/types';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters';

interface StockCardProps {
  stock: StockData;
  onClick?: () => void;
  className?: string;
}

export default function StockCard({ stock, onClick, className = '' }: StockCardProps) {
  const isPositive = stock.change >= 0;
  const isNegative = stock.change < 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer ${className}`}
    >
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{stock.symbol}</h3>
          <p className="text-xs sm:text-sm text-gray-600 truncate">{stock.name}</p>
        </div>
        <div className="text-right ml-2">
          <p className="font-bold text-base sm:text-lg text-gray-900">
            {formatCurrency(stock.price)}
          </p>
          <div className={`text-xs sm:text-sm font-medium ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
          }`}>
            {isPositive ? '+' : ''}{formatCurrency(stock.change)} ({formatPercentage(stock.changePercent)})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
        <div>
          <p className="text-gray-500">Volume</p>
          <p className="font-medium text-gray-900 truncate">
            {formatNumber(stock.volume)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Market Cap</p>
          <p className="font-medium text-gray-900 truncate">
            {formatNumber(stock.marketCap)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">P/E Ratio</p>
          <p className="font-medium text-gray-900">
            {stock.pe.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Dividend Yield</p>
          <p className="font-medium text-gray-900">
            {stock.dividendYield.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(stock.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
} 