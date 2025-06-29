import yahooFinance from 'yahoo-finance2';
import { MarketData } from '@/types';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const [sp500, nasdaq, dow] = await Promise.all([
      yahooFinance.quote('^GSPC'),
      yahooFinance.quote('^IXIC'),
      yahooFinance.quote('^DJI'),
    ]);

    const data: MarketData = {
      indices: {
        sp500: {
          value: sp500.regularMarketPrice ?? 0,
          change: sp500.regularMarketChange ?? 0,
          changePercent: sp500.regularMarketChangePercent ?? 0,
        },
        nasdaq: {
          value: nasdaq.regularMarketPrice ?? 0,
          change: nasdaq.regularMarketChange ?? 0,
          changePercent: nasdaq.regularMarketChangePercent ?? 0,
        },
        dow: {
          value: dow.regularMarketPrice ?? 0,
          change: dow.regularMarketChange ?? 0,
          changePercent: dow.regularMarketChangePercent ?? 0,
        },
      },
      marketStatus: 'open',
      lastUpdated: new Date().toISOString(),
    };

    return Response.json({ success: true, data });
  } catch (error: unknown) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch market data' }, { status: 500 });
  }
} 