export const DOCUMENT_TYPES = [
  "Complaint",
  "Summons",
  "Notice of hearing",
  "Mediation minutes",
  "Pangkat formation record",
  "Amicable settlement",
  "Arbitration agreement",
  "Arbitration award",
  "Certification to File Action",
  "Disposition record",
];

// Document types with a dedicated printable template in
// dashboard/cases/[id]/print/page.js — everything else falls back to the
// generic case-summary template.
export const PRINTABLE_TYPES = [
  "Summons",
  "Notice of hearing",
  "Amicable settlement",
  "Certification to File Action",
];
