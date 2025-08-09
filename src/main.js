import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import StoryScene from './scenes/StoryScene.js';
import WardScene from './scenes/WardScene.js';
import DreamScene from './scenes/DreamScene.js';
import BossScene from './scenes/BossScene.js';
import UIScene from './scenes/UIScene.js';

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
  scene: [BootScene, MenuScene, StoryScene, WardScene, DreamScene, BossScene, UIScene]
};

new Phaser.Game(config);
