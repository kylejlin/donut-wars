import React from 'react';
import './DebugSquare.css';

function DebugSquare(props) {
  return (
    <div
      className="DebugSquare"
      style={{
        left: `${props.renderX}px`,
        bottom: `${props.renderY}px`,
        backgroundColor: props.color,
        width: '4px',
        height: '4px'
      }}
    />
  );
}

export default DebugSquare;
