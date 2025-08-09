import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
      super('BootScene');
    }
  
    preload() {
      // Minimal placeholder assets
      // If files don't exist yet, we generate simple textures instead
      this.add.rectangle(0, 0, 1, 1, 0xffffff).setVisible(false);
      // Generate minimal rectangle texture for player
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x77aaff, 1);
      g.fillRect(0, 0, 20, 20);
      g.generateTexture('player', 20, 20);
    }
  
    create() {
      this.physics.world.gravity.set(0, 0);
      this.scene.start('MenuScene');
    }
  }
  