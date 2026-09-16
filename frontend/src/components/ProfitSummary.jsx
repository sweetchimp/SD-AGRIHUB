export default function ProfitSummary({ totalProduction, totalExpenses, profit }) {
  const margin = totalProduction > 0 ? ((profit / totalProduction) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-lg p-4 sm:p-6 shadow-md">
        <p className="text-sm opacity-90">Total Production</p>
        <p className="text-xl sm:text-3xl font-bold mt-2">{totalProduction.toLocaleString()} UGX</p>
      </div>
      <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-lg p-4 sm:p-6 shadow-md">
        <p className="text-sm opacity-90">Total Expenses</p>
        <p className="text-xl sm:text-3xl font-bold mt-2">{totalExpenses.toLocaleString()} UGX</p>
      </div>
      <div className={`bg-gradient-to-br ${profit >= 0 ? "from-accent to-yellow-600" : "from-gray-400 to-gray-600"} text-white rounded-lg p-4 sm:p-6 shadow-md`}>
        <p className="text-sm opacity-90">Net Profit</p>
        <p className="text-xl sm:text-3xl font-bold mt-2">{profit.toLocaleString()} UGX</p>
        <p className="text-xs mt-2">{margin}% margin</p>
      </div>
    </div>
  );
}
