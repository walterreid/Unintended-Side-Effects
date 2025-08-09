import Phaser from 'phaser';
import { loadLastSeed } from '../systems/save.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
      super('MenuScene');
    }
  
    create() {
      this.add.text(400, 200, 'Unintended Side Effects: Night Shift', { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
  
      this.add.text(400, 300, 'Enter Seed:', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
  
      // Simple HTML input overlay
      const input = document.createElement('input');
      input.type = 'text';
      input.style.position = 'absolute';
      input.style.left = '50%';
      input.style.top = '55%';
      input.style.transform = 'translate(-50%, -50%)';
      input.style.fontSize = '16px';
      document.body.appendChild(input);
  
      const lastSeed = loadLastSeed();
      if (lastSeed) input.value = lastSeed;

      const startButton = this.add.text(400, 400, '[ Start Run ]', { fontSize: '18px', color: '#0f0' })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
          const seed = input.value.trim() || Math.random().toString(36).substring(2, 8);
          document.body.removeChild(input);
          this.scene.start('StoryScene', { seed });
        });
    }
  }
  