import Phaser from "phaser";

import {LevelsScene} from "./scene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: LevelsScene,
  physics: {
    default: 'arcade'
  }
};

const game = new Phaser.Game(config);