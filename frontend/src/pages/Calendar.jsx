import { useState, useEffect } from "react";
import api from "../utils/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Calendar() {
  const [productions, setProductions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, expRes, saleRes] = await Promise.all([
        api.get("/production"),
        api.get("/expenses"),
        api.get("/sales"),
      ]);
      setProductions(prodRes.data || []);
      setExpenses(expRes.data || []);
      setSales(saleRes.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const events = [];
    productions.forEach((p) => {
      if (p.date?.startsWith(dateStr)) {
        events.push({ type: "production", text: `Production: ${p.quantity} ${p.unit}`, color: "bg-green-500" });
      }
    });
    expenses.forEach((e) => {
      if (e.date?.startsWith(dateStr)) {
        events.push({ type: "expense", text: `Expense: ${e.category} — ${e.amount} UGX`, color: "bg-red-500" });
      }
    });
    sales.forEach((s) => {
      if (s.date?.startsWith(dateStr)) {
        events.push({ type: "sale", text: `Sale: ${s.product} — ${s.totalPrice} UGX`, color: "bg-accent" });
      }
    });
    return events;
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold font-brand text-primary mb-8">
              📅 Calendar
            </h1>

            {/* Calendar Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-8 border-l-4 border-accent">
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="px-2 sm:px-4 py-1 sm:py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-800 transition font-semibold">
                  ← Prev
                </button>
                <h2 className="text-2xl font-bold font-brand text-primary">
                  {MONTHS[month]} {year}
                </h2>
                <button onClick={nextMonth} className="px-2 sm:px-4 py-1 sm:py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-800 transition font-semibold">
                  Next →
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const events = getEventsForDay(day);
                  const isSelected = selectedDay === day;
                  const isToday =
                    day === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`relative p-2 rounded-lg text-sm font-semibold transition
                        ${isToday ? "ring-2 ring-accent bg-accent/10" : ""}
                        ${isSelected ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
                        ${events.length > 0 && !isSelected ? "bg-green-50 dark:bg-green-900/20" : ""}
                      `}
                    >
                      {day}
                      {events.length > 0 && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          {events.slice(0, 3).map((e, idx) => (
                            <span key={idx} className={`w-1.5 h-1.5 rounded-full ${e.color}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Events */}
            {selectedDay && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 border-l-4 border-primary">
                <h2 className="text-2xl font-bold font-brand text-primary mb-4">
                  Events — {MONTHS[month]} {selectedDay}, {year}
                </h2>
                {selectedEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEvents.map((event, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className={`w-3 h-3 rounded-full ${event.color}`} />
                        <span className="font-medium">{event.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No events on this day</p>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex gap-6 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span>Production</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span>Expense</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent" />
                <span>Sale</span>
              </div>
            </div>
      </div>
    </main>
  );
}
