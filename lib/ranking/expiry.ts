/**
 * Check if a result is active (within 365 days of event date)
 * AC-CALC-002.3
 */
export function isResultActive(eventDate: Date): boolean {
  const expiryDate = new Date(eventDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  return new Date() < expiryDate;
}

export function getExpiryDate(eventDate: Date): Date {
  const expiry = new Date(eventDate);
  expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry;
}
