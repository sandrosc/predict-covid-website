import React from 'react';

export default function Configuration({
  loading,
  onDataFileUpdate,
}: {
  loading: boolean;
  onDataFileUpdate: (dataUrl: string) => void;
}) {
  if (loading) return null;

  return (
    <div className="Configuration">
      <button>nice</button>
    </div>
  );
}
