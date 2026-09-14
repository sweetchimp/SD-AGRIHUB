export const colors = {
  primary: "#10B981",
  accent: "#F59E0B",
  brown: "#92400E",
};

export const getStatusColor = (status) => {
  const map = {
    active: "text-green-600 bg-green-100",
    pending: "text-yellow-600 bg-yellow-100",
    completed: "text-blue-600 bg-blue-100",
  };
  return map[status] || map.pending;
};
