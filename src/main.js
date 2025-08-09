import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import WardScene from './scenes/WardScene.js';
import DreamScene from './scenes/DreamScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    }
  },
  scene: [BootScene, MenuScene, WardScene, DreamScene]
};

new Phaser.Game(config);
