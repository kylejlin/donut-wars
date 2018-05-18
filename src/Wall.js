import React from 'react';
import './Wall.css';

function Wall(props) {
  return (
    <img
      src="/assets/wall.png"
      className="Wall"
      alt=""
      style={{ left: `${props.renderX}px`, bottom: `${props.renderY}px` }}
    />
  );
}

export default Wall;
