import React, { useState, useEffect } from 'react';
import Visualizations from './Visualizations';
import transformData from './transformData';
import Configuration from './Configuration';
import ReactMarkdown from 'react-markdown';
/* eslint import/no-webpack-loader-syntax: off */
import howto from '!raw-loader!./howto.md';
import './App.scss';
import './styles/react-toggle.scss';

const baseData = 'results_base.csv';

function getDataFile({
  socialDistancing,
  selfQuarantine,
  start,
  end,
}: {
  socialDistancing: boolean;
  selfQuarantine: boolean;
  start: number;
  end: number;
}) {
  if (!socialDistancing && !selfQuarantine) {
    return baseData;
  }
  const filterKey = socialDistancing ? (selfQuarantine ? 'sqd' : 'sd') : 'sq';
  return `results_${filterKey}_${start + 90}_${end + 90}.csv`;
}

export default function App() {
  const [config, setConfig] = useState({ socialDistancing: false, selfQuarantine: false });
  const [precautionDates, setPrecautionDates] = useState({ start: 0, end: 10 });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const dataFile = getDataFile({ ...config, ...precautionDates });

  useEffect(() => {
    setLoading(true);
    import(`!raw-loader!../data/${dataFile}`)
      .then(({ default: csvData }) => {
        setData(transformData(csvData, true) as any);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setConfig({ socialDistancing: false, selfQuarantine: false });
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
          <Configuration loading={loading} config={config} onConfigUpdate={setConfig} />
        </aside>
        <main>
          <Visualizations
            loading={loading}
            data={data}
            config={config}
            precautionDates={precautionDates}
            onUpdatePrecautionDates={setPrecautionDates}
          />
        </main>
      </div>
      <div className="howto">
        <ReactMarkdown source={howto} />
      </div>
    </div>
  );
}
