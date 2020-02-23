import Phaser from "phaser";

export class IntroScene extends Phaser.Scene {
  constructor(){
    super({ key: 'TitleScene' })
  }
  
  preload() {
    this.load.image('title', 'sprites/menuPlugged.png');
  }

  create() {
    let title = this.add.sprite(400, 300, 'title').setInteractive();
    
    let scene = this;
    
    title.on('pointerdown', function(){
      scene.scene.start('LevelsScene');
    });
        
    this.input.keyboard.on('keydown', function(e){
      scene.scene.start('LevelsScene');
    }, 1000);

  }
  
}