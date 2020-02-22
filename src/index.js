import Phaser from "phaser";

import {Player} from "./player.js"

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  physics: {
    default: 'arcade'
  }
};

const game = new Phaser.Game(config);

let listensToKeyboard = true;
let currentLevel = 1;
const maxLevel = 2;

var redGuy, blackGuy;

function preload() {
  
  // Tiled level
  this.load.tilemapTiledJSON('lvl1', 'levels/level1.json');
  this.load.tilemapTiledJSON('lvl2', 'levels/level2.json');
  
  // Level tiles
  this.load.image('objetTiles-07', 'sprites/objetTiles-07.png');
  
  // character sprites
  this.load.spritesheet('enemy', 'sprites/spritesheet_caveman.png', { frameWidth: 32, frameHeight: 32 });
  
  // sound
  this.load.audio('move', [ 'sound/deplacement-electric.wav' ]);
  
  // this.load.audio('music', [ 'bass.ogg', 'bass.mp3' ]);
}


function loadLevel(scene){
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front");
}

function nextLevel(scene){
  currentLevel += 1;
  if(currentLevel <= maxLevel){
    scene.map.removeAllLayers(); // dirty
    scene.map = scene.make.tilemap({ key: `lvl${currentLevel}` });
    var tileset = scene.map.addTilesetImage('objetTiles-07');
    var layer = scene.map.createStaticLayer(0, tileset, 0, 0);
    layer.depth = -5;
  }
}

function create() {
  const redBackground = this.add.rectangle(400, 150, 800, 300, 0xcc0000);
  const greenBackground = this.add.rectangle(400, 450, 800, 300, 0x0000cc);
  redBackground.depth = -15;
  greenBackground.depth = -15;
  const cursors = this.input.keyboard.createCursorKeys();
  
  const bgGroup = this.add.group();
  // const mapGroup = this.add.group({defaultKey: 'mapGroup'})
  
  // var map = this.make.tilemap({ key: 'map' });
  // var tileset = map.addTilesetImage('Tiles_x1');
  // var layer = map.createDynamicLayer(0, tileset, 0, 0);
  this.map = this.make.tilemap({ key: 'lvl1' });
  var tileset = this.map.addTilesetImage('objetTiles-07');
  var layer = this.map.createDynamicLayer(0, tileset, 0, 0);
  console.log(this.map.getTileAt(1,1))
  
  layer.setCollisionByProperty({ collides: true });
  
  // mapGroup.add(map);
  // const music = this.sound.add('music');
  
  this.moveSound = this.sound.add('move');
  
  // temp
  for(let i = 1; i < 8; i++){
    const line = this.add.line(
              400,
              i*100,
              0,
              0,
              800,
              0,
              0x333333
          )
  }
  for(let i = 1; i < 8; i++){
    const line = this.add.line(
              i*100,
              300,
              0,
              0,
              0,
              600,
              0x333333
          )
  }
  
  redGuy = this.add.sprite(50, 250, 'enemy');
  let redPlayer = new Player(1, 1);
  
  blackGuy = this.add.sprite(50, 350, 'enemy');
  
  var scene = this;
  this.input.keyboard.on('keydown', function(e){
    keyDown(e, scene);
  });

  // sprite.animations.add('walk');
  // sprite.animations.play('walk', 50, true);
  // this.add.tween(sprite).to({ x: this.width }, 10000, Phaser.Easing.Linear.None, true);
}


function move(xSpan, ySpan, target, scene){
  scene.moveSound.play();
  listensToKeyboard = false;
  setTimeout(function(){
    listensToKeyboard = true;
  }, 800);
  
  scene.tweens.add({
    targets: target,
    x: xSpan,
    y: ySpan,
    duration: 800,
    ease: "Power2",
    yoyo: false,
    loop: 0
  });
}

function keyDown(e, scene){
  if(!listensToKeyboard){
    return;
  }
  if(e.key == 'ArrowRight'){
    // is next case free? If yes: go
    move(redGuy.x + 100, redGuy.y, redGuy, scene);
    move(blackGuy.x + 100, blackGuy.y, blackGuy, scene);
    
    // If no: stay in place
    // scene.tweens.add({
    //   targets: redGuy,
    //   x: redGuy.x + 20,
    //   duration: 100,
    //   ease: "Power2",
    //   yoyo: true,
    //   loop: 0
    // });
  } else if (e.key == 'ArrowLeft'){
    move(redGuy.x - 100, redGuy.y, redGuy, scene);
    move(blackGuy.x - 100, blackGuy.y, blackGuy, scene);
  } else if(e.key == 'ArrowUp'){
    move(redGuy.x, redGuy.y - 100, redGuy, scene);
    move(blackGuy.x, blackGuy.y + 100, blackGuy, scene);
  } else if(e.key == 'ArrowDown'){
    move(redGuy.x, redGuy.y + 100, redGuy, scene);
    move(blackGuy.x, blackGuy.y - 100, blackGuy, scene);
    
    nextLevel(scene);
    // scene.load.script('main-scene', 'scene.js');
  }
}