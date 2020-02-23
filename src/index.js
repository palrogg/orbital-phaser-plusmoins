import Phaser from "phaser";

import {IntroScene} from "./introScene.js";
import {LevelsScene} from "./scene.js";


const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  // scene: LevelsScene,
  scene: [IntroScene, LevelsScene],
  physics: {
    default: 'arcade'
  }
};

const game = new Phaser.Game(config);