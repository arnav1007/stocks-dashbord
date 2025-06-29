'use client';

import DashboardLayout from '@/components/DashboardLayout';
import MarketOverview from '@/components/MarketOverview';
import StockCard from '@/components/StockCard';
import { useStockData } from '@/hooks/useStockData';
import { MarketData } from '@/types';
import { useEffect, useState } from 'react';
import { StockHolding } from '@/types/stock';

// Popular stocks to display
const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META'];

export default function Home() {
  const { data: stockData, loading, error, lastUpdated } = useStockData({
    symbols: popularStocks,
    interval: 30000, // Refresh every 30 seconds
  });

  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);

  const [portfolioSummary, setPortfolioSummary] = useState({
    totalInvestment: 0,
    totalPresentValue: 0,
    totalGainLoss: 0,
    count: 0,
  });

  useEffect(() => {
    setMarketLoading(true);
    fetch('/api/market-data')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setMarketData(res.data);
          setMarketError(null);
        } else {
          setMarketError(res.error || 'Failed to fetch market data');
          setMarketData(null);
        }
        setMarketLoading(false);
      })
      .catch(err => {
        setMarketError(err.message || 'Failed to fetch market data');
        setMarketData(null);
        setMarketLoading(false);
      });
  }, []);

  useEffect(() => {
    // Load holdings from localStorage and calculate summary
    const savedHoldings = localStorage.getItem('portfolio-holdings');
    if (savedHoldings) {
      try {
        const holdings: StockHolding[] = JSON.parse(savedHoldings);
        let totalInvestment = 0;
        let totalPresentValue = 0;
        let totalGainLoss = 0;
        holdings.forEach(h => {
          const investment = h.purchasePrice * h.quantity;
          const presentValue = (h.cmp || h.purchasePrice) * h.quantity;
          totalInvestment += investment;
          totalPresentValue += presentValue;
          totalGainLoss += presentValue - investment;
        });
        setPortfolioSummary({
          totalInvestment,
          totalPresentValue,
          totalGainLoss,
          count: holdings.length,
        });
      } catch {
        setPortfolioSummary({ totalInvestment: 0, totalPresentValue: 0, totalGainLoss: 0, count: 0 });
      }
    } else {
      setPortfolioSummary({ totalInvestment: 0, totalPresentValue: 0, totalGainLoss: 0, count: 0 });
    }
  }, []);

  const handleSearch = (query: string) => {
    // In a real app, you would implement search functionality here
    console.log('Searching for:', query);
  };

  const stocks = Object.values(stockData);

  return (
    <DashboardLayout title="Dashboard" onSearch={handleSearch}>
      <div className="space-y-4 sm:space-y-6">
        {/* Market Overview */}
        {marketLoading ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">Loading market data...</div>
        ) : marketError ? (
          <div className="bg-red-100 text-red-700 rounded-lg shadow-md p-4 sm:p-6 text-center text-sm sm:text-base">{marketError}</div>
        ) : marketData ? (
          <MarketOverview data={marketData} />
        ) : null}

        {/* Portfolio Summary */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Portfolio Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Total Investment</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">${portfolioSummary.totalInvestment.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Current Value</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">${portfolioSummary.totalPresentValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Total Gain/Loss</p>
              <p className={`text-lg sm:text-2xl font-bold ${portfolioSummary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{portfolioSummary.totalGainLoss >= 0 ? '+' : ''}${portfolioSummary.totalGainLoss.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Holdings</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{portfolioSummary.count}</p>
            </div>
          </div>
        </div>

        {/* Popular Stocks */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Popular Stocks</h2>
            {lastUpdated && (
              <p className="text-xs sm:text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          {loading && (
            <div className="text-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading stock data...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-6 sm:py-8">
              <p className="text-red-500 text-sm sm:text-base">Error loading stock data: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {stocks.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  onClick={() => console.log(`Clicked on ${stock.symbol}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Bought 10 AAPL shares</p>
                <p className="text-xs sm:text-sm text-gray-500">Today at 2:30 PM</p>
              </div>
              <span className="text-green-600 font-medium text-sm sm:text-base ml-2">+$1,750.00</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Sold 5 TSLA shares</p>
                <p className="text-xs sm:text-sm text-gray-500">Yesterday at 10:15 AM</p>
              </div>
              <span className="text-red-600 font-medium text-sm sm:text-base ml-2">-$2,450.00</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">Added GOOGL to watchlist</p>
                <p className="text-xs sm:text-sm text-gray-500">2 days ago</p>
              </div>
              <span className="text-blue-600 font-medium text-sm sm:text-base ml-2">Watchlist</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
