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
      this.layout = generateWardLayout(this.seed, { phase1Line: true });
      this.roomSize = 600; // render 800x600 room; floor drawn separately

      this.layerName = 'Awake';
      this.layerSwapCooldownUntil = 0;
      this.cameras.main.setBackgroundColor('#101418');
      this.add.text(10, 10, `Awake Layer | Seed: ${this.seed}`, { fontSize: '14px', color: '#fff' });

      // Player and stats
      const baseStats = { moveSpeed: 160, projectileSpeed: 600, maxHealth: 100, insightRegenPerMin: 0, weaponSpreadDeg: 0, auditTimerStart: 60 };
      this.traits = rollStartingTraits(this.rng);
      this.stats = applyTraitsToStats(baseStats, this.traits);
      this.health = this.stats.maxHealth;
      this.insight = 0;

      const startX = 400; // center of first room
      const startY = 300;
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

      // Dash state
      this.isDashing = false;
      this.dashUntil = 0;
      this.iFramesUntil = 0;

      // Objects: shards, loot, enemies (minimal spawns as colored rectangles)
      this.roomGraphics = this.add.graphics();
      this.drawCurrentRoom();

      // Doors N/E/S/W
      this.doors = this.physics.add.group();
      this.drawDoors();

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
        this.updateHUD();
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

      // Dash
      if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) && !this.isDashing) {
        this.isDashing = true;
        this.dashUntil = time + 120;
        this.iFramesUntil = time + 300;
        const dir = new Phaser.Math.Vector2(this.player.body.velocity.x, this.player.body.velocity.y).normalize();
        if (dir.lengthSq() === 0) dir.setToPolar(this.input.activePointer.worldX - this.player.x, this.input.activePointer.worldY - this.player.y).normalize();
        this.player.setVelocity(dir.x * (speed * 3), dir.y * (speed * 3));
      }
      if (this.isDashing && time > this.dashUntil) {
        this.isDashing = false;
      }

      // Swap layers with Insight cost and cooldown
      if (Phaser.Input.Keyboard.JustDown(this.keys.Q) && this.insight > 0 && time > this.layerSwapCooldownUntil) {
        this.insight -= 1;
        this.layerName = this.layerName === 'Awake' ? 'Dream' : 'Awake';
        this.layerSwapCooldownUntil = time + 3000;
        this.cameras.main.setBackgroundColor(this.layerName === 'Awake' ? '#101418' : '#2a1f36');
        this.updateHUD();
      }

      // TODO: enemies basic chase later
    }

    roomCenter(id) {
      const [x, y] = id.split(',').map(Number);
      return { x: x * this.roomSize + this.roomSize / 2, y: y * this.roomSize + this.roomSize / 2 };
    }

    drawCurrentRoom() {
      this.roomGraphics.clear();
      // Floor and walls for a single room at screen center 800x600
      this.roomGraphics.fillStyle(0x1c1f24, 1);
      this.roomGraphics.fillRect(0, 0, 800, 600);
      this.roomGraphics.fillStyle(0x000000, 1);
      const t = 16;
      this.roomGraphics.fillRect(0, 0, 800, t);
      this.roomGraphics.fillRect(0, 600 - t, 800, t);
      this.roomGraphics.fillRect(0, 0, t, 600);
      this.roomGraphics.fillRect(800 - t, 0, t, 600);

      // Physical wall bodies (invisible)
      if (!this.walls) {
        this.walls = [
          this.add.rectangle(400, t / 2, 800, t, 0x000000).setAlpha(0.0001),
          this.add.rectangle(400, 600 - t / 2, 800, t, 0x000000).setAlpha(0.0001),
          this.add.rectangle(t / 2, 300, t, 600, 0x000000).setAlpha(0.0001),
          this.add.rectangle(800 - t / 2, 300, t, 600, 0x000000).setAlpha(0.0001)
        ];
        this.walls.forEach(w => this.physics.add.existing(w, true));
        this.physics.add.collider(this.player, this.walls);
      }
    }

    drawDoors() {
      this.doors.clear(true, true);
      const neighbors = [
        { dir: 'W', x: 20, y: 300 },
        { dir: 'E', x: 780, y: 300 },
        { dir: 'N', x: 400, y: 20 },
        { dir: 'S', x: 400, y: 580 }
      ];
      for (const d of neighbors) {
        const unlocked = true; // Phase-1: always unlocked until boss/audit logic layered in
        const color = unlocked ? 0x27ae60 : 0xe74c3c;
        const w = d.dir === 'N' || d.dir === 'S' ? 60 : 20;
        const h = d.dir === 'N' || d.dir === 'S' ? 20 : 60;
        const rect = this.add.rectangle(d.x, d.y, w, h, color);
        this.physics.add.existing(rect, true);
        this.doors.add(rect);
        this.add.text(d.x, d.y - (h / 2) - 12, unlocked ? 'Door (unlocked)' : 'Door (locked)', { fontSize: '12px', color: '#fff' }).setOrigin(0.5);
      }
      this.physics.add.overlap(this.player, this.doors, () => this.transitionRoom());
    }

    transitionRoom() {
      // Phase-1 line: move forward until boss then exit
      const current = this.currentIndex ?? 0;
      const nextIndex = Math.min((current + 1), 5);
      this.currentIndex = nextIndex;
      const id = `${nextIndex},0`;
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.player.setPosition(60, 300);
        this.drawCurrentRoom();
        this.drawDoors();
        this.cameras.main.fadeIn(200, 0, 0, 0);
      });
      if (id === this.layout.bossRoom.id) this.showBeat('Boss ahead…');
      if (id === this.layout.exitRoom.id) this.showBeat('Exit nearby');
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

    updateHUD() {
      if (!this.ui) return;
      const audit = '--:--';
      const loadout = `${this.weapon?.name || 'Unarmed'} | Shards: ${this.collectedShards || 0}/3 | Traits: ${this.traits.join(', ')}`;
      this.ui.events.emit('updateHUD', {
        health: Math.round(this.health),
        insight: Math.floor(this.insight),
        audit,
        loadout,
        layer: this.layerName
      });
    }
  }
  