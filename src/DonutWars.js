import React, { Component } from 'react';
import Player from './Player';
//import Enemy from './Enemy';
import Wall from './Wall';
import DebugSquare from './DebugSquare';
import './DonutWars.css';

class DonutWars extends Component {
  constructor(props) {
    super(props);

    this.keyCodes = {
      move: [87, 73, 38], // w, i, up
      shoot: [83, 75, 40], // s, k, down
      prevWeapon: [65, 74, 37], // a, j, left
      nextWeapon: [68, 76, 39] // d, l, right
    }

    this.controlStates = {
      move: false,
      shoot: false,
      prevWeapon: false,
      nextWeapon: false
    };

    this.timeLastUpdated = Date.now();
    this.tickTime = 60;

    this.state = {
      player: {
        x: 0,
        y: 0,
        direction: 0,
        health: 100,
        speed: 10
      },

      walls: [{ x: 0, y: 200 }, { x: 100, y: 100 }],

      debug_ls: []
    };

    window.addEventListener('mousemove', ({ clientX, clientY }) => {
      this.pointPlayerTowardsMouse(clientX, clientY, window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', ({ keyCode }) => {
      this.setControlState(keyCode, true);
    });

    window.addEventListener('keyup', ({ keyCode }) => {
      this.setControlState(keyCode, false);
    });

    this.executeDueTicks = this.executeDueTicks.bind(this);
    window.requestAnimationFrame(this.executeDueTicks);
  }

  render() {
    return (
      <div
        className="DonutWars"
        style={{backgroundPosition: `right ${this.state.player.x}px top ${this.state.player.y}px`}}
      >
        <Player direction={this.state.player.direction} health={this.state.player.health}/>

        {
          this.state.walls.map((wall) => {
            const { x, y } = this.calculateRenderCoordinates(wall);
            return <Wall renderX={x} renderY={y} />
          })
        }
      </div>
    );
  }

  calculateRenderCoordinates({ x, y }) {
    return {
      x: (window.innerWidth / 2) + x - this.state.player.x,
      y: (window.innerHeight / 2) + y - this.state.player.y
    };
  }

  executeDueTicks() {
    let ticksDue = Math.floor((Date.now() - this.timeLastUpdated) / this.tickTime);

    while (ticksDue--) {
      this.tick();
      this.timeLastUpdated += this.tickTime;
    }

    window.requestAnimationFrame(this.executeDueTicks);
  }

  getCoordinatesAfterMovingOneStep() {
    const directionInRadians = this.state.player.direction * Math.PI / 180;

    const sin = Math.sin(directionInRadians);
    const cos = Math.cos(directionInRadians);
    let x = this.state.player.x + this.state.player.speed * sin;
    let y = this.state.player.y + this.state.player.speed * cos;

    while (this.wouldCoordinatesCollideWithWall(x, y, directionInRadians)) {
      x -= sin;
      y -= cos;
    }

    return { x, y };
  }

  pointPlayerTowardsMouse(mouseX, mouseY, windowWidth, windowHeight) {
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;
    const opp = mouseX - centerX;
    const adj = centerY - mouseY;
    const directionInRadians = Math.atan(opp / adj);
    let directionInDegrees = directionInRadians * 180 / Math.PI;

    if (mouseY > centerY) {
      directionInDegrees += 180;
    }

    this.setState(({ player }) => ({ player: {
      ...player,
      direction: directionInDegrees
    }}));
  }

  setControlState(keyCode, isKeyDown) {
    for (let i in this.keyCodes) {
      if (this.keyCodes[i].indexOf(keyCode) > -1) {
        this.controlStates[i] = isKeyDown;
      }
    }
  }

  tick() {
    const newState = { ...this.state };

    if (this.controlStates.move) {
      const { x, y } = this.getCoordinatesAfterMovingOneStep();
      newState.player.x = x;
      newState.player.y = y;
      newState.debug_ls = this.debugls_ || [];
    }

    this.setState(newState);
  }

  wouldCoordinatesCollideWithWall(x, y, directionInRadians) {
    const gunTipDistanceFromCenter = 75;
    const cos = Math.cos(directionInRadians);
    const sin = Math.sin(directionInRadians);

    const outerY = y + (cos * gunTipDistanceFromCenter);
    const outerX = x + (sin * gunTipDistanceFromCenter);

    const playerHitBox = {
      top: Math.max(y, outerY),
      right: Math.max(x, outerX),
      bottom: Math.min(y, outerY),
      left: Math.min(x, outerX)
    };

    return this.state.walls.some((wall) => {
      const wallHitBox = {
        top: wall.y + 100,
        right: wall.x + 100,
        bottom: wall.y,
        left: wall.x
      };

      if (
        (playerHitBox.top > wallHitBox.bottom) &&
        (playerHitBox.bottom < wallHitBox.top) &&
        (playerHitBox.right > wallHitBox.left) &&
        (playerHitBox.left < wallHitBox.right)
      ) {
        const csin = Math.sin((2 * Math.PI) - directionInRadians);
        const ccos = Math.cos((2 * Math.PI) - directionInRadians);
        // Alternative to pixel perfect: line segments
        const lineSegments = ([
          [
            [14/2, 111/2],
            [52/2, 41/2]
          ],
          [
            [-48/2, 41/2],
            [-3/2, 113/2]
          ],
          [
            [-2/2, 113/2],
            [-2/2, 193/2]
          ],
          [
            [16/2, 109/2],
            [16/2, 193/2]
          ]
        ]).map((lineSegment) => lineSegment.map(([eX, eY]) => {
          return [(eX * ccos) - (eY * csin), (eY * ccos) + (eX * csin)];
        }).map(([eX, eY]) => {
          return [x + eX, y + eY];
        }));

        const wallCorners = [
          [wall.x, wall.y],
          [wall.x, wall.y + 100],
          [wall.x + 100, wall.y + 100],
          [wall.x + 100, wall.y]
        ];

        return lineSegments.some(([[x1, y1], [x2, y2]]) => {
          const slope = (y2 - y1) / (x2 - x1);
          const yIntercept = y1 - (slope * x1);

          // n > 0: corner is above line, n == 0: corner on line, n < 0: corner below line
          const cornerRelations = wallCorners.map(([cx, cy]) => {
            return cy - ((cx * slope) + yIntercept);
          });

          const numberOfCornersAboveLine = cornerRelations.filter((n) => n > 0).length;

          if (numberOfCornersAboveLine === 0 || numberOfCornersAboveLine === 4) {
            return false;
          } else {
            const right = wall.x + 100;
            const left = wall.x;
            const top = wall.y + 100;
            const bottom = wall.y;
            return !(
              (x1 > right && x2 > right) ||
              (x1 < left && x2 < left) ||
              (y1 > top && y2 > top) ||
              (y1 < bottom && y2 < bottom)
            );
          }
        });
      } else {
        return false;
      }
    });
  }
}

export default DonutWars;
