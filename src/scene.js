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
    this.load.image('Tiles', 'sprites/Tiles.png');
    
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
    let tileset = this.map.addTilesetImage('Tiles');
    let layerCollision = this.map.createStaticLayer('Collision', tileset, 0, 0);
    let layerEvent = this.map.createStaticLayer('Event', tileset, 0, 0);
    let layerFloor = this.map.createStaticLayer('Floor', tileset, 0, 0);
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

    // fx
    this.moveSound = this.sound.add('move');
    
    // music
    this.music = this.sound.add('music', {loop: true});
    this.music.play();
    
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
    
    this.redPlayer = new Player(0, 2, 'Red');
    this.redPlayer.sprite = this.add.sprite(50, 250, 'enemy');;
    
    this.bluePlayer = new Player(0, 3, 'Blue');
    this.bluePlayer.sprite = this.add.sprite(50, 350, 'enemy');
    
    let scene = this;
    this.input.keyboard.on('keydown', function(e){
      scene.keyDown(e);
    });

    // sprite.animations.add('walk');
    // sprite.animations.play('walk', 50, true);
    // this.add.tween(sprite).to({ x: this.width }, 10000, Phaser.Easing.Linear.None, true);
  }
  tweenComplete(target){
    console.log('tween complete')
    listensToKeyboard = true;
    this.fall(target);
  }
  
  fall(target){
    console.log(target)
    this.attemptFall(this.redPlayer, 1);
    this.attemptFall(this.bluePlayer, -1);

  }

  move(target, xSpan, ySpan){
    this.moveSound.play();
    target.x += xSpan;
    target.y += ySpan;
    
    listensToKeyboard = false;
    
    this.tweens.add({
      targets: target.sprite,
      x: target.sprite.x + xSpan * 100,
      y: target.sprite.y + ySpan * 100,
      duration: 800,
      ease: "Power2",
      yoyo: false,
      loop: 0,
      onComplete: this.tweenComplete.bind(this)
    });
  }
  
  showCollision(target, xSpan, ySpan){
    this.tweens.add({
      targets: target.sprite,
      x: target.sprite.x + xSpan * 20,
      y: target.sprite.y + ySpan * 2,
      duration: 100,
      ease: "Power2",
      yoyo: true,
      loop: 0
    });
  }
  
  attemptClimb(target, xSpan, ySpan){
    let resultEvent = this.map.getTileAt(target.x, target.y, false, 'Event');
    if (resultEvent !== null){
     // special tile
     console.log('Event!', resultEvent.layer.name);
     console.log(resultEvent);
     // if ladder
     this.move(target, xSpan, ySpan);
   }
  }
  
  attemptFall(target, ySpan){
    let resultFloor = this.map.getTileAt(target.x, target.y, false, 'Floor');
    console.log('Floor:', resultFloor);
    if(resultFloor){
      console.log('fall: floor')
      return;
    }
    let resultCollision = this.map.getTileAt(target.x, target.y + ySpan, false, 'Collision');
    if(resultCollision){
      console.log('fall: collision')
      return;
    } else if ( (target.name == 'Red' && target.y >= 2) || (target.name == 'Blue' && target.y <= 3) ){
      console.log('too low')
    } else {
      this.move(target, 0, ySpan);
    }
  }
  
  attemptMove(target, xSpan, ySpan){
    let result = this.map.getTileAt(target.x + xSpan, target.y + ySpan, false, 'Collision');
    let resultEvent = this.map.getTileAt(target.x + xSpan, target.y + ySpan, false, 'Event');
    
    if (xSpan != 0){
      // horizontal movement
      if(result){
        // collision
        console.log('collision')
        this.showCollision(target, xSpan, ySpan);
        return;
      } else {
        this.move(target, xSpan, ySpan);
      }
    }else{
      // vertical movement
      if (ySpan < 0 && target.name == 'Red'){
        console.log('Red climbs')
        this.attemptClimb(target, xSpan, ySpan);
      } else if (ySpan > 0 && target.name == 'Blue'){
        console.log('Blue climbs')
        this.attemptClimb(target, xSpan, ySpan);
      } else {
        // fall -- just for debug
        if (target.name == 'Red' && target.y >= 2){
          console.log('too low')
          this.showCollision(target, xSpan, ySpan);
        } else if (target.name == 'Blue' && target.y <= 3){
          this.showCollision(target, xSpan, ySpan);
        } else {
          console.log('going down')
          this.move(target, xSpan, ySpan)
        }
      }
    }
    /*if (resultEvent !== null){
      // special tile
      console.log('Event!', resultEvent.layer.name);
      console.log(resultEvent);
      
    } else {
      // no tile
      console.log('no coll')
      // return result;
    }*/
  }
  
  keyDown(e, scene){
    if(!listensToKeyboard){
      return;
    }
    // console.log(this.redPlayer.x, this.redPlayer.y)
    if(e.key == 'ArrowRight'){
      // is next case free? If yes: go
      
      this.attemptMove(this.redPlayer, 1, 0);
      
      this.attemptMove(this.bluePlayer, 1, 0);
      
      
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
      
      this.attemptMove(this.redPlayer, -1, 0);
      this.attemptMove(this.bluePlayer, -1, 0);
    } else if(e.key == 'ArrowUp'){
      
      this.attemptMove(this.redPlayer, 0, -1);
      this.attemptMove(this.bluePlayer, 0, 1);
      
    } else if(e.key == 'ArrowDown'){
      this.attemptMove(this.redPlayer, 0, 1);
      this.attemptMove(this.bluePlayer, 0, -1);

      // this.nextLevel();
      // scene.load.script('main-scene', 'scene.js');
    }
  }
  
}