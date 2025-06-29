export interface StockHolding {
  /** Stock symbol (e.g., AAPL) */
  name: string;
  /** Sector (e.g., Technology, Financials) */
  sector: string;
  /** Stock exchange code */
  exchange: 'S&P' | 'DOW' | 'NASDAQ';
  /** Purchase price per share */
  purchasePrice: number;
  /** Number of shares held */
  quantity: number;
  /** P/E Ratio (from Google Finance) */
  peRatio?: number;
  /** Latest Earnings (from Google Finance) */
  latestEarnings?: number;
  /** Current Market Price (from Yahoo Finance) */
  cmp?: number;

  // Derived fields
  /** Total investment (purchasePrice × quantity) */
  readonly investment: number;
  /** Present value (cmp × quantity) */
  readonly presentValue: number;
  /** Gain/Loss (presentValue – investment) */
  readonly gainLoss: number;
  /** Portfolio percent (weight in portfolio) */
  portfolioPercent?: number;
  /** Gain/Loss percent (for table display) */
  gainLossPercent?: number;
}

// Example implementation of derived fields using a class
export class StockHoldingImpl implements StockHolding {
  name!: string;
  sector!: string;
  exchange!: 'S&P' | 'DOW' | 'NASDAQ';
  purchasePrice!: number;
  quantity!: number;
  peRatio?: number;
  latestEarnings?: number;
  cmp?: number;
  portfolioPercent?: number;
  gainLossPercent?: number;

  constructor(data: Omit<StockHolding, 'investment' | 'presentValue' | 'gainLoss'>) {
    Object.assign(this, data);
  }

  get investment(): number {
    return this.purchasePrice * this.quantity;
  }

  get presentValue(): number {
    return (this.cmp ?? 0) * this.quantity;
  }

  get gainLoss(): number {
    return this.presentValue - this.investment;
  }
} 