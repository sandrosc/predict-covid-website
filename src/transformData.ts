import Papa from 'papaparse';

export default function transformData(csvData: string): DataPoint[] {
  const csvText = `${headers.join(';')}
${csvData}`;
  const { data } = Papa.parse(csvText, {
    header: true,
    transformHeader: header => header || 'index',
    transform: v => +v,
  });
  return data;
}

const headers = [
  'index',
  'Infected asymptomatic',
  'Infected symptomatic',
  'Critical Cases',
  'Diseased',
  'Susceptible',
  'Isolated',
  'Recovered',
  'total infected',
  'accumulated cases',
];

interface DataPoint {
  index: number;
  'Infected asymptomatic': number;
  'Infected symptomatic': number;
  'Critical Cases': number;
  Diseased: number;
  Susceptible: number;
  Isolated: number;
  Recovered: number;
  'total infected': number;
  'accumulated cases': number;
}
