import { useEffect, useState } from "react";
import { AmortizationEntry, AmortizationResult, CalculationHistoryItem } from "./Types";
import { exportLoanToPDF } from "../utils/pdfExport";
import { exportLoanToCSV } from "../utils/csvExport";

const MAX_HISTORY_ITEMS = 20;

export type Frequency = "monthly" | "yearly";

export function useLoanCalculatorContainer() {
  // Input States
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [extraPayment, setExtraPayment] = useState("");

  // Computed States
  const [result, setResult] = useState<AmortizationResult | null>(null);
  const [schedule, setSchedule] = useState<AmortizationEntry[]>([]);

  // Totals
  const [totalPrincipalPaid, setTotalPrincipalPaid] = useState(0);
  const [totalExtraPaid, setTotalExtraPaid] = useState(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);
  const [totalPaymentSum, setTotalPaymentSum] = useState(0);
  const [scheduledNoExtraInterest, setScheduledNoExtraInterest] = useState(0);

  // Theme & History States
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  // --- Theme Persistence ---
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // --- Load History from localStorage ---
  useEffect(() => {
    const stored = localStorage.getItem("calcHistory");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch (e) {
        console.error("Error parsing calculation history:", e);
      }
    }
    setHasLoadedHistory(true);
  }, []);

  // --- Save History on Change ---
  useEffect(() => {
    if (hasLoadedHistory) {
      localStorage.setItem("calcHistory", JSON.stringify(history));
    }
  }, [history, hasLoadedHistory]);

  // --- Calculate Interest Without Extra Payments ---
  const calculateNoExtraInterest = (P: number, rAnnual: number, y: number, frequency: Frequency) => {
    const periods = frequency === "monthly" ? y * 12 : y;
    const periodRate = frequency === "monthly" ? rAnnual / 12 : rAnnual;
    const payment = (P * periodRate) / (1 - Math.pow(1 + periodRate, -periods));

    let balance = P;
    let totalInterest = 0;

    for (let i = 1; i <= periods; i++) {
      const interest = balance * periodRate;
      const principalPayment = payment - interest;
      balance -= principalPayment;
      totalInterest += interest;
      if (balance <= 0) break;
    }

    return totalInterest;
  };

  // --- Amortization Calculation ---
  const calculateAmortization = () => {
    const P = parseFloat(principal);
    const rAnnual = parseFloat(annualRate) / 100;
    const y = parseInt(years);
    const extraPmt = parseFloat(extraPayment) || 0;

    if (!P || !rAnnual || !y) {
      setResult(null);
      setSchedule([]);
      return;
    }

    const periods = frequency === "monthly" ? y * 12 : y;
    const periodRate = frequency === "monthly" ? rAnnual / 12 : rAnnual;
    const payment = (P * periodRate) / (1 - Math.pow(1 + periodRate, -periods));

    let balance = P;
    const amortizationSchedule: AmortizationEntry[] = [];

    for (let i = 1; i <= periods; i++) {
      const interest = parseFloat((balance * periodRate).toFixed(10));
      const principalPayment = parseFloat((payment - interest).toFixed(10));

      let totalPrincipalPayment = principalPayment + extraPmt;
      let actualExtra = extraPmt;

      if (totalPrincipalPayment > balance) {
        actualExtra = Math.max(0, parseFloat((balance - principalPayment).toFixed(10)));

        totalPrincipalPayment = balance;
      }


      const totalPayment = interest + totalPrincipalPayment;
      balance -= totalPrincipalPayment;

      amortizationSchedule.push({
        period: i,
        interest,
        principal: principalPayment,
        extraPayment: actualExtra,
        totalPayment,
        balance: balance > 0 ? balance : 0,
      });

      if (balance <= 0.01) break;
    }

    // ✅ Calculate totals after full schedule
    const totalPrincipal = amortizationSchedule.reduce((sum, e) => sum + e.principal, 0);
    const totalExtra = amortizationSchedule.reduce((sum, e) => sum + e.extraPayment, 0);
    const totalInterest = amortizationSchedule.reduce((sum, e) => sum + e.interest, 0);
    const totalPaid = amortizationSchedule.reduce((sum, e) => sum + e.totalPayment, 0);

    setTotalPrincipalPaid(totalPrincipal);
    setTotalExtraPaid(totalExtra);
    setTotalInterestPaid(totalInterest);
    setTotalPaymentSum(totalPaid);

    // Calculate interest without extra payments
    const noExtraInterest = calculateNoExtraInterest(P, rAnnual, y, frequency);
    setScheduledNoExtraInterest(noExtraInterest);

    const calcResult: AmortizationResult = {
      payment: payment.toFixed(2),
      total: totalPaid.toFixed(2),
    };

    setResult(calcResult);
    setSchedule(amortizationSchedule);

    const historyItem: CalculationHistoryItem = {
      timestamp: Date.now(),
      principal,
      annualRate,
      years,
      frequency,
      extraPayment,
      result: calcResult,
    };

    setHistory((prev) => {
      const updated = [historyItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  };

  const deleteHistoryItem = (timestamp: number) => {
    setHistory((prev) => prev.filter((item) => item.timestamp !== timestamp));
  };

  const handleExportPDF = () => {
    exportLoanToPDF(result, schedule, {
      principal,
      annualRate,
      years,
      frequency,
      extraPayment,
    });
  };

  const handleExportCSV = () => {
    exportLoanToCSV(schedule);
  };

  return {
    // Inputs
    principal,
    setPrincipal,
    annualRate,
    setAnnualRate,
    years,
    setYears,
    frequency,
    setFrequency,
    extraPayment,
    setExtraPayment,

    // Theme
    theme,
    toggleTheme,

    // Results
    result,
    schedule,
    calculateAmortization,

    // History
    history,
    deleteHistoryItem,

    // Totals
    totalPrincipalPaid,
    totalExtraPaid,
    totalInterestPaid,
    totalPaymentSum,
    scheduledNoExtraInterest,

    // Export
    handleExportPDF,
    handleExportCSV,
  };
}
