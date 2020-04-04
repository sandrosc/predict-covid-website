import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Brush as OriginalBrush,
} from 'recharts';
import CustomBrush from './components/Brush';
import classNames from 'classnames';
import './Visualizations.scss';
const Brush = CustomBrush as typeof OriginalBrush;

const graphCategories = [
  { name: 'Infected asymptomatic', color: '#FFDC00' },
  { name: 'Infected symptomatic', color: '#FF851B' },
  { name: 'Critical Cases', color: '#FF4136' },
  { name: 'Diseased', color: '#111111' },
  { name: 'Susceptible', color: '#7FDBFF' },
  { name: 'Isolated', color: '#001f3f' },
  { name: 'Recovered', color: '#2ECC40' },
];

export default function Visualizations({
  loading,
  data,
  config,
}: {
  loading: boolean;
  data: object[];
  config: { socialDistancing: boolean; selfQuarantine: boolean };
}) {
  const [precautionDates, setPrecationDates] = useState({ startIndex: 0, endIndex: 20 });
  if (loading) return null;

  return (
    <div className="Visualizations">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {graphCategories.map(category => (
              <linearGradient
                key={category.name}
                id={`color${category.name.replace(/ /g, '')}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={category.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={category.color} stopOpacity={0.5} />
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="index" interval={19} />
          <YAxis type="number" domain={[0, dataMax => Math.round(dataMax)]} width={75} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          {graphCategories.map(category => (
            <Area
              key={category.name}
              type="monotone"
              dataKey={category.name}
              stackId="1"
              fillOpacity={1}
              stroke={category.color}
              fill={`url(#color${category.name.replace(/ /g, '')})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 75, bottom: 0 }}>
          <Brush
            startIndex={precautionDates.startIndex}
            endIndex={precautionDates.endIndex}
            className={classNames({ disabled: !config.socialDistancing && !config.selfQuarantine })}
            onChange={setPrecationDates}
            gap={10}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
