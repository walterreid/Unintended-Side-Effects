import Phaser from 'phaser';
import { generateWardLayout, createRng } from '../systems/procgen.js';
import { WeaponKind, createWeapon, generateProjectiles } from '../systems/weapons.js';
import { rollStartingTraits, applyTraitsToStats } from '../systems/traits.js';
import { saveSeed } from '../systems/save.js';

export default class WardScene extends Phaser.Scene {
    constructor() {
      super('WardScene');
    }
  
    init(data) {
      this.seed = data.seed || 'default-seed';
      saveSeed(this.seed);
    }
  
    create() {
      // Layout
      this.rng = createRng(this.seed);
      this.layout = generateWardLayout(this.seed);
      this.roomSize = 480;

      this.cameras.main.setBackgroundColor('#101418');
      this.add.text(10, 10, `Awake Layer | Seed: ${this.seed}`, { fontSize: '14px', color: '#fff' });

      // Player and stats
      const baseStats = { moveSpeed: 160, projectileSpeed: 600, maxHealth: 100, insightRegenPerMin: 0, weaponSpreadDeg: 0, auditTimerStart: 60 };
      this.traits = rollStartingTraits(this.rng);
      this.stats = applyTraitsToStats(baseStats, this.traits);
      this.health = this.stats.maxHealth;
      this.insight = 0;

      const startX = this.layout.playerStart.x * this.roomSize + this.roomSize / 2;
      const startY = this.layout.playerStart.y * this.roomSize + this.roomSize / 2;
      this.player = this.physics.add.sprite(startX, startY, 'player').setScale(0.5);
      this.player.setCollideWorldBounds(true);

      // Controls
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        Q: Phaser.Input.Keyboard.KeyCodes.Q,
        E: Phaser.Input.Keyboard.KeyCodes.E,
        SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
      });

      // Weapons
      this.weapon = createWeapon(WeaponKind.MoodStabilizer);
      this.nextFireAt = 0;
      this.bullets = this.physics.add.group();
      this.input.on('pointerdown', () => (this.isFiring = true));
      this.input.on('pointerup', () => (this.isFiring = false));

      // Objects: shards, loot, enemies (minimal spawns as colored rectangles)
      this.roomGraphics = this.add.graphics();
      this.drawRooms();

      this.shards = this.physics.add.group();
      for (const l of this.layout.loot.filter(l => l.type === 'shard')) {
        const { x, y } = this.roomCenter(l.roomId);
        const shard = this.add.circle(x, y, 8, 0x66ccff);
        this.physics.add.existing(shard);
        this.shards.add(shard);
      }

      this.physics.add.overlap(this.player, this.shards, (player, shard) => {
        shard.destroy();
        this.collectedShards = (this.collectedShards || 0) + 1;
        this.showBeat(`Coping Shard ${this.collectedShards}/3`);
        if (this.collectedShards >= 3) this.spawnBossDoor();
      });

      this.enemies = this.physics.add.group();
      for (const e of this.layout.enemies) {
        const { x, y } = this.roomCenter(e.roomId);
        for (let i = 0; i < e.count; i++) {
          const rect = this.add.rectangle(x + (Math.random() * 40 - 20), y + (Math.random() * 40 - 20), 18, 18, 0xff5555);
          this.physics.add.existing(rect);
          this.enemies.add(rect);
        }
      }

      // Simple bullet-enemy collisions
      this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
        bullet.destroy();
        enemy.destroy();
      });

      // UI
      if (!this.scene.isActive('UIScene')) this.scene.launch('UIScene', { seed: this.seed });
      this.ui = this.scene.get('UIScene');
      this.updateHUD();
    }
  
    update(time, delta) {
      const dt = delta / 1000;
      this.player.setVelocity(0);
      const speed = this.stats.moveSpeed;
      if (this.cursors.left.isDown || this.keys.A.isDown) this.player.setVelocityX(-speed);
      if (this.cursors.right.isDown || this.keys.D.isDown) this.player.setVelocityX(speed);
      if (this.cursors.up.isDown || this.keys.W.isDown) this.player.setVelocityY(-speed);
      if (this.cursors.down.isDown || this.keys.S.isDown) this.player.setVelocityY(speed);

      // Fire weapon
      if (this.isFiring && time >= this.nextFireAt) {
        const pointer = this.input.activePointer;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
        const rng = this.rng;
        const bullets = generateProjectiles({ x: this.player.x, y: this.player.y }, angle, this.weapon, rng);
        for (const b of bullets) {
          const bullet = this.bullets.create(b.x, b.y, null);
          bullet.setCircle(b.radius);
          bullet.body.setAllowGravity(false);
          bullet.setVelocity(b.vx, b.vy);
          this.time.delayedCall(b.lifetimeMs, () => bullet.destroy());
        }
        this.nextFireAt = time + this.weapon.fireRateMs;
      }

      // Swap layers
      if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
        this.scene.start('DreamScene', { seed: this.seed, x: this.player.x, y: this.player.y });
      }

      // TODO: enemies basic chase later
    }

    roomCenter(id) {
      const [x, y] = id.split(',').map(Number);
      return { x: x * this.roomSize + this.roomSize / 2, y: y * this.roomSize + this.roomSize / 2 };
    }

    drawRooms() {
      this.roomGraphics.clear();
      const color = 0x1e2630;
      for (const r of this.layout.rooms) {
        const x = r.x * this.roomSize;
        const y = r.y * this.roomSize;
        this.roomGraphics.fillStyle(color, 1);
        this.roomGraphics.fillRect(x + 2, y + 2, this.roomSize - 4, this.roomSize - 4);
      }
    }

    showBeat(text) {
      const t = this.add.text(this.player.x, this.player.y - 40, text, { fontSize: '14px', color: '#fff' }).setOrigin(0.5);
      this.tweens.add({ targets: t, alpha: 0, y: t.y - 30, duration: 900, onComplete: () => t.destroy() });
    }

    spawnBossDoor() {
      const { x, y } = this.roomCenter(this.layout.bossRoom.id);
      const door = this.add.rectangle(x, y, 24, 48, 0x33ff33);
      this.physics.add.existing(door);
      this.physics.add.overlap(this.player, door, () => {
        this.scene.start('BossScene', { seed: this.seed, entry: { x, y } });
      });
      this.showBeat('The ward boss stirs…');
    }
  }
  