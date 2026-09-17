export default function ExpenseCard({ category, amount, date }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex justify-between items-center">
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{category}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
      </div>
      <p className="text-base sm:text-lg font-bold text-red-500 ml-3 whitespace-nowrap">-{amount} UGX</p>
    </div>
  );
}
