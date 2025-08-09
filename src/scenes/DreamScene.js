import Phaser from 'phaser';
import { generateWardLayout, createRng } from '../systems/procgen.js';

export default class DreamScene extends Phaser.Scene {
    constructor() {
      super('DreamScene');
    }
  
    init(data) {
      this.seed = data.seed || 'default-seed';
      this.startX = data.x || 400;
      this.startY = data.y || 300;
    }
  
    create() {
      this.rng = createRng(this.seed);
      this.layout = generateWardLayout(this.seed);
      this.roomSize = 480;

      this.cameras.main.setBackgroundColor('#330033');
      this.add.text(10, 10, `Asleep Layer | Seed: ${this.seed}`, { fontSize: '14px', color: '#fff' });

      this.player = this.physics.add.sprite(this.startX, this.startY, 'player').setScale(0.5).setTint(0x9999ff);
      this.player.setCollideWorldBounds(true);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

      this.roomGraphics = this.add.graphics();
      this.drawRooms();
    }
  
    update() {
      const speed = 160;
      this.player.setVelocity(0);
  
      if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
      if (this.cursors.right.isDown) this.player.setVelocityX(speed);
      if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
      if (this.cursors.down.isDown) this.player.setVelocityY(speed);
  
      if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
        this.scene.start('WardScene', { seed: this.seed, x: this.player.x, y: this.player.y });
      }
    }

    roomCenter(id) {
      const [x, y] = id.split(',').map(Number);
      return { x: x * this.roomSize + this.roomSize / 2, y: y * this.roomSize + this.roomSize / 2 };
    }

    drawRooms() {
      this.roomGraphics.clear();
      const color = 0x2a0d2a;
      for (const r of this.layout.rooms) {
        const x = r.x * this.roomSize;
        const y = r.y * this.roomSize;
        this.roomGraphics.fillStyle(color, 1);
        this.roomGraphics.fillRect(x + 2, y + 2, this.roomSize - 4, this.roomSize - 4);
      }
    }
  }
  