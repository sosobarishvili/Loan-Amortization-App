import { saveAs } from "file-saver";
import { AmortizationEntry } from "../components/Types";

export function exportLoanToCSV(schedule: AmortizationEntry[]) {
  if (!schedule || schedule.length === 0) return;

  const headers = [
    "Period",
    "Principal",
    "Extra Payment",
    "Interest",
    "Total Payment",
    "Remaining Balance"
  ];

  const rows = schedule.map(row => [
    row.period,
    row.principal.toFixed(2),
    row.extraPayment.toFixed(2),
    row.interest.toFixed(2),
    row.totalPayment.toFixed(2),
    row.balance.toFixed(2),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "loan-amortization.csv");
}
