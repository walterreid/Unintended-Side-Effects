import Phaser from 'phaser';
import { createEnemyData } from '../systems/enemies.js';

export default class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
  }

  init(data) {
    this.seed = data.seed;
    this.entry = data.entry || { x: 400, y: 300 };
  }

  create() {
    this.cameras.main.setBackgroundColor('#220022');
    this.add.text(400, 30, 'Ward Boss', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

    // Player
    this.player = this.physics.add.sprite(this.entry.x, this.entry.y, 'player').setScale(0.5);
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();

    // Boss (simple chaser)
    const bossData = createEnemyData('boss', 400, 180);
    this.boss = this.add.rectangle(bossData.x, bossData.y, 48, 48, bossData.color);
    this.physics.add.existing(this.boss);
    this.bossBody = this.boss.body;
    this.bossBody.setCollideWorldBounds(true);
    this.bossHealth = bossData.health;

    // Basic bullets group
    this.bullets = this.physics.add.group();
    this.input.on('pointerdown', () => this.fireBullet());

    // Collisions
    this.physics.add.overlap(this.bullets, this.boss, (bullet) => {
      bullet.destroy();
      this.bossHealth -= 10;
      if (this.bossHealth <= 0) this.onBossDefeated();
    });
  }

  update(time, delta) {
    const speed = 160;
    this.player.setVelocity(0);
    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    if (this.cursors.right.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
    if (this.cursors.down.isDown) this.player.setVelocityY(speed);

    // Boss chases
    const dx = this.player.x - this.boss.x;
    const dy = this.player.y - this.boss.y;
    const len = Math.hypot(dx, dy) || 1;
    this.bossBody.setVelocity((dx / len) * 80, (dy / len) * 80);
  }

  fireBullet() {
    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
    const bullet = this.bullets.create(this.player.x, this.player.y, null);
    bullet.setCircle(3);
    bullet.setBounce(1, 1);
    bullet.body.setAllowGravity(false);
    bullet.setVelocity(Math.cos(angle) * 600, Math.sin(angle) * 600);
    bullet.lifespan = 800;
    this.time.delayedCall(bullet.lifespan, () => bullet.destroy());
  }

  onBossDefeated() {
    this.scene.start('UIScene', { event: 'bossDefeated', seed: this.seed });
    this.scene.stop('BossScene');
    // Transition responsibility back to ward via event system
    this.events.emit('bossDefeated');
  }
}


