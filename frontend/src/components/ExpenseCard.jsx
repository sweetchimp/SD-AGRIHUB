export default function ExpenseCard({ category, amount, date }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex justify-between items-center">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white">{category}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
      </div>
      <p className="text-lg font-bold text-red-500">-{amount} UGX</p>
    </div>
  );
}
