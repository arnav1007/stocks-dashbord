"use client"
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PortfolioTable from '@/components/PortfolioTable';
import { StockHolding } from '@/types/stock';

// Sample sectors for demonstration
const SECTORS = ['Technology', 'Consumer Goods'];

// Sample stocks for quick add - synced with main page
const SAMPLE_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Goods' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Goods' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
];

// Available exchanges
const EXCHANGES = [
  { code: 'S&P', name: 'S&P 500' },
  { code: 'DOW', name: 'Dow Jones' },
  { code: 'NASDAQ', name: 'NASDAQ' },
];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [liveCmps, setLiveCmps] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Add holding form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    sector: 'Technology',
    exchange: 'S&P' as 'S&P' | 'DOW' | 'NASDAQ',
    purchasePrice: 0,
    quantity: 0,
  });

  // Load holdings from localStorage on mount
  useEffect(() => {
    const savedHoldings = localStorage.getItem('portfolio-holdings');
    if (savedHoldings) {
      try {
        setHoldings(JSON.parse(savedHoldings));
      } catch {
        console.error('Error loading holdings');
      }
    }
    setMounted(true);
  }, []);

  // Save holdings to localStorage whenever they change
  useEffect(() => {
    if (mounted && holdings.length > 0) {
      localStorage.setItem('portfolio-holdings', JSON.stringify(holdings));
    }
  }, [holdings, mounted]);

  // Fetch live data for all holdings - FIXED: removed holdings from dependency array
  useEffect(() => {
    if (!mounted) return;

    const fetchLiveData = async () => {
      if (holdings.length === 0) return;
      
      setLoading(true);
      try {
        const symbols = holdings.map(h => h.name).join(',');
        const response = await fetch(`/api/stocks?symbols=${symbols}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const newCmps: Record<string, number> = {};
          
          // Update holdings with live data
          setHoldings(prevHoldings => 
            prevHoldings.map(holding => {
              const stockData = data.data[holding.name];
              if (stockData) {
                newCmps[holding.name] = stockData.price;
                return {
                  ...holding,
                  cmp: stockData.price,
                  peRatio: stockData.peRatio,
                  latestEarnings: stockData.earnings,
                };
              }
              return holding;
            })
          );
          
          setLiveCmps(newCmps);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch live data');
        }
      } catch {
        setError('Network error while fetching live data');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, [mounted, holdings]);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  // Auto-fetch price when stock is selected
  const handleStockSelection = async (symbol: string) => {
    setNewHolding(prev => ({ ...prev, symbol }));
    
    if (symbol) {
      try {
        const response = await fetch(`/api/stocks?symbols=${symbol}`);
        const data = await response.json();
        
        if (data.success && data.data[symbol]) {
          const stockData = data.data[symbol];
          setNewHolding(prev => ({
            ...prev,
            symbol,
            sector: SAMPLE_STOCKS.find(s => s.symbol === symbol)?.sector || 'Technology',
            purchasePrice: stockData.price, // Auto-fill with live price
          }));
        }
      } catch {
        console.error('Error fetching stock price');
      }
    }
  };

  const addHolding = async () => {
    if (!newHolding.symbol || newHolding.purchasePrice <= 0 || newHolding.quantity <= 0) {
      alert('Please fill all fields correctly');
      return;
    }

    // Fetch current market price for the stock
    try {
      const response = await fetch(`/api/stocks?symbols=${newHolding.symbol.toUpperCase()}`);
      const data = await response.json();
      
      let currentPrice = newHolding.purchasePrice;
      let peRatio = 0;
      let earnings = 0;
      
      if (data.success && data.data[newHolding.symbol.toUpperCase()]) {
        const stockData = data.data[newHolding.symbol.toUpperCase()];
        currentPrice = stockData.price;
        peRatio = stockData.peRatio;
        earnings = stockData.earnings;
      }

      const holding: StockHolding = {
        name: newHolding.symbol.toUpperCase(),
        sector: newHolding.sector,
        exchange: newHolding.exchange,
        purchasePrice: newHolding.purchasePrice,
        quantity: newHolding.quantity,
        cmp: currentPrice,
        peRatio: peRatio,
        latestEarnings: earnings,
        investment: newHolding.purchasePrice * newHolding.quantity,
        presentValue: currentPrice * newHolding.quantity,
        gainLoss: (currentPrice - newHolding.purchasePrice) * newHolding.quantity,
        portfolioPercent: 0,
        gainLossPercent: 0,
      };

      setHoldings(prev => [...prev, holding]);
      setNewHolding({ symbol: '', sector: 'Technology', exchange: 'S&P', purchasePrice: 0, quantity: 0 });
      setShowAddForm(false);
    } catch {
      alert('Error fetching stock data. Please try again.');
    }
  };

  const removeHolding = (symbol: string) => {
    setHoldings(prev => prev.filter(h => h.name !== symbol));
  };

  const quickAddStock = async (stock: typeof SAMPLE_STOCKS[0]) => {
    try {
      // Fetch current market price for the stock
      const response = await fetch(`/api/stocks?symbols=${stock.symbol}`);
      const data = await response.json();
      
      let currentPrice = 0;
      if (data.success && data.data[stock.symbol]) {
        currentPrice = data.data[stock.symbol].price;
      }

      setNewHolding({
        symbol: stock.symbol,
        sector: stock.sector,
        exchange: 'S&P',
        purchasePrice: currentPrice, // Pre-fill with current market price
        quantity: 0,
      });
      setShowAddForm(true);
    } catch {
      console.error('Error fetching stock price');
      setNewHolding({
        symbol: stock.symbol,
        sector: stock.sector,
        exchange: 'S&P',
        purchasePrice: 0,
        quantity: 0,
      });
      setShowAddForm(true);
    }
  };

  // Calculate portfolio summary
  const portfolioSummary = holdings.reduce((summary, holding) => {
    const currentPrice = liveCmps[holding.name] || holding.cmp || holding.purchasePrice;
    const presentValue = currentPrice * holding.quantity;
    const investment = holding.purchasePrice * holding.quantity;
    const gainLoss = presentValue - investment;

    return {
      totalInvestment: summary.totalInvestment + investment,
      totalPresentValue: summary.totalPresentValue + presentValue,
      totalGainLoss: summary.totalGainLoss + gainLoss,
      totalGainLossPercent: summary.totalGainLossPercent + (gainLoss / investment) * 100,
      count: summary.count + 1,
    };
  }, { totalInvestment: 0, totalPresentValue: 0, totalGainLoss: 0, totalGainLossPercent: 0, count: 0 });

  // Calculate sector summaries
  const sectorSummaries = holdings.reduce((sectors, holding) => {
    const currentPrice = liveCmps[holding.name] || holding.cmp || holding.purchasePrice;
    const presentValue = currentPrice * holding.quantity;
    const investment = holding.purchasePrice * holding.quantity;
    const gainLoss = presentValue - investment;

    if (!sectors[holding.sector]) {
      sectors[holding.sector] = { investment: 0, presentValue: 0, gainLoss: 0, count: 0 };
    }
    
    sectors[holding.sector].investment += investment;
    sectors[holding.sector].presentValue += presentValue;
    sectors[holding.sector].gainLoss += gainLoss;
    sectors[holding.sector].count += 1;
    
    return sectors;
  }, {} as Record<string, { investment: number; presentValue: number; gainLoss: number; count: number }>);

  if (!mounted) {
    return (
      <DashboardLayout title="Portfolio" onSearch={handleSearch}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading portfolio...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Portfolio" onSearch={handleSearch}>
      <div className="space-y-4 sm:space-y-6">
        {/* Portfolio Summary */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Portfolio Summary</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Add Holding
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Total Investment</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                ${portfolioSummary.totalInvestment.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Current Value</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                ${portfolioSummary.totalPresentValue.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Total Gain/Loss</p>
              <p className={`text-lg sm:text-2xl font-bold ${portfolioSummary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {portfolioSummary.totalGainLoss >= 0 ? '+' : ''}${portfolioSummary.totalGainLoss.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">Holdings</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{portfolioSummary.count}</p>
            </div>
          </div>
        </div>

        {/* Sector Summaries */}
        {Object.keys(sectorSummaries).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Sector Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(sectorSummaries).map(([sector, data]) => (
                <div key={sector} className="border rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{sector}</h3>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investment:</span>
                      <span className="font-medium">${data.investment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Value:</span>
                      <span className="font-medium">${data.presentValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gain/Loss:</span>
                      <span className={`font-medium ${data.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.gainLoss >= 0 ? '+' : ''}${data.gainLoss.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stocks:</span>
                      <span className="font-medium">{data.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Add Stocks */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Add Popular Stocks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {SAMPLE_STOCKS.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => quickAddStock(stock)}
                className="p-2 sm:p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="font-semibold text-gray-900 text-sm sm:text-base">{stock.symbol}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">{stock.name}</div>
                <div className="text-xs text-gray-500">{stock.sector}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Add Holding Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Add New Holding</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Select Stock</label>
                <select
                  value={newHolding.symbol}
                  onChange={(e) => handleStockSelection(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Choose a stock...</option>
                  {SAMPLE_STOCKS.map(stock => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - {stock.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sector</label>
                <select
                  value={newHolding.sector}
                  onChange={(e) => setNewHolding(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {SECTORS.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Exchange</label>
                <select
                  value={newHolding.exchange}
                  onChange={(e) => setNewHolding(prev => ({ ...prev, exchange: e.target.value as 'S&P' | 'DOW' | 'NASDAQ' }))}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {EXCHANGES.map(exchange => (
                    <option key={exchange.code} value={exchange.code}>
                      {exchange.code} - {exchange.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Purchase Price (Auto-filled)</label>
                <input
                  type="number"
                  value={newHolding.purchasePrice}
                  onChange={(e) => setNewHolding(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
                  placeholder="Auto-filled from live data"
                  step="0.01"
                  readOnly={false}
                />
                <p className="text-xs text-gray-500 mt-1">Current market price (can be edited)</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newHolding.quantity}
                  onChange={(e) => setNewHolding(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="0"
                  min="1"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={addHolding}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  Add Holding
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Table */}
        <PortfolioTable 
          holdings={holdings} 
          liveCmps={liveCmps} 
          loading={loading} 
          error={error}
          onRemoveHolding={removeHolding}
        />
      </div>
    </DashboardLayout>
  );
} 