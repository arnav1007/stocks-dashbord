'use client';

import { useState, useEffect, useCallback } from 'react';
import { StockData } from '@/types';

interface UseStockDataOptions {
  symbols: string[];
  interval?: number; // Refresh interval in milliseconds
  autoRefresh?: boolean;
}

export const useStockData = ({ 
  symbols, 
  interval = 30000, 
  autoRefresh = true 
}: UseStockDataOptions) => {
  const [data, setData] = useState<Record<string, StockData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStockDataHook = useCallback(async () => {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/stocks?symbols=${symbols.join(',')}`);
      const dataJson = await res.json();
      if (dataJson.success && dataJson.data) {
        // Convert the object format to StockData array format for compatibility
        const dataMap: Record<string, StockData> = {};
        Object.entries(dataJson.data).forEach(([symbol, stockData]: [string, unknown]) => {
          const s = stockData as StockData;
          dataMap[symbol] = {
            symbol: symbol,
            name: s.name || symbol,
            price: s.price,
            change: s.change || 0,
            changePercent: s.changePercent || 0,
            volume: s.volume || 0,
            marketCap: s.marketCap || 0,
            pe: s.pe || 0,
            dividend: s.dividend || 0,
            dividendYield: s.dividendYield || 0,
            lastUpdated: s.lastUpdated,
          };
        });
        setData(dataMap);
        setLastUpdated(new Date());
      } else {
        setError(dataJson.error || 'Failed to fetch stock data');
        setData({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      setData({});
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  // Initial fetch
  useEffect(() => {
    fetchStockDataHook();
  }, [fetchStockDataHook]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || interval <= 0) return;

    const intervalId = setInterval(fetchStockDataHook, interval);
    return () => clearInterval(intervalId);
  }, [fetchStockDataHook, interval, autoRefresh]);

  const refresh = useCallback(() => {
    fetchStockDataHook();
  }, [fetchStockDataHook]);

  const getStockData = useCallback((symbol: string): StockData | null => {
    return data[symbol] || null;
  }, [data]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    getStockData,
  };
}; 