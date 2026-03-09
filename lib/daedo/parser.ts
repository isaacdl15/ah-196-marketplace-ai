/**
 * Brace-aware CSV parser for Daedo match export files.
 * AC-CSV-002.1 - AC-CSV-002.4
 */

export interface ParsedRow {
  daedoMatchNumber?: number;
  phaseName?: string;
  divisionName?: string;
  ageCategory?: string;
  gender?: string;
  blueAthleteRawName?: string;
  blueAthleteWtfId?: string;
  blueAthleteState?: string;
  redAthleteRawName?: string;
  redAthleteWtfId?: string;
  redAthleteState?: string;
  winner?: string;
  winMethod?: string;
  score?: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  errorRows: { rowNumber: number; reason: string }[];
  totalRows: number;
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let braceDepth = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
      continue;
    }
    if (char === '"' && inQuotes) {
      if (line[i + 1] === '"') {
        current += '"';
        i++;
        continue;
      }
      inQuotes = false;
      continue;
    }

    if (!inQuotes) {
      if (char === '{') braceDepth++;
      else if (char === '}') braceDepth--;

      if (char === ',' && braceDepth === 0) {
        fields.push(current.trim());
        current = '';
        continue;
      }
    }

    current += char;
  }
  fields.push(current.trim());
  return fields;
}

export function parseDaedoCsv(csvContent: string): ParseResult {
  const lines = csvContent.split('\n').filter(l => l.trim());
  if (lines.length < 2) {
    return { rows: [], errorRows: [{ rowNumber: 0, reason: 'Empty or invalid CSV' }], totalRows: 0 };
  }

  const headers = splitCsvLine(lines[0]).map((h, i) => ({ name: h.toLowerCase().trim(), index: i }));

  const getCol = (fields: string[], name: string): string | undefined => {
    const header = headers.find(h => h.name === name);
    return header ? fields[header.index] : undefined;
  };

  const rows: ParsedRow[] = [];
  const errorRows: { rowNumber: number; reason: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const fields = splitCsvLine(lines[i]);
      const row: ParsedRow = {
        daedoMatchNumber: parseInt(getCol(fields, 'match_number') || getCol(fields, 'matchnumber') || '') || undefined,
        phaseName: getCol(fields, 'phase') || getCol(fields, 'round') || getCol(fields, 'phase_name'),
        divisionName: getCol(fields, 'division') || getCol(fields, 'category') || getCol(fields, 'division_name'),
        ageCategory: getCol(fields, 'age_category') || getCol(fields, 'age_class') || getCol(fields, 'agecategory'),
        gender: getCol(fields, 'gender'),
        blueAthleteRawName: getCol(fields, 'blue_name') || getCol(fields, 'blue_athlete') || getCol(fields, 'bluename'),
        blueAthleteWtfId: getCol(fields, 'blue_wtf_id') || getCol(fields, 'blue_id'),
        blueAthleteState: getCol(fields, 'blue_state') || getCol(fields, 'blue_country'),
        redAthleteRawName: getCol(fields, 'red_name') || getCol(fields, 'red_athlete') || getCol(fields, 'redname'),
        redAthleteWtfId: getCol(fields, 'red_wtf_id') || getCol(fields, 'red_id'),
        redAthleteState: getCol(fields, 'red_state') || getCol(fields, 'red_country'),
        winner: getCol(fields, 'winner'),
        winMethod: getCol(fields, 'win_method') || getCol(fields, 'method'),
        score: getCol(fields, 'score'),
      };
      rows.push(row);
    } catch (err) {
      errorRows.push({ rowNumber: i + 1, reason: err instanceof Error ? err.message : 'Parse error' });
    }
  }

  return { rows, errorRows, totalRows: lines.length - 1 };
}
