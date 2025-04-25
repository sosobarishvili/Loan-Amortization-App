// utils/pdfExport.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AmortizationEntry, AmortizationResult } from "../components/Types";


export function exportLoanToPDF(
  result: AmortizationResult | null,
  schedule: AmortizationEntry[],
  inputs: {
    principal: string;
    annualRate: string;
    years: string;
    frequency: string;
    extraPayment: string;
  }
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Loan Amortization Report", 14, 20);

  // Inputs Section
  doc.setFontSize(12);
  doc.text("Loan Details:", 14, 30);
  const inputLines = [
    `Principal: $${inputs.principal}`,
    `Annual Interest Rate: ${inputs.annualRate}%`,
    `Loan Term: ${inputs.years} years`,
    `Payment Frequency: ${inputs.frequency}`,
    `Extra Payment: $${inputs.extraPayment || "0.00"}`,
  ];
  inputLines.forEach((line, index) => doc.text(line, 14, 36 + index * 6));

  // Summary Section
  if (result) {
    doc.text("Summary:", 14, 70);
    doc.text(`Monthly Payment: $${result.payment}`, 14, 76);
    doc.text(`Total Payment: $${result.total}`, 14, 82);
  }

  // Table
  const tableRows = schedule.map((entry) => [
    entry.period,
    `$${entry.interest.toFixed(2)}`,
    `$${entry.principal.toFixed(2)}`,
    `$${entry.extraPayment.toFixed(2)}`,
    `$${entry.totalPayment.toFixed(2)}`,
    `$${entry.balance.toFixed(2)}`,
  ]);

  autoTable(doc, {
    head: [["#", "Interest", "Principal", "Extra", "Total", "Balance"]],
    body: tableRows,
    startY: 90,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save("loan-amortization.pdf");
}
