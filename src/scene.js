import Phaser from "phaser";
import {Player} from "./player.js";

let listensToKeyboard = true;
let currentLevel = 1;
const maxLevel = 2;


export class LevelsScene extends Phaser.Scene {
  
  preload() {
    
    // Tiled level
    this.load.tilemapTiledJSON('lvl1', 'levels/level1.json');
    this.load.tilemapTiledJSON('lvl2', 'levels/level2.json');
    
    // Level tiles
    this.load.image('objetTiles-07', 'sprites/objetTiles-07.png');
    
    // character sprites
    this.load.spritesheet('enemy', 'sprites/spritesheet_caveman.png', { frameWidth: 32, frameHeight: 32 });
    
    // sound
    this.load.audio('music', [ 'sound/game_jam_v1.mp3' ]);
    this.load.audio('move', [ 'sound/deplacement.wav' ]);
  }


  loadLevel(){
    // const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
    // player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front");
    this.map = this.make.tilemap({ key: `lvl${currentLevel}` });
    let tileset = this.map.addTilesetImage('objetTiles-07');
    let layerCollision = this.map.createStaticLayer(0, tileset, 0, 0);
    let layerEvent = this.map.createStaticLayer(1, tileset, 0, 0);
    layerCollision.depth = -10;
    layerEvent.depth = -5;
  }

  nextLevel(){
    currentLevel += 1;
    if(currentLevel <= maxLevel){
      this.map.removeAllLayers(); // dirty
      
      this.loadLevel();
    }
  }

  create() {
    const redBackground = this.add.rectangle(400, 150, 800, 300, 0xcc0000);
    const greenBackground = this.add.rectangle(400, 450, 800, 300, 0x0000cc);
    redBackground.depth = -15;
    greenBackground.depth = -15;
    
    const cursors = this.input.keyboard.createCursorKeys();
    
    this.loadLevel()

    // const music = this.sound.add('music');
    
    this.moveSound = this.sound.add('move');
    this.music = this.sound.add('music');
    // this.music.play();
    
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
    
    this.redPlayer = new Player(0, 2);
    this.redPlayer.sprite = this.add.sprite(50, 250, 'enemy');;
    
    this.blackPlayer = new Player(0, 3);
    this.blackPlayer.sprite = this.add.sprite(50, 350, 'enemy');
    
    let scene = this;
    this.input.keyboard.on('keydown', function(e){
      scene.keyDown(e);
    });

    // sprite.animations.add('walk');
    // sprite.animations.play('walk', 50, true);
    // this.add.tween(sprite).to({ x: this.width }, 10000, Phaser.Easing.Linear.None, true);
  }


  move(xSpan, ySpan, target, scene){
    this.moveSound.play();
    target.x += xSpan;
    target.y += ySpan;
    
    listensToKeyboard = false;
    setTimeout(function(){
      listensToKeyboard = true;
    }, 800);
    
    this.tweens.add({
      targets: target.sprite,
      x: target.sprite.x + xSpan * 100,
      y: target.sprite.y + ySpan * 100,
      duration: 800,
      ease: "Power2",
      yoyo: false,
      loop: 0
    });
  }
  
  checkCollides(target, xSpan, ySpan){
    let result = this.map.getTileAt(target.x + xSpan, target.y + ySpan);
    if(result === null){
      // no tile
      console.log('no coll')
      return false;
    } else {
      console.log(result.layer.name);
      console.log(result);
      return result;
    }
  }
  
  keyDown(e, scene){
    if(!listensToKeyboard){
      return;
    }
    console.log(this.redPlayer.x, this.redPlayer.y)
    if(e.key == 'ArrowRight'){
      // is next case free? If yes: go
      
      this.checkCollides(this.redPlayer, 1, 0);
      
      this.move(1, 0, this.redPlayer, scene);
      this.move(1, 0, this.blackPlayer, scene);
      
      // If no: stay in place
      // scene.tweens.add({
      //   targets: this.redPlayer,
      //   x: this.redPlayer.sprite.x + 20,
      //   duration: 100,
      //   ease: "Power2",
      //   yoyo: true,
      //   loop: 0
      // });
    } else if (e.key == 'ArrowLeft'){
      
      this.checkCollides(this.redPlayer, -1, 0);

      this.move(-1, 0, this.redPlayer, scene);
      this.move(-1, 0, this.blackPlayer, scene);
    } else if(e.key == 'ArrowUp'){
      
      this.checkCollides(this.redPlayer, 0, -1);
      
      this.move(0, -1, this.redPlayer, scene);
      this.move(0, 1, this.blackPlayer, scene);
    } else if(e.key == 'ArrowDown'){
      this.checkCollides(this.redPlayer, 0, 1);

      
      this.move(0, 1, this.redPlayer, scene);
      this.move(0, -1, this.blackPlayer, scene);
      
      
      console.log( this.map.getTileAt(2, 1) );
      // this.nextLevel();
      // scene.load.script('main-scene', 'scene.js');
    }
  }
  
}