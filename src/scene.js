import Phaser from "phaser";
import {Player} from "./player.js";

let listensToKeyboard = true;
let currentLevel = 1;
const maxLevel = 3;
const tilesWidth = 8;

export class LevelsScene extends Phaser.Scene {
  
  preload() {
    
    // Tiled level
    this.load.tilemapTiledJSON('lvl1', 'levels/level1.json');
    this.load.tilemapTiledJSON('lvl2', 'levels/level2.json');
    this.load.tilemapTiledJSON('lvl3', 'levels/level3.json');
    
    // Level tiles
    this.load.image('Tiles', 'sprites/Tiles.png');
    
    // character sprites
    this.load.spritesheet('enemy', 'sprites/spritesheet_caveman.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('red', 'sprites/red.png');
    this.load.image('blue', 'sprites/blue.png');
    this.load.image('background', 'sprites/background.png');
    
    // sound
    this.load.audio('music', [ 'sound/game_jam_v1.mp3' ]);
    this.load.audio('move', [ 'sound/deplacement.wav' ]);
    
    this.tweenTimeout = null;
    this.eventTimeout = null;
  }

  loadLevel(){
    this.map = this.make.tilemap({ key: `lvl${currentLevel}` });
    let tileset = this.map.addTilesetImage('Tiles');
    let layerCollision = this.map.createStaticLayer('Collision', tileset, 0, 0);
    let layerEvent = this.map.createStaticLayer('Event', tileset, 0, 0);
    let layerFloor = this.map.createStaticLayer('Floor', tileset, 0, 0);
    layerCollision.depth = -10;
    layerEvent.depth = -5;
    
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
    /*const redBackground = this.add.rectangle(400, 150, 800, 300, 0xccaaaa);
    const greenBackground = this.add.rectangle(400, 450, 800, 300, 0xaaaacc);
    redBackground.depth = -15;
    greenBackground.depth = -15;*/
    
    const background = this.add.sprite(400, 300, 'background');
    background.alpha = 0.5;
    background.depth = -15;
    
    const cursors = this.input.keyboard.createCursorKeys();
    
    this.loadLevel()

    // Sound FX
    this.moveSound = this.sound.add('move');
    
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
  
  deathEvent(){
    // death anim
    
    this.redPlayer.reset(0, 2);
    this.bluePlayer.reset(0, 3);
  }

  plugEvent(){
    console.log('PLUG EVENT !!')
    if(this.redPlayer.plugged && this.bluePlayer.plugged){
      // yeah!
      console.log('yeah.')
      this.nextLevel();
    } else {
      console.log('not good')
      alert('Argh. Not plugged together. Start again')
      this.redPlayer.reset(0, 2);
      this.bluePlayer.reset(0, 3);
      // not good
    }
    // Two players at the same time or not?
    
    // TODO: animation
    // sprite.animations.add('walk');
    // sprite.animations.play('walk', 50, true);
    // this.add.tween(sprite).to({ x: this.width }, 10000, Phaser.Easing.Linear.None, true);
  }
  
  tweenComplete(target){
    console.log('tween complete')
    
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
      // if ladder
      if(resultEvent.index == 3 || resultEvent.index == 3 + 2 * tilesWidth){
        this.move(target, xSpan, ySpan);
      }     
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
        this.deathEvent();
      } else if (resultEvent.index == 10){
        // bouton
        console.log('Button!!')
      }
    }
  }
  
  attemptMove(target, xSpan, ySpan){
    let result = this.map.getTileAt(target.x + xSpan, target.y + ySpan, false, 'Collision');
    let resultEvent = this.map.getTileAt(target.x + xSpan, target.y + ySpan, false, 'Event');
    
    if (xSpan != 0){
      // horizontal movement
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