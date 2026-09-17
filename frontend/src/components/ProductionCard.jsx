export default function ProductionCard({ title, quantity, unit, date }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md border-l-4 border-primary">
      <h3 className="text-gray-600 dark:text-gray-400 text-sm uppercase">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">{quantity}</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{unit}</p>
      <p className="text-gray-400 text-xs mt-3">{date}</p>
    </div>
  );
}
