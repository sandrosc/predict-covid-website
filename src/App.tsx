import React, { useState, useEffect } from 'react';
import Visualizations from './Visualizations';
import transformData from './transformData';
import Configuration from './Configuration';
import './App.scss';
import './styles/react-toggle.scss';

const baseData = 'results_sd_20_80.csv'; // '00_full_results.csv';

export default function App() {
  const [config, setConfig] = useState({ socialDistancing: false, selfQuarantine: false });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const dataFile = baseData; // TODO get file

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
        <div className="headerContent">
          <h1>Covid Progress</h1>
          <p>
            <span>Covid-19</span> outbreak prediction in Switzerland
          </p>
        </div>
      </header>
      <div className="firstVisualization">
        <aside>
          <Configuration loading={loading} onConfigUpdate={setConfig} />
        </aside>
        <main>
          <Visualizations loading={loading} data={data} config={config} />
        </main>
      </div>
    </div>
  );
}
