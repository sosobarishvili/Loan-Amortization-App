import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLoanCalculatorContainer } from "./Container";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Switch } from "@headlessui/react";
import { MdDarkMode, MdLightMode } from "react-icons/md";


function LoanCalculator() {
  const {
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
    result,
    schedule,
    calculateAmortization,
    theme,
    toggleTheme,
    history,
    deleteHistoryItem,
    totalPrincipalPaid,
    totalExtraPaid,
    totalInterestPaid,
    totalPaymentSum,
    scheduledNoExtraInterest,
    handleExportPDF,
    handleExportCSV,
  } = useLoanCalculatorContainer();

  // Local UI‑only state
  const [errors, setErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Mobile‑swipe handlers for the amortization table
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {/* noop – just enable horizontal scroll on iOS */ },
    onSwipedRight: () => {/* noop */ },
  });

  // ────────────────────────────────────────────────────────────
  // Validation helper
  // ────────────────────────────────────────────────────────────
  const validateInputs = (): boolean => {
    const msgs: string[] = [];
    if (!principal || isNaN(Number(principal)) || Number(principal) <= 0) {
      msgs.push("Please enter a valid principal amount (number > 0)");
    }
    if (!annualRate || isNaN(Number(annualRate)) || Number(annualRate) <= 0) {
      msgs.push("Please enter a valid annual interest rate (number > 0)");
    }
    if (!years || isNaN(Number(years)) || Number(years) <= 0) {
      msgs.push("Please enter a valid term in years (number > 0)");
    }
    if (extraPayment && (isNaN(Number(extraPayment)) || Number(extraPayment) < 0)) {
      msgs.push("Extra payment must be a non‑negative number");
    }
    setErrors(msgs);
    return msgs.length === 0;
  };

  // ────────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────────
  const handleCalculate = async () => {
    if (!validateInputs()) return;
    try {
      setIsCalculating(true);
      // If calculateAmortization is async it will await; if not, await Promise.resolve()
      await Promise.resolve(calculateAmortization());
    } finally {
      setIsCalculating(false);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Spinner component
  // ────────────────────────────────────────────────────────────
  const Spinner = () => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="animate-spin w-5 h-5 mx-auto"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeDasharray="31.4 31.4"
      />
    </svg>
  );

  // ────────────────────────────────────────────────────────────
  // JSX
  // ────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
    >
      {/* ───── Header ───── */}
      <header
        className="sticky top-0 z-10 shadow-md px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0"
        style={{ backgroundColor: "var(--card-bg)", borderBottom: "1px solid var(--border-color)" }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          📊  Loan Calculator
        </h1>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center sm:items-center">
          <button
            aria-label="Export amortization schedule as PDF"
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white cursor-pointer transition"
          >
            {/* icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 512 512">
              <path d="M480 64H32C14.3 64 0 78.3 0 96v320c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zM320 352H96V160h224v192z" />
            </svg>
            EXPORT PDF
          </button>

          <button
            aria-label="Export amortization schedule as CSV"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-green-500 text-green-500 hover:bg-green-600 hover:text-white cursor-pointer transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 512 512">
              <path d="M480 64H32C14.3 64 0 78.3 0 96v320c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32V96c0-17.7 14.3‑32‑32‑32zM320 352H96V160h224v192z" />
            </svg>
            EXPORT CSV
          </button>
        </div>

        <Switch
          checked={theme === "dark"}
          onChange={toggleTheme}
          className={`${theme === "dark" ? "bg-gray-800" : "bg-yellow-400"} relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <span className="sr-only">Toggle dark mode</span>
          <span
            aria-hidden="true"
            className={`${theme === "dark" ? "translate-x-10" : "translate-x-1"}
              pointer-events-none  h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center`}
          >
            {theme === "dark" ? <MdDarkMode className="text-black" /> : <MdLightMode className="text-yellow-500" />}
          </span>
        </Switch>
      </header>

      {/* ───── Main ───── */}
      <main className="max-w-4xl mx-auto p-6 space-y-10">
        {/* ───── Loan Details ───── */}
        <section
          className="shadow-xl flex flex-col items-center justify-center rounded-2xl p-6 sm:p-10 md:p-14 space-y-6 w-full max-w-5xl mx-auto"
          style={{ background: "var(--loan-details)", borderColor: "var(--border-color)" }}
        >
          <h2 className="text-xl md:text-2xl font-semibold text-center">Loan Details</h2>

          {/* Inputs row 1 */}
          <div className="flex flex-col md:flex-row gap-5 justify-center items-center w-full">
            <input
              aria-label="Principal amount"
              type="text"
              inputMode="decimal"
              placeholder="💰 Principal Amount"
              className="w-full px-5 py-3 rounded-xl border focus:outline-gray-500"
              style={{ color: "var(--text-color)", borderColor: "var(--border-color)", fontFamily: "inherit" }}
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />

            <input
              aria-label="Annual interest rate"
              type="text"
              inputMode="decimal"
              placeholder="📈 Annual Interest Rate (%)"
              className="w-full px-5 py-3 rounded-xl border focus:outline-gray-500"
              style={{ color: "var(--text-color)", borderColor: "var(--border-color)", fontFamily: "inherit" }}
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
            />
          </div>

          {/* Inputs row 2 */}
          <div className="flex flex-col md:flex-row gap-5 justify-center items-center w-full">
            <input
              aria-label="Loan term in years"
              type="text"
              inputMode="numeric"
              placeholder="⏳ Loan Term (Years)"
              className="w-full px-5 py-3 rounded-xl border focus:outline-gray-500"
              style={{ color: "var(--text-color)", borderColor: "var(--border-color)", fontFamily: "inherit" }}
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />

            <input
              aria-label="Extra recurring payment"
              type="text"
              inputMode="decimal"
              placeholder="💵 Extra Recurring Payment (Optional)"
              className="w-full px-5 py-3 rounded-xl border focus:outline-gray-500"
              style={{ color: "var(--text-color)", borderColor: "var(--border-color)", fontFamily: "inherit" }}
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
            />
          </div>

          {/* Frequency selector */}
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full">
            <button
              aria-label="Set payment frequency to monthly"
              className={`py-3 px-4 rounded-xl border font-medium transition w-full sm:w-[150px] cursor-pointer ${frequency === "monthly" ? "border-blue-500 text-white bg-blue-500" : ""
                }`}
              onClick={() => setFrequency("monthly")}
            >
              Monthly
            </button>
            <button
              aria-label="Set payment frequency to yearly"
              className={`py-3 px-4 rounded-xl border font-medium transition w-full sm:w-[150px] cursor-pointer ${frequency === "yearly" ? "border-blue-500 text-white bg-blue-500" : ""
                }`}
              onClick={() => setFrequency("yearly")}
            >
              Yearly
            </button>
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <ul className="text-red-500 text-sm list-disc list-inside w-full max-w-xl">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          {/* Calculate button */}
          <button
            aria-label="Calculate loan details"
            disabled={isCalculating}
            className="w-full sm:w-1/2 bg-[#34A853] text-white py-3 mt-2 rounded-xl text-lg md:text-xl font-bold hover:bg-green-700 transition border border-green-800 cursor-pointer uppercase disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleCalculate}
          >
            {isCalculating ? <Spinner /> : "Calculate loan details"}
          </button>
        </section>


        {/* ───── Summary ───── */}
        <section className="shadow-xl rounded-2xl px-4 py-5 sm:p-6" style={{ backgroundColor: "var(--card-bg)" }}>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center sm:text-left uppercase">Summary</h2>

          {result ? (
            <div className="grid sm:grid-cols-3 gap-4 text-sm sm:text-base">
              {/* Interest saved */}
              <div
                className="flex flex-col gap-2 py-4 px-4 rounded-xl text-white"
                style={{
                  background: "var(--summary-saved-bg)",
                  border: "1px solid #2B7EFE",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                }}
              >
                <span className="text-3xl">🎯</span>
                <strong className="text-2xl">
                  ${Math.max(0, scheduledNoExtraInterest - totalInterestPaid).toFixed(2)}
                </strong>
                <span>Interest Saved (vs no extra)</span>
              </div>

              {/* Scheduled payment */}
              <div
                className="flex flex-col gap-2 py-4 px-4 rounded-xl text-white"
                style={{
                  background: "var(--summary-payment-bg)",
                  border: "1px solid #934AE2",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                }}
              >
                <span className="text-3xl">💵</span>
                <strong className="text-2xl">${result.payment}</strong>
                <span>Scheduled Payment per {frequency === "monthly" ? "Month" : "Year"}</span>
              </div>

              {/* Total repayment */}
              <div
                className="flex flex-col gap-2 py-4 px-4 rounded-xl text-white"
                style={{
                  background: "var(--summary-repayment-bg)",
                  border: "1px solid #34A853",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                }}
              >
                <span className="text-3xl">📊</span>
                <strong className="text-2xl">${result.total}</strong>
                <span>Total Scheduled Repayment</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center sm:text-left">(Summary will appear after calculation)</p>
          )}
        </section>

        {/* ───── Chart ───── */}
        <section className="shadow-xl rounded-2xl p-6 uppercase" style={{ background: "var(--loan-details)" }}>
          <h2 className="text-xl font-semibold mb-2">Interest vs Principal 📈</h2>
          {schedule.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={schedule} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="interest" stroke="#8884d8" name="Interest" />
                <Line type="monotone" dataKey="principal" stroke="#82ca9d" name="Principal" />
                <Line type="monotone" dataKey="extraPayment" stroke="#ff7300" name="Extra Payment" />
                <Line type="monotone" dataKey="totalPayment" stroke="#387908" name="Total Payment" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500 py-10">
              <span className="text-4xl">📉</span>
              <p className="text-sm">Run a calculation to visualize interest vs principal over time</p>
            </div>
          )}
        </section>

        {/* ───── Table ───── */}
        <section
          className="shadow-xl rounded-2xl p-6 overflow-x-auto uppercase"
          style={{ backgroundColor: "var(--card-bg)" }}
          {...swipeHandlers}
        >
          <h2 className="text-xl font-semibold mb-2">Amortization Table 📅</h2>
          {schedule.length > 0 ? (
            <table className="min-w-full text-sm text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2">#</th>
                  <th className="border-b p-2">Principal</th>
                  <th className="border-b p-2">Extra Payment</th>
                  <th className="border-b p-2">Interest</th>
                  <th className="border-b p-2">Total Payment</th>
                  <th className="border-b p-2">Remaining Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid var(--table-br)" }}>
                    <td className="p-2">{row.period}</td>
                    <td className="p-2">${row.principal.toFixed(2)}</td>
                    <td className="p-2">${row.extraPayment.toFixed(2)}</td>
                    <td className="p-2">${row.interest.toFixed(2)}</td>
                    <td className="p-2">${row.totalPayment.toFixed(2)}</td>
                    <td className="p-2">${row.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="p-2 font-bold">Totals</td>
                  <td className="p-2 font-bold">${totalPrincipalPaid.toFixed(2)}</td>
                  <td className="p-2 font-bold">${totalExtraPaid.toFixed(2)}</td>
                  <td className="p-2 font-bold">${totalInterestPaid.toFixed(2)}</td>
                  <td className="p-2 font-bold">${totalPaymentSum.toFixed(2)}</td>
                  <td className="p-2" />
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500 py-10">
              <span className="text-4xl">👆</span>
              <p className="text-sm text-center max-w-xs">
                The amortization table will be swipeable on mobile devices. Calculate to populate the data.
              </p>
            </div>
          )}
        </section>

        {/* ───── History ───── */}
        <section className="shadow-xl rounded-2xl p-4 sm:p-6" style={{ backgroundColor: "var(--card-bg)" }}>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 uppercase">Calculation History 🧠</h2>
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-[700px] text-sm text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b p-2 whitespace-nowrap">Date</th>
                    <th className="border-b p-2 whitespace-nowrap">Principal</th>
                    <th className="border-b p-2 whitespace-nowrap">Interest Rate</th>
                    <th className="border-b p-2 whitespace-nowrap">Years</th>
                    <th className="border-b p-2 whitespace-nowrap">Frequency</th>
                    <th className="border-b p-2 whitespace-nowrap">Extra Payment</th>
                    <th className="border-b p-2 whitespace-nowrap">Payment</th>
                    <th className="border-b p-2 whitespace-nowrap">Total Repayment</th>
                    <th className="border-b p-2 whitespace-nowrap text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.timestamp}>
                      <td className="p-2">{new Date(item.timestamp).toLocaleDateString()}</td>
                      <td className="p-2">${Number(item.principal).toFixed(2)}</td>
                      <td className="p-2">{item.annualRate}%</td>
                      <td className="p-2">{item.years}</td>
                      <td className="p-2">{item.frequency}</td>
                      <td className="p-2">{item.extraPayment ? `$${Number(item.extraPayment).toFixed(2)}` : "-"}</td>
                      <td className="p-2">${item.result.payment}</td>
                      <td className="p-2">${item.result.total}</td>
                      <td className="p-2 text-center">
                        <button
                          aria-label="Delete history entry"
                          onClick={() => deleteHistoryItem(item.timestamp)}
                          className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">(No calculations yet. Perform a calculation to see history.)</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default LoanCalculator;
