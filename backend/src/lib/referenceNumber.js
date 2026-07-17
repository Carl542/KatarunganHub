export function generateReferenceNumber(sequence, year = new Date().getFullYear()) {
  return `REF-${year}-${String(sequence).padStart(6, "0")}`;
}
