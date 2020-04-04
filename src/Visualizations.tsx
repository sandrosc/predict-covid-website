import React from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area } from 'recharts';
import './Visualizations.scss';

const graphCategories = [
  { name: 'Infected asymptomatic', color: '#FFDC00' },
  { name: 'Infected symptomatic', color: '#FF851B' },
  { name: 'Critical Cases', color: '#FF4136' },
  { name: 'Diseased', color: '#111111' },
  { name: 'Susceptible', color: '#7FDBFF' },
  { name: 'Isolated', color: '#001f3f' },
  { name: 'Recovered', color: '#2ECC40' },
];

export default function Visualizations({ loading, data }: { loading: boolean; data: object[] }) {
  if (loading) return null;

  return (
    <div className="Visualizations">
      <ResponsiveContainer>
        <AreaChart maxBarSize={8000000} data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {graphCategories.map(category => (
              <linearGradient id={`color${category.name.replace(/ /g, '')}`} x1="0" y1="0" x2="0" y2="1">
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
    </div>
  );
}
