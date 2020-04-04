import React from 'react';

export default function Visualizations({
  loading,
  data,
}: {
  loading: boolean;
  data: object;
}) {
  if (loading) return null;

  return <div className="Visualizations">{JSON.stringify(data)}</div>;
}
