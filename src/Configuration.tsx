import React from 'react';
import Toggle from 'react-toggle';
import './Configuration.scss';

export default function Configuration({
  loading,
  config,
  onConfigUpdate,
}: {
  loading: boolean;
  config: { socialDistancing: boolean; selfQuarantine: boolean };
  onConfigUpdate: (config: { socialDistancing: boolean; selfQuarantine: boolean }) => void;
}) {
  const { socialDistancing, selfQuarantine } = config;

  return (
    <div className="Configuration">
      <div>
        <Toggle
          disabled={loading}
          id="socialDistancing"
          checked={socialDistancing}
          onChange={() => onConfigUpdate({ ...config, socialDistancing: !socialDistancing })}
        />
        <label htmlFor="socialDistancing">Social Distancing</label>
      </div>
      <div>
        <Toggle
          disabled={loading}
          id="selfQuarantine"
          checked={selfQuarantine}
          onChange={() => onConfigUpdate({ ...config, selfQuarantine: !selfQuarantine })}
        />
        <label htmlFor="selfQuarantine">Self Quarantine</label>
      </div>
    </div>
  );
}
