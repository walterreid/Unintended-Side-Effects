export default class BootScene extends Phaser.Scene {
    constructor() {
      super('BootScene');
    }
  
    preload() {
      // Minimal placeholder assets
      this.load.image('player', 'assets/sprites/player.png'); // placeholder box
    }
  
    create() {
      this.scene.start('MenuScene');
    }
  }
  