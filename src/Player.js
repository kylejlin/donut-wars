import React from 'react';
import './Player.css';

function Player(props) {
  return (
    <div className="Player">
      <img
        src="/assets/player.png"
        alt=""
        className="Player-img"
        style={{transform: `translate(-50%, -50%) rotate(${props.direction}deg)`}}
      />
    </div>
  );
}

export default Player;
