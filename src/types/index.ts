export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
  dividendYield: number;
  lastUpdated: string;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  holdings: Holding[];
  createdAt: string;
  updatedAt: string;
}

export interface Holding {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  stockData: StockData;
}

export interface WatchlistItem {
  symbol: string;
  stockData: StockData;
  addedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChartData {
  date: string;
  price: number;
  volume: number;
}

export interface MarketData {
  indices: {
    sp500: { value: number; change: number; changePercent: number };
    nasdaq: { value: number; change: number; changePercent: number };
    dow: { value: number; change: number; changePercent: number };
  };
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  lastUpdated: string;
} 