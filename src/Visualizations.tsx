import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Brush as OriginalBrush,
  ReferenceLine,
  Label,
  Text,
  Legend,
  ReferenceArea,
} from 'recharts';
import CustomBrush from './components/Brush';
import classNames from 'classnames';
import './Visualizations.scss';
import { DataPoint } from './transformData';

const Brush = CustomBrush as typeof OriginalBrush;

const graphCategories = [
  { name: 'Infected asymptomatic', color: '#FFDC00' },
  { name: 'Infected symptomatic', color: '#FF851B' },
  { name: 'Critical Cases', color: '#FF4136' },
  { name: 'Deceased', color: '#000000' },
  { name: 'Susceptible', color: '#7FDBFF' },
  {/* name: 'Isolated', color: '#0074D9' */},
  { name: 'Recovered', color: '#2ECC40' },
];

export default function Visualizations({
  loading,
  data,
  config,
  precautionDates,
  onUpdatePrecautionDates,
}: {
  loading: boolean;
  data: DataPoint[];
  config: { socialDistancing: boolean; selfQuarantine: boolean };
  precautionDates: { start: number; end: number };
  onUpdatePrecautionDates: ({ start, end }: { start: number; end: number }) => void;
}) {
  if (loading || !data) return <div />;

  const totalInfected = data.map(d => d['total infected']);
  const peakX = totalInfected.indexOf(Math.max(...totalInfected));

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
            <pattern
              id="diagonalHatch"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="6" style={{ stroke: '#2ECC40', strokeWidth: 2 }} />
            </pattern>
          </defs>
          <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} iconType="circle" />
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
          {(config.socialDistancing || config.selfQuarantine) && (
            <ReferenceArea
              x1={precautionDates.start}
              x2={precautionDates.end}
              fill={'url(#diagonalHatch)'}
              fillOpacity={1}
            />
          )}
          <ReferenceLine
            isFront
            x={peakX}
            stroke="#444"
            label={({ viewBox }) => {
              return (
                <Label
                  viewBox={{ ...viewBox, y: 15, height: 140 }}
                  position="right"
                  angle={90}
                  offset={15}
                >{`First peak (day ${peakX})`}</Label>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 75, bottom: 0 }}>
          <Brush
            startIndex={precautionDates.start}
            endIndex={precautionDates.end}
            className={classNames({ disabled: !config.socialDistancing && !config.selfQuarantine })}
            onChange={({ startIndex, endIndex }) => {
              onUpdatePrecautionDates({ start: startIndex, end: endIndex });
            }}
            gap={5}
          />
          <Text>Nice</Text>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
