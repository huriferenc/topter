'use strict';

import Stats from 'stats';

// FPS display
let stats;

// Adding FPS display into DOM
function addStatsObject() {
  stats = new Stats();
  stats.setMode(0);

  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '10px';
  stats.domElement.style.top = '125px';
  return document.body.appendChild(stats.domElement);
}

export { stats, addStatsObject };
