export function calculateAttendance(attended, total) {
  return ((attended / total) * 100).toFixed(2);
}

export function getRiskStatus(percentage) {
  if (percentage >= 75) return "SAFE";
  if (percentage >= 65) return "WARNING";
  return "CRITICAL";
}

export function classesNeeded(attended, total, required = 75) {
  let needed = 0;
  while (((attended + needed) / (total + needed)) * 100 < required) {
    needed++;
  }
  return needed;
}

export function aiSuggestion(status, needed) {
  if (status === "SAFE") return "You are safe. Keep attending regularly.";
  if (status === "WARNING")
    return `Attend next ${needed} classes continuously to recover.`;
  return "Immediate action required. Contact your advisor.";
}
