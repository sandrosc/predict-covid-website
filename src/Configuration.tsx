import React, { useState, useEffect, useRef } from 'react';
import Toggle from 'react-toggle';
import './Configuration.scss';

export default function Configuration({
  loading,
  onConfigUpdate,
}: {
  loading: boolean;
  onConfigUpdate: (config: { socialDistancing: boolean; selfQuarantine: boolean }) => void;
}) {
  const [socialDistancing, setSocialDistancing] = useState(false);
  const [selfQuarantine, setSelfQuarantine] = useState(false);

  const isInitial = useRef(true);
  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
    } else {
      console.log('configupdat');
      onConfigUpdate({
        socialDistancing,
        selfQuarantine,
      });
    }
  }, [socialDistancing, selfQuarantine, onConfigUpdate]);

  if (loading) return null;

  return (
    <div className="Configuration">
      <div>
        <Toggle id="socialDistancing" checked={socialDistancing} onChange={() => setSocialDistancing(s => !s)} />
        <label htmlFor="socialDistancing">Social Distancing</label>
      </div>
      <div>
        <Toggle id="selfQuarantine" checked={selfQuarantine} onChange={() => setSelfQuarantine(s => !s)} />
        <label htmlFor="selfQuarantine">Self Quarantine</label>
      </div>
    </div>
  );
}
