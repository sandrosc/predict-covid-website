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
  data.forEach((dataPoint, index) => {
    dataPoint.index = index;
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

export interface DataPoint {
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
