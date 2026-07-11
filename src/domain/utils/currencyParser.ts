export function parseBRCurrency(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;

  const cleaned = value
    .replace(/R\$\s?/gi, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? null : parsed;
}
