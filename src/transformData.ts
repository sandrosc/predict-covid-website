import Papa from 'papaparse';

export default function transformData(csvData: string, addHeader = false): DataPoint[] {
  const csvText = addHeader
    ? `${headers.join(',')}
${csvData}`
    : csvData;
  const { data } = Papa.parse(csvText, {
    header: true,
    transformHeader: header => header || 'index',
    transform: v => +v,
    skipEmptyLines: true,
  });
  return data;
}

const headers = [
  'index',
  'Infected asymptomatic',
  'Infected symptomatic',
  'Critical Cases',
  'Deceased',
  'Susceptible',
  'Isolated',
  'Recovered',
];

export interface DataPoint {
  index: number;
  'Infected asymptomatic': number;
  'Infected symptomatic': number;
  'Critical Cases': number;
  Deceased: number;
  Susceptible: number;
  Isolated: number;
  Recovered: number;
}
