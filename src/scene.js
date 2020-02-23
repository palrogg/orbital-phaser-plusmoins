import Phaser from "phaser";
import {Player} from "./player.js";

let listensToKeyboard = true;
let currentLevel = 1;
const maxLevel = 3;
const tilesWidth = 8;

export class LevelsScene extends Phaser.Scene {
  constructor(){
    super({ key: 'LevelsScene' })
  }
  
  preload() {
    
    // Tiled level
    this.load.tilemapTiledJSON('lvl1', 'levels/level1.json');
    this.load.tilemapTiledJSON('lvl2', 'levels/level2.json');
    this.load.tilemapTiledJSON('lvl3', 'levels/level3.json');
    // this.load.tilemapTiledJSON('lvl3', 'levels/level3.json');
    
    // Level tiles
    this.load.image('Tiles', 'sprites/Tiles.png');
    
    // character sprites
    this.load.spritesheet('anime-red', 'sprites/animeRed.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('anime-blue', 'sprites/animeBlue.png', { frameWidth: 100, frameHeight: 100 });
    
    // trapped anim
    this.load.spritesheet('trap-red', 'sprites/chocRed.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('trap-blue', 'sprites/chocBlue.png', { frameWidth: 100, frameHeight: 100 });
    
    // not plugged death anim
    this.load.spritesheet('notPlugged-red', 'sprites/mortRed.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('notPlugged-blue', 'sprites/mortBlue.png', { frameWidth: 100, frameHeight: 100 });
    
    this.load.image('red', 'sprites/red.png');
    this.load.image('blue', 'sprites/blue.png');
    this.load.image('background', 'sprites/background.png');
    
    // sound
    this.load.audio('music', [ 'sound/game_jam_v1.mp3' ]);
    this.load.audio('move', [ 'sound/deplacement.wav' ]);
    this.load.audio('up', [ 'sound/up.wav' ]);
    
    this.tweenTimeout = null;
    this.eventTimeout = null;
  }

  loadLevel(){
    this.map = this.make.tilemap({ key: `lvl${currentLevel}` });
    let tileset = this.map.addTilesetImage('Tiles');
    let layerCollision = this.map.createStaticLayer('Collision', tileset, 0, 0);
    this.layerEvent = this.map.createDynamicLayer('Event', tileset, 0, 0);
    let layerFloor = this.map.createStaticLayer('Floor', tileset, 0, 0);
    

    layerCollision.depth = -10;
    this.layerEvent.depth = -5;
    
    // for objects:
    // const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
  }

  nextLevel(){
    currentLevel += 1;
    if(currentLevel <= maxLevel){
      this.map.removeAllLayers(); // dirty
      
      this.loadLevel();
      this.redPlayer.reset(0, 2);
      this.bluePlayer.reset(0, 3);
    }
  }

  create() {
    this.scene.remove('TitleScene');

    const background = this.add.sprite(400, 300, 'background');
    background.alpha = 0.5;
    background.depth = -15;
        
    this.loadLevel()

    // Sound FX
    this.moveSound = this.sound.add('move');
    this.upSound = this.sound.add('up');
    
    // Music
    this.music = this.sound.add('music', {loop: true});
    this.music.play();
    
    // Add characters
    this.redPlayer = new Player(0, 2, 'Red');
    this.redPlayer.sprite = this.add.sprite(50, 250, 'red');;
    
    this.bluePlayer = new Player(0, 3, 'Blue');
    this.bluePlayer.sprite = this.add.sprite(50, 350, 'blue');
    
    // Listen to events
    let scene = this;
    this.input.keyboard.on('keydown', function(e){
      scene.keyDown(e);
    });
  }
  
  trapEvent(target){
    // console.log('--- trap event for' + target.name + ' ---')
    let anim;
    if(target.name === 'Red'){
      this.anims.create({ key: 'trap',  frameRate: 20, frames: this.anims.generateFrameNames('trap-red'), repeat: 4 });
      anim = this.add.sprite(target.sprite.x, target.sprite.y, 'trap-red').play('trap');
    } else {
      this.anims.create({ key: 'trap',  frameRate: 20, frames: this.anims.generateFrameNames('trap-blue'), repeat: 4 });
      anim = this.add.sprite(target.sprite.x, target.sprite.y, 'trap-blue').play('trap');
    }
    target.sprite.alpha = 0;
    
    let scene = this;
    anim.once('animationcomplete', function(){
      anim.destroy();
      scene.redPlayer.reset(0, 2);
      scene.bluePlayer.reset(0, 3);
    }, this);
  }
  
  deathEvent(target){
    // death anim
    console.log('--- death event for' + target.name + ' ---')
    
    this.redPlayer.reset(0, 2);
    this.bluePlayer.reset(0, 3);
  }

  plugEvent(){
    // Two players at the same time or not?
    if(this.redPlayer.plugged && this.bluePlayer.plugged){
      console.log('PLUGGED!')
      
      this.anims.create({ key: 'red-plug',  frameRate: 6, frames: this.anims.generateFrameNames('anime-red'), repeat: 0 });
      this.anims.create({ key: 'blue-plug',  frameRate: 6, frames: this.anims.generateFrameNames('anime-blue'), repeat: 0 });

      this.redPlayer.sprite.alpha = 0;
      this.bluePlayer.sprite.alpha = 0;

      let redAnim = this.add.sprite(this.redPlayer.sprite.x, this.redPlayer.sprite.y, 'anime-red').play('red-plug');
      let rightAnim = this.add.sprite(this.bluePlayer.sprite.x, this.bluePlayer.sprite.y, 'anime-blue').play('blue-plug');

      let scene = this;
      setTimeout(function(){
        redAnim.destroy();
        rightAnim.destroy();
        scene.nextLevel();
      }, 800);
    } else {
      console.log('not good – one character dies')
      
      if(!this.redPlayer.plugged){
        this.deathEvent(this.redPlayer);
      } else if(!this.bluePlayer.plugged){
        this.deathEvent(this.bluePlayer);
      }
      
      this.redPlayer.reset(0, 2);
      this.bluePlayer.reset(0, 3);
    }
  }
  
  tweenComplete(target){
    clearTimeout(this.tweenTimeout);
    let scene = this;
    this.tweenTimeout = setTimeout(function(){
      listensToKeyboard = true;
      scene.fall();
      
      scene.checkForEvents(scene.redPlayer);
      scene.checkForEvents(scene.bluePlayer);
    })
  }
  
  fall(target){
    this.attemptFall(this.redPlayer, 1);
    this.attemptFall(this.bluePlayer, -1);
  }

  move(target, xSpan, ySpan){
    if(ySpan !== 0){
      this.upSound.play();
    } else{
      this.moveSound.play();
    }
    
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
      // if ladder
      if(resultEvent.index == 3 || resultEvent.index == 3 + 2 * tilesWidth){
        this.move(target, xSpan, ySpan);
      }     
   }
  }
  
  attemptFall(target, ySpan){
    let resultFloor = this.map.getTileAt(target.x, target.y, false, 'Floor');
    if(resultFloor){
      // console.log('fall: floor')
      return;
    }
    let resultCollision = this.map.getTileAt(target.x, target.y + ySpan, false, 'Collision');
    if(resultCollision){
      // console.log('fall: collision')
      return;
    } else if ( (target.name == 'Red' && target.y >= 2) || (target.name == 'Blue' && target.y <= 3) ){
      // console.log('too low')
    } else {
      this.move(target, 0, ySpan);
    }
  }
  
  checkForEvents(target){
    let resultEvent = this.map.getTileAt(target.x, target.y, false, 'Event');
    if (resultEvent !== null){
      // special tile
      console.log('Event!', resultEvent.layer.name);
      console.log(resultEvent);  
      
  
      if(resultEvent.index == 2 || resultEvent.index == 2 + 2 * tilesWidth){
        console.log(target.name, 'found the exit')
        target.didPlug();
        
        clearTimeout(this.eventTimeout);
        let scene = this;
        this.eventTimeout = setTimeout(function(){
          scene.plugEvent();
        });
      } else if (resultEvent.index == 6 || resultEvent.index == 6 + 2 * tilesWidth){
        // trap
        this.trapEvent(target);
      } else if (resultEvent.index == 10){
        // bouton
        console.log('Button!!')
        
        this.layerEvent.putTileAt(11, resultEvent.x, resultEvent.y);
      }
    }
  }
  
  attemptMove(target, xSpan, ySpan){
    let result = this.map.getTileAt(target.x + xSpan, target.y + ySpan, false, 'Collision');
    let resultEvent = this.map.getTileAt(target.x + xSpan, target.y + ySpan, false, 'Event');
    
    if (xSpan != 0){ // horizontal movement
      
      // Out of bounds
      if(target.x + xSpan < 0 || target.x + xSpan > 8){
        this.showCollision(target, xSpan, ySpan);
        return;
      }
      
      if(!result){
        this.move(target, xSpan, ySpan);
      } else {
        // collision
        this.showCollision(target, xSpan, ySpan);
        return;
      }
    }else{
      // vertical movement
      if (ySpan < 0 && target.name == 'Red'){
        this.attemptClimb(target, xSpan, ySpan);
      } else if (ySpan > 0 && target.name == 'Blue'){
        this.attemptClimb(target, xSpan, ySpan);
      }
    }
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