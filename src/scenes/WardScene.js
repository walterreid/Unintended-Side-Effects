import Phaser from 'phaser';

export default class WardScene extends Phaser.Scene {
    constructor() {
      super('WardScene');
    }
  
    init(data) {
      this.seed = data.seed || 'default-seed';
    }
  
    create() {
      this.add.text(10, 10, `Awake Layer | Seed: ${this.seed}`, { fontSize: '14px', color: '#fff' });
  
      this.player = this.physics.add.sprite(400, 300, 'player').setScale(0.5);
      this.player.setCollideWorldBounds(true);
  
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    }
  
    update() {
      const speed = 160;
      this.player.setVelocity(0);
  
      if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
      if (this.cursors.right.isDown) this.player.setVelocityX(speed);
      if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
      if (this.cursors.down.isDown) this.player.setVelocityY(speed);
  
      if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
        this.scene.start('DreamScene', { seed: this.seed, x: this.player.x, y: this.player.y });
      }
    }
  }
  