import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);

let listensToKeyboard = true;

var redGuy, blackGuy;

function preload() {
  
  // Tiled level
  this.load.tilemapTiledJSON('map', 'levels/level.json');
  this.load.tilemapTiledJSON('map2', 'levels/level2.json');
  
  // Level tiles
  this.load.image('Tiles_x1', 'sprites/Tiles_x1.png');
  
  // character sprites
  this.load.spritesheet('enemy', 'sprites/spritesheet_caveman.png', { frameWidth: 32, frameHeight: 32 });
  
  // sound
  this.load.audio('move', [ 'sound/Simple_Whoosh.wav' ]);
  
  // this.load.audio('music', [ 'bass.ogg', 'bass.mp3' ]);
}

function nextLevel(scene){
  scene.map.removeAllLayers(); // dirty
  scene.map = scene.make.tilemap({ key: 'map2' });
  var tileset = scene.map.addTilesetImage('Tiles_x1');
  var layer = scene.map.createStaticLayer(0, tileset, 0, 0);
}

function create() {
  const redBackground = this.add.rectangle(400, 150, 800, 300, 0xcc0000);
  const greenBackground = this.add.rectangle(400, 450, 800, 300, 0x0000cc);
  const cursors = this.input.keyboard.createCursorKeys();
  
  const mapGroup = this.add.group({defaultKey: 'mapGroup'})
  
  // var map = this.make.tilemap({ key: 'map' });
  // var tileset = map.addTilesetImage('Tiles_x1');
  // var layer = map.createDynamicLayer(0, tileset, 0, 0);
  this.map = this.make.tilemap({ key: 'map' });
  var tileset = this.map.addTilesetImage('Tiles_x1');
  var layer = this.map.createDynamicLayer(0, tileset, 0, 0);
  
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
    console.log('ok')
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