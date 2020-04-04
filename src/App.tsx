import React, { useState, useEffect } from 'react';
import Visualizations from './Visualizations';
import transformData from './transformData';
import Configuration from './Configuration';
import './App.scss';

const baseData = 'results_sd_20_80.csv'; // '00_full_results.csv';

export default function App() {
  const [dataFile, useDataFile] = useState(baseData);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    console.log(import(`!file-loader!../data/${dataFile}`));
    import(`!file-loader!../data/${dataFile}`).then(async ({ default: dataUrl }) => {
      const csvData = await fetch(dataUrl).then(response => response.text());
      setData(transformData(csvData) as any);
      setLoading(false);
    });
  }, [dataFile]);

  return (
    <div className="App">
      <header>
        <h1>Covid Progress</h1>
      </header>
      <aside>
        <Configuration loading={loading} onDataFileUpdate={useDataFile} />
      </aside>
      <main>
        <Visualizations loading={loading} data={data} />
      </main>
    </div>
  );
}
