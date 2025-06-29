import yahooFinance from 'yahoo-finance2';
import type { NextRequest } from 'next/server';

interface StockApiResponse {
  symbol: string;
  price: number;
  peRatio: number;
  earnings: number;
  lastUpdated: string;
  // Additional fields for main page compatibility
  name?: string;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
  dividend?: number;
  dividendYield?: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const symbolsParam = searchParams.get('symbols');
  if (!symbolsParam) {
    return Response.json({ success: false, error: 'Symbols parameter is required' }, { status: 400 });
  }
  const symbolList = symbolsParam.split(',');
  
  try {
    const results: Record<string, StockApiResponse> = {};
    
    for (const symbol of symbolList) {
      try {
        const quote = await yahooFinance.quote(symbol);
        
        // Calculate earnings from P/E ratio and price
        const peRatio = quote.trailingPE || 0;
        const price = quote.regularMarketPrice || 0;
        const earnings = peRatio > 0 ? price / peRatio : 0;
        
        results[symbol.toUpperCase()] = {
          symbol: symbol.toUpperCase(),
          name: quote.shortName || symbol.toUpperCase(),
          price: price,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          volume: quote.regularMarketVolume || 0,
          marketCap: quote.marketCap || 0,
          peRatio: peRatio,
          earnings: earnings,
          dividend: quote.trailingAnnualDividendRate || 0,
          dividendYield: quote.trailingAnnualDividendYield || 0,
          lastUpdated: new Date().toISOString(),
        };
      } catch (symbolError) {
        console.error(`Error fetching data for ${symbol}:`, symbolError);
        // Continue with other symbols even if one fails
      }
    }
    
    return Response.json({ 
      success: true, 
      data: results,
      message: `Successfully processed ${Object.keys(results).length} out of ${symbolList.length} symbols.`
    });
  } catch (error: unknown) {
    console.error('API Error:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch stock data' 
    }, { status: 500 });
  }
} 