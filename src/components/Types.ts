// --- Extended Interfaces ---

export interface AmortizationEntry {
  period: number;
  interest: number;
  principal: number;
  extraPayment: number;
  totalPayment: number;
  balance: number;
}

export interface AmortizationResult {
  payment: string;
  total: string;
}

export interface CalculationHistoryItem {
  timestamp: number;
  principal: string;
  annualRate: string;
  years: string;
  frequency: string;
  extraPayment: string;
  result: AmortizationResult;
}