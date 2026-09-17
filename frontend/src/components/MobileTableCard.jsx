export default function MobileTableCard({ fields, actions }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fields.map((field, idx) => (
          <div key={idx} className={field.fullWidth ? "sm:col-span-2" : ""}>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {field.label}
            </span>
            <p className={`text-sm font-medium ${field.highlight ? "text-accent font-bold text-base" : "text-gray-900 dark:text-white"} ${field.className || ""}`}>
              {field.value || "-"}
            </p>
          </div>
        ))}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`min-h-[44px] px-4 py-2 text-sm font-semibold rounded-lg transition active:scale-95 ${action.className}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
